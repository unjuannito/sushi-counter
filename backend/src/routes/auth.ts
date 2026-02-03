import { Router } from "express";
import * as authController from "../controllers/authController";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/authMiddleware";

export const authRouter = Router();

// Brute force protection for login and registration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { success: false, errorMessage: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post("/register", authLimiter, authController.register);
authRouter.post("/login", authLimiter, authController.login);
authRouter.post("/google", authLimiter, authController.googleLogin);
authRouter.post("/forgot-password", authLimiter, authController.forgotPassword);
authRouter.post("/reset-password", authLimiter, authController.resetPassword);
authRouter.post("/migrate-account", authLimiter, authController.migrateAccount);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.post("/logout", authMiddleware, authController.logout);
authRouter.get("/me", authMiddleware, authController.getMe);
authRouter.post("/link-google", authMiddleware, authController.linkGoogle);
authRouter.post("/unlink-google", authMiddleware, authController.unlinkGoogle);
authRouter.put("/profile", authMiddleware, authController.updateProfile);

// Legacy routes
authRouter.post("/create", authController.createAccount);
authRouter.get("/verify/:userCode", authController.verifyUser);
