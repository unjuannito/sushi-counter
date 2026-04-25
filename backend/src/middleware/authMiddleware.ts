import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { pool } from '../db/db';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, errorMessage: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, errorMessage: 'Unauthorized: Invalid or expired token' });
  }

  try {
    // Check token version for invalidation
    const [rows] = await pool.query<any[]>("SELECT token_version FROM users WHERE id = ?", [decoded.id]);
    
    if (rows.length === 0 || rows[0].token_version !== decoded.version) {
      return res.status(401).json({ success: false, errorMessage: 'Unauthorized: Token has been invalidated' });
    }

    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, errorMessage: 'Internal server error during authentication' });
  }
};
