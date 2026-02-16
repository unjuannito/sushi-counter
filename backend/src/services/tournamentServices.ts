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


export { getFormatedTournamentsByIds, tournamentExists, addParticipant };