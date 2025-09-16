import type { Response } from '../types/responseType';
import { RowDataPacket } from "mysql2";
import type { PublicParticipant, PublicTournament, Tournament } from "../types/tournamentTypes";
import { pool } from "../db";
import { getUserName, getUsers } from "../services/userSevices";

async function addParticipant(tournamentId: string, userId: string): Promise<Response> {
  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM participants WHERE tournament_id = ? AND user_id = ?",
    [tournamentId, userId]
  );
  if (existing.length > 0) return {success: false, errorMessage: "The user is already in the tournament."};

  await pool.query(
    "INSERT INTO participants (tournament_id, user_id) VALUES (?, ?)",
    [tournamentId, userId]
  );
  return {success: true, participant: {tournamentId, userId, sushiCount: 0} as PublicParticipant};
}


async function getFormatedTournamentsByIds(idList: string[]): Promise<Response> {
    try {
        // Obtener los participantes
        const [participants] = await pool.query<RowDataPacket[]>(
            "SELECT user_id, tournament_id, sushi_count FROM participants WHERE tournament_id IN (?)",
            [idList]
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
                    });
                }
            })
        );

        // Obtener los torneos
        const [tournaments] = await pool.query<RowDataPacket[]>(
            "SELECT id, owner_id, status, created_at FROM tournaments WHERE id IN (?)",
            [idList]
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
    const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM tournaments WHERE id = ? LIMIT 1",
        [id]
    );
    return (rows as Tournament[]).length > 0;
}


export { getFormatedTournamentsByIds, tournamentExists, addParticipant };