import type { Response } from '../types/responseType';
import { RowDataPacket } from "mysql2";
import type { PublicParticipant, PublicTournament, Tournament } from "../types/tournamentTypes";
import { pool } from "../db";
import { getUserName, getUsers } from "../services/userSevices";

// Función para agregar un participante
async function addParticipant(tournamentId: string, userCode: string): Promise<boolean> {
  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM participants WHERE tournament = ? AND user = ?",
    [tournamentId, userCode]
  );
  if (existing.length > 0) return false;

  await pool.query(
    "INSERT INTO participants (tournament, user) VALUES (?, ?)",
    [tournamentId, userCode]
  );
  return true;
}


async function getFormatedTournamentsByIds(idList: string[]): Promise<Response> {
    try {
        // Obtener los participantes
        const [participants] = await pool.query<RowDataPacket[]>(
            "SELECT user, tournament, sushi_count FROM participants WHERE tournament IN (?)",
            [idList]
        );

        if (participants.length === 0) {
            return { success: false, errorMessage: "No participants found" };
        }

        // Formatear los participantes
        const formatedParticipants: PublicParticipant[] = [];
        await Promise.all(
            participants.map(async (participant) => {
                const res = await getUserName(participant.user);
                if (res.success) {
                    formatedParticipants.push({
                        name: res.name,
                        sushiCount: participant.sushi_count,
                        tournament: participant.tournament
                    });
                }
            })
        );

        // Obtener los torneos
        const [tournaments] = await pool.query<RowDataPacket[]>(
            "SELECT id, creator, status, created_at FROM tournaments WHERE id IN (?)",
            [idList]
        );

        if (tournaments.length === 0) {
            return { success: false, errorMessage: "No tournaments found" };
        }

        // Formatear los torneos
        const formatedTournaments: PublicTournament[] = [];
        await Promise.all(
            tournaments.map(async (tournament) => {
                const res = await getUserName(tournament.creator);
                if (res.success) {
                    const currentParticipants: PublicParticipant[] = formatedParticipants.filter(
                        p => p.tournament === tournament.id
                    );
                    formatedTournaments.push({
                        id: tournament.id,
                        creator: res.name,
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