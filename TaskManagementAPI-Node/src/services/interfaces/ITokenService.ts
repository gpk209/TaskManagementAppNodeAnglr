import { AppUser } from '../../core/entities/AppUser';

/**
 * Token payload interface for decoded JWT
 */
export interface TokenPayload {
  id: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Interface for JWT token service
 */
export interface ITokenService {
  createAccessToken(user: AppUser): string;
  createRefreshToken(user: AppUser): string;
  verifyAccessToken(token: string): TokenPayload | null;
  verifyRefreshToken(token: string): TokenPayload | null;
  
  // Legacy method for backward compatibility
  createToken(user: AppUser): string;
  verifyToken(token: string): any;
}
