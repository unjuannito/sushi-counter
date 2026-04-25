 import { Router } from "express";
import * as calendarController from "../controllers/calendarController";
import { authMiddleware } from "../middleware/authMiddleware";

export const calendarRouter = Router();

calendarRouter.use(authMiddleware);

calendarRouter.get("/logs", calendarController.getLogs);
calendarRouter.get("/logs/day/:date", calendarController.getLogsByDay);
calendarRouter.get("/logs/month/:year/:month", calendarController.getLogsByMonth);
calendarRouter.post("/logs/upsert", calendarController.upsertLog);
calendarRouter.delete("/logs/:id", calendarController.deleteLog);
