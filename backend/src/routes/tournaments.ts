import { Router } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../db";
import generateId from "../utils/generateId";
import { getUserName } from "../services/userSevices";
import { addParticipant, getFormatedTournamentsByIds, tournamentExists } from "../services/tournamentServices";
import type { Response } from '../types/responseType';
import { format } from "path";
import { notifyClients } from "../websocket/websocketServer"; // Asegúrate de que la función esté exportada correctamente

export const tournamentsRouter = Router();

// Crear torneo
tournamentsRouter.post("/create", async (req, res) => {
  const { userCode } = req.body;

  if (!userCode) {
    return res.json({
      success: false,
      errorMessage: "No se encontró el usuario creador",
    });
  }

  try {
    let id: string;
    let exists = true;

    do {
      id = generateId(8);
      exists = await tournamentExists(id);
    } while (exists);

    await pool.query(
      "INSERT INTO tournaments (id, creator) VALUES (?, ?)",
      [id, userCode]
    );

    await addParticipant(id, userCode);

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
  console.log(tournamentId)
  if (!userCode || !tournamentId) {
    return res.json({
      success: false,
      errorMessage: "Faltan datos necesarios (usuario o torneo)",
    });
  }

  try {
    const exists = await tournamentExists(tournamentId);
    if (!exists) {
      return res.json({
        success: false,
        errorMessage: "El torneo no existe",
      });
    }

    const added = await addParticipant(tournamentId, userCode);
    if (!added) {
      return res.json({
        success: false,
        errorMessage: "El usuario ya está en el torneo",
      });
    }

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
      "SELECT user, sushi_count FROM participants WHERE tournament = ?",
      [tournament.id]
    );

    const participants = await Promise.all(
      participantsRows.map(async (participant: RowDataPacket) => {
        const [userRows] = await pool.query<RowDataPacket[]>(
          "SELECT name FROM users WHERE user_code = ?",
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

  if (!userCode) {
    return res.json({ success: false, errorMessage: "User code is required" });
  }

  try {
    // Obtener todos los torneos donde participa el usuario
    const [tournamentsIds] = await pool.query<RowDataPacket[]>(`
      SELECT t.id
      FROM tournaments t
      WHERE t.id IN (
        SELECT p.tournament
        FROM participants p
        WHERE p.user = ?
      )
    `, [userCode]);

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
tournamentsRouter.post("/update-count", async (req, res) => {
  const { userCode, sushiCount } = req.body;

  if (!userCode || sushiCount === undefined) {
    return res.json({
      success: false,
      errorMessage: "Faltan datos necesarios (usuario, torneo o puntuación)",
    });
  }

  try {
    // sacar todos los torneos del usuario
    const [participantRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM participants WHERE finished = 0 AND user = ?",
      [userCode]
    );

    if (participantRows.length === 0) {
      return res.json({
        success: false,
        errorMessage: "Error when updating 2",
      });
    }

    // Actualizar la puntuación del usuario en el torneo
    await pool.query(
      "UPDATE participants SET sushi_count = ? WHERE user = ?",
      [sushiCount, userCode]
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
