import { Request, Response } from "express";
import { pool } from "../db/db";
import generateId from "../utils/generateId";
import { addParticipant, getFormatedTournamentsByIds, tournamentExists } from "../services/tournamentServices";
import { notifyClients } from "../websocket/websocketServer";
import { User } from "../types/userType";

export const createTournament = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    let id: string;
    let exists = true;

    do {
      id = generateId();
      exists = await tournamentExists(id);
    } while (exists);

    await pool.query(
      "INSERT INTO tournaments (id, owner_id, status, created_at) VALUES (?, ?, 'open', DATETIME('now'))",
      [id, userId]
    );

    await addParticipant(id, userId);

    return res.json({
      success: true,
      tournamentId: id,
    });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
};

export const leaveTournament = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { tournamentId } = req.body;

  if (!tournamentId) {
    return res.json({
      success: false,
      errorMessage: "Tournament ID is required",
    });
  }

  try {
    // Check if the user is in the tournament and get their sushi_count
    const [rows] = await pool.query<any[]>(
      "SELECT sushi_count FROM participants WHERE user_id = ? AND tournament_id = ?",
      [userId, tournamentId]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        errorMessage: "User is not a participant in this tournament",
      });
    }

    const { sushi_count } = rows[0];
    let tournamentDeleted = false;

    // Check if user is owner
    const [tournamentRows] = await pool.query<any[]>(
      "SELECT owner_id FROM tournaments WHERE id = ?",
      [tournamentId]
    );
    const isOwner = tournamentRows.length > 0 && tournamentRows[0].owner_id === userId;

    if (sushi_count > 0) {
      // If sushi_count > 0, set status to 'left'
      await pool.query(
        "UPDATE participants SET status = 'left' WHERE user_id = ? AND tournament_id = ?",
        [userId, tournamentId]
      );
    } else {
      // If sushi_count is 0, delete the participant record
      await pool.query(
        "DELETE FROM participants WHERE user_id = ? AND tournament_id = ?",
        [userId, tournamentId]
      );

      // Check if there are any participants left OR if the owner was the one who left
      const [remainingParticipants] = await pool.query<any[]>(
        "SELECT COUNT(*) as count FROM participants WHERE tournament_id = ?",
        [tournamentId]
      );

      if (remainingParticipants[0].count === 0 || isOwner) {
        await pool.query(
          "DELETE FROM tournaments WHERE id = ?",
          [tournamentId]
        );
        tournamentDeleted = true;
      }
    }

    console.log(`[Tournaments] Participant leaving tournament ${tournamentId}. User: ${userId}`);
    notifyClients('update');

    return res.json({
      success: true,
      message: tournamentDeleted 
        ? "Tournament deleted because no participants remained" 
        : (sushi_count > 0 ? "Participant status set to left" : "Participant removed from tournament"),
      tournamentDeleted
    });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
};

export const joinTournament = async (req: Request, res: Response) => {
  const { tournamentId } = req.body;
  const userId = (req as any).user.id;

  try {
    const exist = await tournamentExists(tournamentId);
    if (!exist) {
      return res.json({
        success: false,
        errorMessage: "Tournament not found",
      });
    }

    const resAddParticipant = await addParticipant(tournamentId, userId);
    if (!resAddParticipant.success) {
      return res.json(resAddParticipant);
    }

    console.log(`[Tournaments] User ${userId} joined tournament ${tournamentId}`);
    notifyClients('join');

    return res.json({
      success: true,
      tournamentId,
    });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
};

export const getTournament = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query<any[]>(
      "SELECT id, owner_id, status, strftime('%Y-%m-%dT%H:%M:%SZ', created_at) as created_at FROM tournaments WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        errorMessage: "El torneo no existe",
      });
    }

    const tournament = rows[0];

    const [participantsRows] = await pool.query<any[]>(
      "SELECT user_id, sushi_count, status FROM participants WHERE tournament_id = ?",
      [tournament.id]
    );

    const participants = await Promise.all(
      participantsRows.map(async (participant: any) => {
        const [userRows] = await pool.query<any[]>(
          "SELECT name FROM users WHERE id = ?", // Corrected to join by id
          [participant.user_id]
        );

        const user = userRows[0];

        return {
          name: user.name,
          sushiCount: participant.sushi_count,
          status: participant.status,
        };
      })
    );

    return res.json({
      success: true,
      tournament: {
        id: tournament.id,
        creator: tournament.owner_id,
        createdAt: tournament.created_at,
        participants,
      },
    });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
};

export const getUserTournaments = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const [tournamentsIds] = await pool.query<any[]>(`
      SELECT t.id
      FROM tournaments t
      WHERE t.id IN (
        SELECT p.tournament_id
        FROM participants p
        WHERE p.user_id = ?
      )
    `, [userId]);
    
    const idList = tournamentsIds.map(row => row.id as string);
    if (idList.length === 0) {
      return res.json({ success: true, tournaments: [] });
    }
    const result = await getFormatedTournamentsByIds(idList);
    if (!result.success) return res.json(result);
    return res.json({ success: true, tournaments: result.tournaments });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
};

export const getActiveUserTournaments = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const [tournamentsIds] = await pool.query<any[]>(`
      SELECT t.id
      FROM tournaments t
      WHERE t.id IN (
        SELECT p.tournament_id
        FROM participants p
        WHERE p.user_id = ? AND p.status != 'left'
      )
    `, [userId]);
    
    const idList = tournamentsIds.map(row => row.id as string);
    if (idList.length === 0) {
      return res.json({ success: true, tournaments: [] });
    }
    const result = await getFormatedTournamentsByIds(idList);
    if (!result.success) return res.json(result);
    return res.json({ success: true, tournaments: result.tournaments });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  const { id, status } = req.body;

  if (!id || !status) {
    return res.json({
      success: false,
      errorMessage: "Faltan datos necesarios (usuario, torneo o puntuación)",
    });
  }

  try {
    await pool.query(
      "UPDATE tournaments SET status = ? WHERE id = ?",
      [status, id]
    );

    console.log(`[Tournaments] Status updated for tournament ${id} to ${status}`);
    notifyClients('update');

    return res.json({
      success: true,
      tournamentId: id
    });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
};

export const updateCount = async (req: Request, res: Response) => {
  const { sushiCount } = req.body;
  const userId = (req as any).user.id;

  if (sushiCount === undefined) {
    return res.json({
      success: false,
      errorMessage: "Miss count",
    });
  }

  try {
    await pool.query(`
      UPDATE participants
      SET sushi_count = ?
      WHERE user_id = ?
      AND tournament_id IN (
        SELECT id FROM tournaments WHERE status = 'open'
      );
      `,
      [sushiCount, userId]
    );

    console.log(`[Tournaments] Count updated for user ${userId} to ${sushiCount}`);
    notifyClients('update');

    return res.json({
      success: true,
      tournamentId: ''
    });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
};

export const hasActiveTournament = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const [tournamentsIds] = await pool.query<any[]>(`
      SELECT t.id
      FROM tournaments t
      WHERE t.id IN (
        SELECT p.tournament_id
        FROM participants p
        WHERE p.user_id = ?
      ) AND status= 'open'
    `, [userId]);

    if (tournamentsIds.length === 0) {
      return res.json({
        success: false,
        errorMessage: "There is no tournaments",
      });
    }

    return res.json({
      success: true,
      tournamentsIds,
    });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
};

export const deleteTournament = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  try {
    await pool.query(`
      DELETE FROM tournaments
      WHERE id = ? AND status = 'open' AND owner_id = ?
    `, [id, userId]);

    console.log(`[Tournaments] Tournament ${id} deleted by owner ${userId}`);
    notifyClients('delete');

    return res.json({
      success: true,
      tournamentId: id,
    });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
};
