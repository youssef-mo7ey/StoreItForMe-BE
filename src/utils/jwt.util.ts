import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  id: string;
  email?: string;
  role?: string;
}

// Generate access token (short-lived)
export const generateAccessToken = (user: TokenPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET as any,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (user: TokenPayload): string => {
  return jwt.sign(
    { id: user.id }, // Keep refresh payload minimal
    env.REFRESH_TOKEN_SECRET as any,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any }
  );
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
  const decoded = jwt.verify(token, env.JWT_SECRET as any) as TokenPayload;
    return decoded;
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): { id: string } => {
  try {
  const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET as any) as { id: string };
    return decoded;
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};

// Decode token without verification (useful for debugging)
export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};