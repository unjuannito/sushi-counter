import { Router } from "express";
import * as authController from "../controllers/authController";

export const authRouter = Router();

authRouter.post("/create", authController.createAccount);
authRouter.get("/verify/:userCode", authController.verifyUser);
