import { Router } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../db";
import generateId from "../utils/generateId";
import { addParticipant, getFormatedTournamentsByIds, tournamentExists } from "../services/tournamentServices";
import type { Response } from '../types/responseType';
import { format } from "path";
import { notifyClients } from "../websocket/websocketServer"; // Asegúrate de que la función esté exportada correctamente
import { User } from "../types/userType";
import { getUserByCode } from "../services/userSevices";

export const tournamentsRouter = Router();

// Crear torneo
tournamentsRouter.post("/create", async (req, res) => {
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
});

// Unirse a torneo
tournamentsRouter.post("/join", async (req, res) => {
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
});

// Obtener datos del torneo
tournamentsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
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

    const [participantsRows] = await pool.query<RowDataPacket[]>(
      "SELECT user_id, sushi_count FROM participants WHERE tournament_id = ?",
      [tournament.id]
    );

    const participants = await Promise.all(
      participantsRows.map(async (participant: RowDataPacket) => {
        const [userRows] = await pool.query<RowDataPacket[]>(
          "SELECT name FROM users WHERE code = ?",
          [participant.user]
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
        creator: tournament.creator,
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
});

//obtener torneos de un usuario
tournamentsRouter.get("/user/:userCode", async (req, res) => {
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
    // Obtener todos los torneos donde participa el usuario
    const [tournamentsIds] = await pool.query<RowDataPacket[]>(`
      SELECT t.id
      FROM tournaments t
      WHERE t.id IN (
        SELECT p.tournament_id
        FROM participants p
        WHERE p.user_id = ?
      )
    `, [user.id]);
    
    //convertir tournamentsIds a list de strings
    const idList = tournamentsIds.map(row => row.id as string);
    if (idList.length === 0) {
      return res.json({ success: true, tournaments: [] });
    }
    // Obtener los torneos formateados
    const result = await getFormatedTournamentsByIds(idList);
    if (!result.success) return res.json(result);
    return res.json({ success: true, tournaments: result.tournaments });
  } catch (err: any) {
    return res.json({
      success: false,
      errorMessage: err.message,
    });
  }
});

// Cambiar puntuación de un participante en todos sus torneos activos
tournamentsRouter.post("/update-status", async (req, res) => {
  const { id, status } = req.body;

  if (!id || !status) {
    return res.json({
      success: false,
      errorMessage: "Faltan datos necesarios (usuario, torneo o puntuación)",
    });
  }

  try {
    // Actualizar la puntuación del usuario en el torneo
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
});

// Cambiar puntuación de un participante en todos sus torneos activos
tournamentsRouter.post("/update-count", async (req, res) => {
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
    // Actualizar la puntuación del usuario en el torneo
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
});

tournamentsRouter.get("/has-active-tournament:userCode", async (req, res) => {
  const { userCode } = req.params;
  try {
    // Obtener todos los torneos donde participa el usuario
    const [tournamentsIds] = await pool.query<RowDataPacket[]>(`
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

});

//delete tournament
tournamentsRouter.delete("/delete-tournament/:id/user/:userCode", async (req, res) => {
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
    // Obtener todos los torneos donde participa el usuario
    const [result] = await pool.query<RowDataPacket[]>(`
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

});