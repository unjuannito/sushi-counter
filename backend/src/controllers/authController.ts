import { Request, Response } from "express";
import { pool } from "../db/db";
import generateId from "../utils/generateId";
import { getUserByCode, getUserByEmail, getUserByGoogleId, logLoginActivity } from "../services/userSevices";
import { User } from "../types/userType";
import bcrypt from "bcryptjs";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../utils/auth";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, errorMessage: "All fields are required" });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({ success: false, errorMessage: "Invalid email format" });
  }

  // Password requirements: min 8 chars, 1 uppercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.json({
      success: false,
      errorMessage: "Password must be at least 8 characters long, contain at least one uppercase letter and one number"
    });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser.success) {
      return res.json({ success: false, errorMessage: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateId();
    const code = null;

    await pool.query(
      "INSERT INTO users (id, code, name, email, password, token_version) VALUES (?, ?, ?, ?, ?, 0)",
      [id, code, name, email, hashedPassword]
    );

    const user: User = { id, code, name, email, token_version: 0 };
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, id]);

    return res.json({ success: true, user, token, refreshToken });
  } catch (err: any) {
    return res.json({ success: false, errorMessage: err.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, errorMessage: "Refresh token required" });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(401).json({ success: false, errorMessage: "Invalid or expired refresh token" });
  }

  try {
    const [rows] = await pool.query<any[]>("SELECT * FROM users WHERE id = ?", [decoded.id]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, errorMessage: "User not found" });
    }

    const user = rows[0];
    if (user.token_version !== decoded.version) {
      return res.status(401).json({ success: false, errorMessage: "Token has been invalidated" });
    }

    if (user.refresh_token !== refreshToken) {
      // Potential refresh token reuse attack!
      // Invalidate all tokens for this user as a precaution
      await pool.query("UPDATE users SET token_version = token_version + 1, refresh_token = NULL WHERE id = ?", [user.id]);
      return res.status(401).json({ success: false, errorMessage: "Security alert: Refresh token already used or invalid" });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Refresh Token Rotation: Store the new refresh token (optional but safer)
    // and ideally invalidate the old one if we were using a separate store.
    // For now, the token_version handles mass invalidation.
    // Let's at least update the user's refresh_token column if we want to track the latest.
    await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [newRefreshToken, user.id]);

    return res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, errorMessage: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    // Increment token version to invalidate all current tokens and clear refresh token
    await pool.query("UPDATE users SET token_version = token_version + 1, refresh_token = NULL WHERE id = ?", [userId]);
    return res.json({ success: true, message: "Logged out successfully. All sessions invalidated." });
  } catch (err: any) {
    return res.status(500).json({ success: false, errorMessage: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    const result = await getUserByEmail(email);
    if (!result.success || !result.user) {
      await logLoginActivity(null, 'failed', ip, userAgent);
      return res.json({ success: false, errorMessage: "Invalid email or password" });
    }

    const user = result.user;
    if (!user.password) {
      await logLoginActivity(user.id, 'failed', ip, userAgent);
      return res.json({ success: false, errorMessage: "Account not set up with password. Try Google login." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logLoginActivity(user.id, 'failed', ip, userAgent);
      return res.json({ success: false, errorMessage: "Invalid email or password" });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    await logLoginActivity(user.id, 'success', ip, userAgent);

    await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id]);

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      token,
      refreshToken
    });
  } catch (err: any) {
    return res.json({ success: false, errorMessage: err.message });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  const { credential, userId } = req.body;
  const ip = req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    let payload;
    console.log("Google login attempt with credential length:", credential?.length);
    
    // Check if it's an access token (from implicit flow/useGoogleLogin) or id_token
    if (credential.length > 500) { 
         try {
            console.log("Attempting to verify as ID Token...");
            const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
            console.log("ID Token verified successfully");
         } catch(e) {
            console.log("ID Token verification failed, trying as access token...");
            // Fallback to userInfo endpoint if verifyIdToken fails (might be access_token)
            client.setCredentials({ access_token: credential });
            const userInfoRes = await client.request<any>({
                url: 'https://www.googleapis.com/oauth2/v3/userinfo'
            });
            payload = userInfoRes.data;
            console.log("User info fetched with long token");
         }
    } else {
         // Assume access token
        console.log("Treating as access token, fetching user info...");
        client.setCredentials({ access_token: credential });
        const userInfoRes = await client.request<any>({
            url: 'https://www.googleapis.com/oauth2/v3/userinfo'
        });
        payload = userInfoRes.data;
        console.log("User info fetched successfully");
    }

    if (!payload) {
        console.error("No payload retrieved from Google token");
        return res.json({ success: false, errorMessage: "Invalid Google token" });
    }

    const { sub: googleId, email, name, email_verified } = payload;
    if (!email_verified) return res.json({ success: false, errorMessage: "Google email not verified" });

    let user: User;

    if (userId) {
      // Migration mode: Link Google to existing legacy userId
      const [rows] = await pool.query<any[]>("SELECT * FROM users WHERE id = ?", [userId]);
      if (rows.length === 0) {
        return res.json({ success: false, errorMessage: "User to migrate not found" });
      }

      // Check if this Google account is already linked to ANOTHER user
      const existingGoogleUser = await getUserByGoogleId(googleId);
      if (existingGoogleUser.success && existingGoogleUser.user && existingGoogleUser.user.id !== userId) {
        return res.json({ success: false, errorMessage: "This Google account is already linked to another user" });
      }

      // Mark code as migrated
      const userToMigrate = rows[0];
      const oldCode = userToMigrate.code;
      const newCode = oldCode && !oldCode.startsWith('MIGRATED_') ? `MIGRATED_${oldCode}` : oldCode;

      await pool.query(
        "UPDATE users SET google_id = ?, google_email = ?, email = COALESCE(email, ?), name = COALESCE(name, ?), code = ? WHERE id = ?",
        [googleId, email, email, name, newCode, userId]
      );

      const [updatedRows] = await pool.query<any[]>("SELECT * FROM users WHERE id = ?", [userId]);
      user = updatedRows[0];
    } else {
      // Normal login/register mode
      let userResult = await getUserByGoogleId(googleId);

      if (!userResult.success) {
        // Check if user exists with this email
        const emailResult = await getUserByEmail(email!);
        if (emailResult.success && emailResult.user) {
          // Link Google account to existing email account
          user = emailResult.user;
          await pool.query(
            "UPDATE users SET google_id = ?, google_email = ? WHERE id = ?",
            [googleId, email, user.id]
          );
        } else {
          // Create new user
          const id = generateId();
          const code = null;
          await pool.query(
            "INSERT INTO users (id, code, name, email, google_id, google_email, token_version) VALUES (?, ?, ?, ?, ?, ?, 0)",
            [id, code, name, email, googleId, email]
          );
          user = { id, code, name: name!, email: email!, google_id: googleId, google_email: email!, token_version: 0 };
        }
      } else {
        user = userResult.user!;
      }
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    await logLoginActivity(user.id, 'success', ip, userAgent);

    await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id]);

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      token,
      refreshToken
    });
  } catch (err: any) {
    return res.json({ success: false, errorMessage: err.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const [rows] = await pool.query<any[]>(
      "SELECT id, code, name, email, google_id, google_email, password FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, errorMessage: "User not found" });
    }

    const user = rows[0];
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isGoogleLinked: !!user.google_id,
        googleEmail: user.google_email,
        hasPassword: !!user.password
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, errorMessage: err.message });
  }
};

export const linkGoogle = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { credential } = req.body;

  try {
    let payload;
    if (credential.length > 500) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (e) {
        client.setCredentials({ access_token: credential });
        const userInfoRes = await client.request<any>({
          url: 'https://www.googleapis.com/oauth2/v3/userinfo'
        });
        payload = userInfoRes.data;
      }
    } else {
      client.setCredentials({ access_token: credential });
      const userInfoRes = await client.request<any>({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo'
      });
      payload = userInfoRes.data;
    }

    if (!payload) {
      return res.json({ success: false, errorMessage: "Invalid Google token" });
    }

    const { sub: googleId, email, email_verified } = payload;
    if (!email_verified) return res.json({ success: false, errorMessage: "Google email not verified" });

    // Check if this Google account is already linked to ANOTHER user
    const existingGoogleUser = await getUserByGoogleId(googleId);
    if (existingGoogleUser.success && existingGoogleUser.user && existingGoogleUser.user.id !== userId) {
      return res.json({ success: false, errorMessage: "This Google account is already linked to another user" });
    }

    await pool.query(
      "UPDATE users SET google_id = ?, google_email = ? WHERE id = ?",
      [googleId, email, userId]
    );

    return res.json({ success: true, message: "Google account linked successfully" });
  } catch (err: any) {
    return res.json({ success: false, errorMessage: err.message });
  }
};

export const unlinkGoogle = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    // Check if user has a password or email, otherwise they won't be able to log in
    const [rows] = await pool.query<any[]>("SELECT email, password FROM users WHERE id = ?", [userId]);
    const user = rows[0];

    if (!user.email || !user.password) {
      return res.json({
        success: false,
        errorMessage: "Cannot unlink Google account without setting an email and password first."
      });
    }

    await pool.query(
      "UPDATE users SET google_id = NULL, google_email = NULL WHERE id = ?",
      [userId]
    );

    return res.json({ success: true, message: "Google account unlinked successfully" });
  } catch (err: any) {
    return res.json({ success: false, errorMessage: err.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { name, email, password, currentPassword } = req.body;

  try {
    const [rows] = await pool.query<any[]>("SELECT * FROM users WHERE id = ?", [userId]);
    const user = rows[0];

    let updateFields: string[] = [];
    let updateValues: any[] = [];

    if (name) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }

    if (email && email !== user.email) {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.json({ success: false, errorMessage: "Invalid email format" });
      }

      // Check if email already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser.success && existingUser.user && existingUser.user.id !== userId) {
        return res.json({ success: false, errorMessage: "Email already in use" });
      }

      updateFields.push("email = ?");
      updateValues.push(email);
    }

    if (password) {
      // If user already has a password, they must provide currentPassword
      if (user.password) {
        if (!currentPassword) {
          return res.json({ success: false, errorMessage: "Current password is required to change password" });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.json({ success: false, errorMessage: "Incorrect current password" });
        }
      }

      // Validate new password
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.json({
          success: false,
          errorMessage: "Password must be at least 8 characters long, contain at least one uppercase letter and one number"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push("password = ?");
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.json({ success: true, message: "No changes to update" });
    }

    updateValues.push(userId);
    await pool.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    return res.json({ success: true, message: "Profile updated successfully" });
  } catch (err: any) {
    return res.json({ success: false, errorMessage: err.message });
  }
};

export const createAccount = async (req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    errorMessage: "Legacy account creation is no longer available. Please use Google Login or Email registration.",
  });
};

export const verifyUser = async (req: Request, res: Response) => {
  // Only for migration purposes
  const { userCode } = req.params;

  if (userCode.startsWith('MIGRATED_')) {
    return res.json({
      success: false,
      errorMessage: "This account is already migrated or is a new JWT-based account.",
    });
  }

  const reqUser = await getUserByCode(userCode);
  if (!reqUser.success || !reqUser.user) {
    return res.json({
      success: false,
      errorMessage: `Error during verifying user for migration. ${reqUser.errorMessage} `,
    });
  }
  const user: User = reqUser.user;
  return res.json({
    success: true,
    user: { id: user.id, name: user.name } // Only return what's necessary for migration UI
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const result = await getUserByEmail(email);
    if (!result.success || !result.user) {
      // Don't reveal if user exists for security
      return res.json({ success: true, message: "If an account exists with this email, you will receive a reset link." });
    }

    const resetToken = generateId(); // Simple token for now
    const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    await pool.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      [resetToken, expiry, result.user.id]
    );

    // In a real app, send email here. For now, we return it in the response for testing purposes (or just log it)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return res.json({
      success: true,
      message: "If an account exists with this email, you will receive a reset link.",
      // In development, we might return the token to help the user
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (err: any) {
    return res.json({ success: false, errorMessage: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  // Password requirements
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.json({
      success: false,
      errorMessage: "Password must be at least 8 characters long, contain at least one uppercase letter and one number"
    });
  }

  try {
    const [rows] = await pool.query<any[]>(
      "SELECT id, reset_token_expiry FROM users WHERE reset_token = ? LIMIT 1",
      [token]
    );

    if (rows.length === 0) {
      return res.json({ success: false, errorMessage: "Invalid or expired token" });
    }

    const user = rows[0];
    if (new Date(user.reset_token_expiry) < new Date()) {
      return res.json({ success: false, errorMessage: "Token expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    return res.json({ success: true, message: "Password reset successful" });
  } catch (err: any) {
    return res.json({ success: false, errorMessage: err.message });
  }
};

export const migrateAccount = async (req: Request, res: Response) => {
  const { userId, email, password, name } = req.body;

  if (!userId || !email || !password) {
    return res.json({ success: false, errorMessage: "Missing required fields" });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({ success: false, errorMessage: "Invalid email format" });
  }

  // Password requirements
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.json({
      success: false,
      errorMessage: "Password must be at least 8 characters long, contain at least one uppercase letter and one number"
    });
  }

  try {
    // Check if email is already in use
    const existingUser = await getUserByEmail(email);
    if (existingUser.success) {
      return res.json({ success: false, errorMessage: "Email already registered to another account" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // GET user code
    const [userCodeRows] = await pool.query<any[]>(
      "SELECT code FROM users WHERE id = ?",
      [userId]
    );
    if (userCodeRows.length === 0) {
      return res.json({ success: false, errorMessage: "User not found" });
    }
    const userCode = userCodeRows[0].code;

    // Update existing user
    await pool.query(
      "UPDATE users SET code = ?, email = ?, password = ?, name = COALESCE(?, name) WHERE id = ?",
      ['MIGRATED_'+userCode, email, hashedPassword, name, userId]
    );

    const [rows] = await pool.query<any[]>("SELECT * FROM users WHERE id = ?", [userId]);
    const user = rows[0];

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      token,
      refreshToken
    });
  } catch (err: any) {
    return res.json({ success: false, errorMessage: err.message });
  }
};
