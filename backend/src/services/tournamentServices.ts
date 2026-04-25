import type { Response } from '../types/responseType';
import type { PublicParticipant, PublicTournament, Tournament } from "../types/tournamentTypes";
import { pool } from "../db/db";
import { getUserName } from "../services/userSevices";

async function addParticipant(tournamentId: string, userId: string): Promise<Response> {
  const [existing] = await pool.query<any[]>(
    "SELECT * FROM participants WHERE tournament_id = ? AND user_id = ?",
    [tournamentId, userId]
  );
  
  if (existing.length > 0) {
    const participant = existing[0];
    if (participant.status === 'left') {
      await pool.query(
        "UPDATE participants SET status = 'active' WHERE tournament_id = ? AND user_id = ?",
        [tournamentId, userId]
      );
      return {success: true, participant: {tournamentId, userId, sushiCount: participant.sushi_count, status: 'active'} as PublicParticipant};
    }
    return {success: false, errorMessage: "The user is already in the tournament."};
  }

  await pool.query(
    "INSERT INTO participants (tournament_id, user_id, sushi_count, status) VALUES (?, ?, 0, 'active')",
    [tournamentId, userId]
  );
  return {success: true, participant: {tournamentId, userId, sushiCount: 0, status: 'active'} as PublicParticipant};
}

async function leaveTournamentService(userId: string, tournamentId: string): Promise<{ success: boolean; message?: string; action?: 'delete' | 'update' | 'none'; errorMessage?: string }> {
  try {
    // 1. Verify user is in tournament
    const [rows] = await pool.query<any[]>(
      "SELECT sushi_count, status FROM participants WHERE user_id = ? AND tournament_id = ?",
      [userId, tournamentId]
    );

    if (rows.length === 0) {
      return { success: false, errorMessage: "User is not a participant in this tournament" };
    }

    // 2. Set status to 'left' immediately
    await pool.query(
      "UPDATE participants SET status = 'left' WHERE user_id = ? AND tournament_id = ?",
      [userId, tournamentId]
    );

    // 3. Check if user was owner
    const [tournamentRows] = await pool.query<any[]>(
      "SELECT owner_id FROM tournaments WHERE id = ?",
      [tournamentId]
    );

    // If tournament doesn't exist (already deleted), just return success
    if (tournamentRows.length === 0) {
      return { success: true, message: "Left tournament successfully (tournament was deleted)", action: 'delete' };
    }

    const isOwner = tournamentRows[0].owner_id === userId;

    if (isOwner) {
      let transferred = false;
      const MAX_ATTEMPTS = 5;

      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        // Find new owner among active participants (excluding self who is already 'left')
        const [candidates] = await pool.query<any[]>(
          "SELECT user_id FROM participants WHERE tournament_id = ? AND user_id != ? AND status != 'left' ORDER BY sushi_count DESC LIMIT 1",
          [tournamentId, userId]
        );

        if (candidates.length === 0) {
          // No candidates found
          break;
        }

        const newOwnerId = candidates[0].user_id;

        // Atomic Update: Transfer ONLY if candidate is still active
        const [result] = await pool.query<any>(
          `UPDATE tournaments 
           SET owner_id = ? 
           WHERE id = ? 
           AND EXISTS (
             SELECT 1 FROM participants 
             WHERE user_id = ? 
             AND tournament_id = ? 
             AND status != 'left'
           )`,
          [newOwnerId, tournamentId, newOwnerId, tournamentId]
        );

        if (result && result.changes > 0) {
          transferred = true;
          break;
        }
      }

      if (!transferred) {
        // No active participants to take over.
        await pool.query("DELETE FROM tournaments WHERE id = ?", [tournamentId]);
        return {
          success: true,
          message: "Tournament deleted because owner left and no active participants remained",
          action: 'delete'
        };
      }
    }

    // 4. Final Safety Check: Ensure tournament is not empty
    // This handles cases where the owner might be invalid/left (zombie tournament)
    // or if the last active participant leaves (and wasn't the owner).
    const [activeParticipants] = await pool.query<any[]>(
      "SELECT count(*) as count FROM participants WHERE tournament_id = ? AND status != 'left'",
      [tournamentId]
    );

    if (activeParticipants[0].count === 0) {
      // Double check if tournament still exists before trying to delete
      const [stillExists] = await pool.query<any[]>("SELECT id FROM tournaments WHERE id = ?", [tournamentId]);
      if (stillExists.length > 0) {
        await pool.query("DELETE FROM tournaments WHERE id = ?", [tournamentId]);
        return {
          success: true,
          message: "Tournament deleted because no active participants remained",
          action: 'delete'
        };
      }
    }

    return {
      success: true,
      message: "Left tournament successfully",
      action: 'update'
    };

  } catch (err: any) {
    return { success: false, errorMessage: err.message };
  }
}


async function getFormatedTournamentsByIds(idList: string[]): Promise<Response> {
    try {
        if (idList.length === 0) return { success: true, tournaments: [] };

        const placeholders = idList.map(() => '?').join(', ');

        // Obtener los participantes
        const [participants] = await pool.query<any[]>(
            `SELECT user_id, tournament_id, sushi_count, status FROM participants WHERE tournament_id IN (${placeholders}) AND NOT (status = 'left' AND sushi_count = 0)`,
            idList
        );

        if (participants.length === 0) {
            return { success: false, errorMessage: "No participants found" };
        }

        // Formatear los participantes
        const formatedParticipants: PublicParticipant[] = [];
        await Promise.all(
            participants.map(async (participant) => {
                const res = await getUserName(participant.user_id);
                if (res.success) {
                    formatedParticipants.push({
                        userId: participant.user_id,
                        userName: res.name,
                        tournamentId: participant.tournament_id,
                        sushiCount: participant.sushi_count,
                        status: participant.status,
                    });
                }
            })
        );

        // Obtener los torneos
        const [tournaments] = await pool.query<any[]>(
            `SELECT id, owner_id, status, strftime('%Y-%m-%dT%H:%M:%SZ', created_at) as created_at FROM tournaments WHERE id IN (${placeholders})`,
            idList
        );

        if (tournaments.length === 0) {
            return { success: false, errorMessage: "No tournaments found" };
        }

        // Formatear los torneos
        const formatedTournaments: PublicTournament[] = [];
        await Promise.all(
            tournaments.map(async (tournament) => {
                const res = await getUserName(tournament.owner_id);
                if (res.success) {
                    const currentParticipants: PublicParticipant[] = formatedParticipants.filter(
                        p => p.tournamentId === tournament.id
                    );
                    formatedTournaments.push({
                        id: tournament.id,
                        ownerId: tournament.owner_id,
                        ownerName: res.name,
                        status: tournament.status,
                        createdAt: tournament.created_at,
                        participants: currentParticipants
                    });
                }
            })
        );

        return { success: true, tournaments: formatedTournaments };
    } catch (error: any) {
        return {
            success: false,
            errorMessage: error.message,
        };
    }
}

// Función para verificar si un torneo existe
async function tournamentExists(id: string): Promise<boolean> {
    const [rows] = await pool.query<any[]>(
        "SELECT id FROM tournaments WHERE id = ? LIMIT 1",
        [id]
    );
    return (rows as Tournament[]).length > 0;
}


export { getFormatedTournamentsByIds, tournamentExists, addParticipant, leaveTournamentService };