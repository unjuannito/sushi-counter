import jwt from 'jsonwebtoken';
import { User } from '../types/userType';
import '../config/loadEnv';

const JWT_SECRET = process.env.JWT_SECRET?.trim();
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET?.trim();

if (process.env.NODE_ENV === 'production' && (!JWT_SECRET || !REFRESH_TOKEN_SECRET)) {
  throw new Error('JWT_SECRET and REFRESH_TOKEN_SECRET must be set in the root .env file for production.');
}

const signingSecret = JWT_SECRET || 'development-only-jwt-secret';
const refreshSigningSecret = REFRESH_TOKEN_SECRET || 'development-only-refresh-secret';
const JWT_EXPIRES_IN = '1d';
const REFRESH_TOKEN_EXPIRES_IN = '180d';

export const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, email: user.email, version: user.token_version || 0 },
    signingSecret,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, version: user.token_version || 0 },
    refreshSigningSecret,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, signingSecret);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, refreshSigningSecret);
  } catch (error) {
    return null;
  }
};
