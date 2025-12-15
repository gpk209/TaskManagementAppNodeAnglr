import * as jwt from 'jsonwebtoken';
import { AppUser } from '../../core/entities/AppUser';
import { ITokenService, TokenPayload } from '../interfaces/ITokenService';
import { config } from '../../shared/config';

/**
 * JWT token service implementation with support for access and refresh tokens
 */
export class JwtTokenService implements ITokenService {
  private readonly accessSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    // Use the new structured config
    this.accessSecret = config.jwt.secret;
    this.accessExpiresIn = config.jwt.accessTokenExpiry;
    this.refreshSecret = config.jwt.refreshSecret;
    this.refreshExpiresIn = config.jwt.refreshTokenExpiry;
  }

  /**
   * Create short-lived access token (stored in memory on client)
   */
  createAccessToken(user: AppUser): string {
    const payload = {
      id: user.id,
      username: user.username
    };

    return jwt.sign(payload, this.accessSecret, { 
      expiresIn: this.accessExpiresIn as jwt.SignOptions['expiresIn'] 
    });
  }

  /**
   * Create long-lived refresh token (stored in HTTP-only cookie)
   */
  createRefreshToken(user: AppUser): string {
    const payload = {
      id: user.id,
      username: user.username
    };

    return jwt.sign(payload, this.refreshSecret, { 
      expiresIn: this.refreshExpiresIn as jwt.SignOptions['expiresIn'] 
    });
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.accessSecret) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.refreshSecret) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  // Legacy methods for backward compatibility
  createToken(user: AppUser): string {
    return this.createAccessToken(user);
  }

  verifyToken(token: string): any {
    return this.verifyAccessToken(token);
  }
}
