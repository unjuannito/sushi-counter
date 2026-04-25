import jwt from 'jsonwebtoken';
import { User } from '../types/userType';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-change-this';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-change-this';
const JWT_EXPIRES_IN = '1d';
const REFRESH_TOKEN_EXPIRES_IN = '180d';

export const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, email: user.email, version: user.token_version || 0 },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, version: user.token_version || 0 },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};
