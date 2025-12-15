import { JwtTokenService } from '../../../src/services/implementations/JwtTokenService';
import { AppUser } from '../../../src/core/entities/AppUser';
import * as jwt from 'jsonwebtoken';

// Mock the config module
jest.mock('../../../src/shared/config', () => ({
  config: {
    jwt: {
      secret: 'test-access-secret-key-for-testing',
      refreshSecret: 'test-refresh-secret-key-for-testing',
      accessTokenExpiry: '15m',
      refreshTokenExpiry: '7d'
    }
  }
}));

describe('JwtTokenService', () => {
  let tokenService: JwtTokenService;

  const mockUser: AppUser = {
    id: 'user123',
    username: 'testuser',
    passwordHash: 'hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    tokenService = new JwtTokenService();
  });

  describe('createAccessToken', () => {
    it('should create a valid access token', () => {
      const token = tokenService.createAccessToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user id and username in token payload', () => {
      const token = tokenService.createAccessToken(mockUser);
      const decoded = jwt.decode(token) as any;

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.username).toBe(mockUser.username);
    });

    it('should not include password in token payload', () => {
      const token = tokenService.createAccessToken(mockUser);
      const decoded = jwt.decode(token) as any;

      expect(decoded.passwordHash).toBeUndefined();
      expect(decoded.password).toBeUndefined();
    });

    it('should include expiration time in token', () => {
      const token = tokenService.createAccessToken(mockUser);
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('createRefreshToken', () => {
    it('should create a valid refresh token', () => {
      const token = tokenService.createRefreshToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include user id and username in token payload', () => {
      const token = tokenService.createRefreshToken(mockUser);
      const decoded = jwt.decode(token) as any;

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.username).toBe(mockUser.username);
    });

    it('should create different tokens for access and refresh', () => {
      const accessToken = tokenService.createAccessToken(mockUser);
      const refreshToken = tokenService.createRefreshToken(mockUser);

      expect(accessToken).not.toBe(refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should return payload for valid access token', () => {
      const token = tokenService.createAccessToken(mockUser);
      const payload = tokenService.verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload?.id).toBe(mockUser.id);
      expect(payload?.username).toBe(mockUser.username);
    });

    it('should return null for invalid access token', () => {
      const payload = tokenService.verifyAccessToken('invalid.token.here');

      expect(payload).toBeNull();
    });

    it('should return null for empty access token', () => {
      const payload = tokenService.verifyAccessToken('');

      expect(payload).toBeNull();
    });

    it('should return null for refresh token when verifying as access token', () => {
      const refreshToken = tokenService.createRefreshToken(mockUser);
      const payload = tokenService.verifyAccessToken(refreshToken);

      // Should be null because refresh token uses different secret
      expect(payload).toBeNull();
    });

    it('should return null for expired access token', () => {
      // Create an expired token manually
      const expiredToken = jwt.sign(
        { id: mockUser.id, username: mockUser.username },
        'test-access-secret-key-for-testing',
        { expiresIn: '-1s' } // Already expired
      );

      const payload = tokenService.verifyAccessToken(expiredToken);
      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return payload for valid refresh token', () => {
      const token = tokenService.createRefreshToken(mockUser);
      const payload = tokenService.verifyRefreshToken(token);

      expect(payload).toBeDefined();
      expect(payload?.id).toBe(mockUser.id);
      expect(payload?.username).toBe(mockUser.username);
    });

    it('should return null for invalid refresh token', () => {
      const payload = tokenService.verifyRefreshToken('invalid.token.here');

      expect(payload).toBeNull();
    });

    it('should return null for empty refresh token', () => {
      const payload = tokenService.verifyRefreshToken('');

      expect(payload).toBeNull();
    });

    it('should return null for access token when verifying as refresh token', () => {
      const accessToken = tokenService.createAccessToken(mockUser);
      const payload = tokenService.verifyRefreshToken(accessToken);

      // Should be null because access token uses different secret
      expect(payload).toBeNull();
    });

    it('should return null for expired refresh token', () => {
      const expiredToken = jwt.sign(
        { id: mockUser.id, username: mockUser.username },
        'test-refresh-secret-key-for-testing',
        { expiresIn: '-1s' }
      );

      const payload = tokenService.verifyRefreshToken(expiredToken);
      expect(payload).toBeNull();
    });
  });

  describe('legacy methods', () => {
    describe('createToken', () => {
      it('should create access token (backward compatibility)', () => {
        const token = tokenService.createToken(mockUser);
        const payload = tokenService.verifyAccessToken(token);

        expect(payload).toBeDefined();
        expect(payload?.id).toBe(mockUser.id);
      });
    });

    describe('verifyToken', () => {
      it('should verify access token (backward compatibility)', () => {
        const token = tokenService.createAccessToken(mockUser);
        const payload = tokenService.verifyToken(token);

        expect(payload).toBeDefined();
        expect(payload?.id).toBe(mockUser.id);
      });
    });
  });

  describe('token uniqueness', () => {
    it('should create unique tokens for different users', () => {
      const user1: AppUser = { ...mockUser, id: 'user1', username: 'user1' };
      const user2: AppUser = { ...mockUser, id: 'user2', username: 'user2' };

      const token1 = tokenService.createAccessToken(user1);
      const token2 = tokenService.createAccessToken(user2);

      expect(token1).not.toBe(token2);
    });

    it('should create unique tokens on consecutive calls for same user', async () => {
      const token1 = tokenService.createAccessToken(mockUser);
      
      // Small delay to ensure different iat
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const token2 = tokenService.createAccessToken(mockUser);

      expect(token1).not.toBe(token2);
    });
  });
});
