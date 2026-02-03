import { Router } from "express";
import * as tournamentsController from "../controllers/tournamentsController";
import { authMiddleware } from "../middleware/authMiddleware";

export const tournamentsRouter = Router();

tournamentsRouter.use(authMiddleware);

tournamentsRouter.post("/create", tournamentsController.createTournament);
tournamentsRouter.post("/join", tournamentsController.joinTournament);
tournamentsRouter.post("/leave", tournamentsController.leaveTournament);
tournamentsRouter.get("/user/me", tournamentsController.getUserTournaments);
tournamentsRouter.get("/user/active", tournamentsController.getActiveUserTournaments);
tournamentsRouter.get("/has-active-tournament/me", tournamentsController.hasActiveTournament);
tournamentsRouter.get("/:id", tournamentsController.getTournament);
tournamentsRouter.post("/update-status", tournamentsController.updateStatus);
tournamentsRouter.post("/update-count", tournamentsController.updateCount);
tournamentsRouter.delete("/delete-tournament/:id", tournamentsController.deleteTournament);
