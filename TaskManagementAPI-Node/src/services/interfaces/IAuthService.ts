import { AppUser } from '../../core/entities/AppUser';

/**
 * Token pair response for authentication
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Interface for authentication service
 */
export interface IAuthService {
  /**
   * Authenticate a user and return access + refresh tokens
   */
  loginAsync(username: string, password: string): Promise<TokenPair | null>;

  /**
   * Register a new user
   */
  registerAsync(username: string, password: string): Promise<void>;

  /**
   * Refresh access token using a valid refresh token
   */
  refreshTokenAsync(refreshToken: string): Promise<TokenPair | null>;

  /**
   * Get user by ID (for token refresh)
   */
  getUserByIdAsync(userId: string): Promise<AppUser | null>;
}
