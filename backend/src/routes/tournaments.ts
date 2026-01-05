import { Router } from "express";
import * as tournamentsController from "../controllers/tournamentsController";

export const tournamentsRouter = Router();

tournamentsRouter.post("/create", tournamentsController.createTournament);
tournamentsRouter.post("/join", tournamentsController.joinTournament);
tournamentsRouter.get("/:id", tournamentsController.getTournament);
tournamentsRouter.get("/user/:userCode", tournamentsController.getUserTournaments);
tournamentsRouter.post("/update-status", tournamentsController.updateStatus);
tournamentsRouter.post("/update-count", tournamentsController.updateCount);
tournamentsRouter.get("/has-active-tournament/:userCode", tournamentsController.hasActiveTournament);
tournamentsRouter.delete("/delete-tournament/:id/user/:userCode", tournamentsController.deleteTournament);
