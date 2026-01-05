import { Request, Response } from "express";
import { pool } from "../db/db";
import generateId from "../utils/generateId";
import { addParticipant, getFormatedTournamentsByIds, tournamentExists } from "../services/tournamentServices";
import { notifyClients } from "../websocket/websocketServer";
import { User } from "../types/userType";
import { getUserByCode } from "../services/userSevices";

export const createTournament = async (req: Request, res: Response) => {
  const { userCode } = req.body;
  const reqUser = await getUserByCode(userCode);
  if (!reqUser.success || !reqUser.user) {
    return res.json({
      success: false,
      errorMessage: "User not valid.",
    });
  }
  const user: User = reqUser.user;

  try {
    let id: string;
    let exists = true;

    do {
      id = generateId();
      exists = await tournamentExists(id);
    } while (exists);

    await pool.query(
      "INSERT INTO tournaments (id, owner_id) VALUES (?, ?)",
      [id, user.id]
    );

    await addParticipant(id, user.id);

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

export const joinTournament = async (req: Request, res: Response) => {
  const { userCode, tournamentId } = req.body;
  const reqUser = await getUserByCode(userCode);
  if (!reqUser.success || !reqUser.user) {
    return res.json({
      success: false,
      errorMessage: "User not valid.",
    });
  }
  const user: User = reqUser.user;

  try {
    const exist = await tournamentExists(tournamentId);
    if (!exist) {
      return res.json({
        success: false,
        errorMessage: "Tournament not found",
      });
    }

    const resAddParticipant = await addParticipant(tournamentId, user.id);
    if (!resAddParticipant.success) {
      return res.json(resAddParticipant);
    }

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
      "SELECT * FROM tournaments WHERE id = ? LIMIT 1",
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
      "SELECT user_id, sushi_count FROM participants WHERE tournament_id = ?",
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
  const { userCode } = req.params;
  const reqUser = await getUserByCode(userCode);
  if (!reqUser.success || !reqUser.user) {
    return res.json({
      success: false,
      errorMessage: "User not valid.",
    });
  }
  const user: User = reqUser.user;

  try {
    const [tournamentsIds] = await pool.query<any[]>(`
      SELECT t.id
      FROM tournaments t
      WHERE t.id IN (
        SELECT p.tournament_id
        FROM participants p
        WHERE p.user_id = ?
      )
    `, [user.id]);
    
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
  const { userCode, sushiCount } = req.body;
  const reqUser = await getUserByCode(userCode);
  if (!reqUser.success || !reqUser.user) {
    return res.json({
      success: false,
      errorMessage: "User not valid.",
    });
  }
  const user: User = reqUser.user;

  if (!user || sushiCount === undefined) {
    return res.json({
      success: false,
      errorMessage: "Miss user or count",
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
      [sushiCount, user.id]
    );

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
  const { userCode } = req.params;
  try {
    const [tournamentsIds] = await pool.query<any[]>(`
      SELECT t.id
      FROM tournaments t
      WHERE t.id IN (
        SELECT p.tournament_id
        FROM participants p
        WHERE p.user_id = ?
      ) AND status= 'open'
    `, [userCode]);

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
  const { id, userCode } = req.params;
  const reqUser = await getUserByCode(userCode);
  if (!reqUser.success || !reqUser.user) {
    return res.json({
      success: false,
      errorMessage: "User not valid.",
    });
  }
  const user: User = reqUser.user;

  try {
    await pool.query(`
      DELETE FROM tournaments
      WHERE id = ? AND status = 'open' AND owner_id = ?
    `, [id, user.id]);

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
