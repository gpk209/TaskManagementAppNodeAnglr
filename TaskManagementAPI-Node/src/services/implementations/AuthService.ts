import { IAuthService, TokenPair } from '../interfaces/IAuthService';
import { IUserRepository } from '../../core/interfaces/IUserRepository';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';
import { ITokenService } from '../interfaces/ITokenService';
import { UsernameTakenException } from '../exceptions/UsernameTakenException';
import { AppUser } from '../../core/entities/AppUser';
import { logger } from '../../shared/logger';

/**
 * Authentication service implementation with dual token support
 */
export class AuthService implements IAuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService
  ) {
    if (!users) throw new Error('UserRepository is required');
    if (!hasher) throw new Error('PasswordHasher is required');
    if (!tokens) throw new Error('TokenService is required');
  }

  async loginAsync(username: string, password: string): Promise<TokenPair | null> {
    if (!username || username.trim() === '') {
      logger.warn('Login attempt with empty username');
      return null;
    }

    if (!password || password.trim() === '') {
      logger.warn(`Login attempt with empty password for username: ${username}`);
      return null;
    }

    logger.info(`Login attempt for user: ${username}`);

    const user = await this.users.getByUsernameAsync(username);
    if (!user) {
      logger.warn(`Login failed - user not found: ${username}`);
      return null;
    }

    const isValid = await this.hasher.verify(password, user.passwordHash);
    if (!isValid) {
      logger.warn(`Login failed - invalid password for user: ${username}`);
      return null;
    }

    logger.info(`Login successful for user: ${username}`);
    
    return {
      accessToken: this.tokens.createAccessToken(user),
      refreshToken: this.tokens.createRefreshToken(user)
    };
  }

  async refreshTokenAsync(refreshToken: string): Promise<TokenPair | null> {
    if (!refreshToken) {
      logger.warn('Refresh attempt with empty token');
      return null;
    }

    const payload = this.tokens.verifyRefreshToken(refreshToken);
    if (!payload) {
      logger.warn('Refresh failed - invalid or expired refresh token');
      return null;
    }

    const user = await this.users.getByIdAsync(payload.id);
    if (!user) {
      logger.warn(`Refresh failed - user not found: ${payload.id}`);
      return null;
    }

    logger.info(`Token refresh successful for user: ${user.username}`);
    
    return {
      accessToken: this.tokens.createAccessToken(user),
      refreshToken: this.tokens.createRefreshToken(user)
    };
  }

  async getUserByIdAsync(userId: string): Promise<AppUser | null> {
    return this.users.getByIdAsync(userId);
  }

  async registerAsync(username: string, password: string): Promise<void> {
    if (!username || username.trim() === '') {
      throw new Error('Username cannot be empty');
    }

    if (!password || password.trim() === '') {
      throw new Error('Password cannot be empty');
    }

    logger.info(`Registration attempt for username: ${username}`);

    const existing = await this.users.getByUsernameAsync(username);
    if (existing) {
      logger.warn(`Registration failed - username already exists: ${username}`);
      throw new UsernameTakenException(username);
    }

    const hashed = await this.hasher.hash(password);
    const user: AppUser = {
      username,
      passwordHash: hashed
    };

    await this.users.createAsync(user);
    logger.info(`User registered successfully: ${username}`);
  }
}
