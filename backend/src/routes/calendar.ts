import { Router } from "express";
import * as calendarController from "../controllers/calendarController";

export const calendarRouter = Router();

calendarRouter.get("/logs/:userCode", calendarController.getLogs);
calendarRouter.post("/logs/upsert", calendarController.upsertLog);
