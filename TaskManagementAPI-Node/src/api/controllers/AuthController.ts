import { Request, Response } from 'express';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { UsernameTakenException } from '../../services/exceptions/UsernameTakenException';
import { logger } from '../../shared/logger';
import { config } from '../../shared/config';

// Cookie configuration for refresh token - uses centralized config
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: config.cookie.httpOnly,           // Not accessible via JavaScript
  secure: config.cookie.secure,               // HTTPS only in production
  sameSite: config.cookie.sameSite,           // CSRF protection
  maxAge: config.cookie.maxAge,               // Uses config (default 7 days)
  path: config.cookie.path                    // Available to all paths
};

/**
 * Authentication controller with dual token support
 */
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  /**
   * Login - returns access token in body, refresh token in HTTP-only cookie
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      // Validation
      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
      }

      const tokens = await this.authService.loginAsync(username, password);

      if (!tokens) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
      }

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Send access token in response body (stored in memory on client)
      res.status(200).json({ 
        token: tokens.accessToken, 
        username 
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ message: 'An error occurred during login. Please try again.' });
    }
  };

  /**
   * Register a new user
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      // Validation
      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
      }

      if (username.length < 3) {
        res.status(400).json({ message: 'Username must be at least 3 characters long' });
        return;
      }

      if (password.length < 4) {
        res.status(400).json({ message: 'Password must be at least 4 characters long' });
        return;
      }

      await this.authService.registerAsync(username, password);

      res.status(201).json({ message: 'Registration successful. Please login.' });
    } catch (error) {
      if (error instanceof UsernameTakenException) {
        res.status(409).json({ message: error.message });
        return;
      }

      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }

      logger.error('Registration error:', error);
      res.status(500).json({ message: 'An error occurred during registration. Please try again.' });
    }
  };

  /**
   * Refresh token - uses refresh token from cookie to get new access token
   */
  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      logger.info(`Refresh attempt - cookie present: ${!!refreshToken}`);

      if (!refreshToken) {
        res.status(401).json({ message: 'Session expired. Please login again.' });
        return;
      }

      const tokens = await this.authService.refreshTokenAsync(refreshToken);

      if (!tokens) {
        // Clear invalid refresh token
        res.clearCookie('refreshToken', { path: '/' });
        res.status(401).json({ message: 'Session expired. Please login again.' });
        return;
      }

      // Set new refresh token in cookie (token rotation for security)
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Send new access token
      res.status(200).json({ token: tokens.accessToken });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({ message: 'Session expired. Please login again.' });
    }
  };

  /**
   * Logout - clears the refresh token cookie
   */
  logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Clear the refresh token cookie
      res.clearCookie('refreshToken', { path: '/' });
      
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ message: 'An error occurred during logout' });
    }
  };
}
