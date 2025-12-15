import { AuthService } from '../../../src/services/implementations/AuthService';
import { IUserRepository } from '../../../src/core/interfaces/IUserRepository';
import { IPasswordHasher } from '../../../src/services/interfaces/IPasswordHasher';
import { ITokenService, TokenPayload } from '../../../src/services/interfaces/ITokenService';
import { AppUser } from '../../../src/core/entities/AppUser';
import { UsernameTakenException } from '../../../src/services/exceptions/UsernameTakenException';

// Mock the logger to avoid console output during tests
jest.mock('../../../src/shared/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
  let mockTokenService: jest.Mocked<ITokenService>;

  const mockUser: AppUser = {
    id: 'user123',
    username: 'testuser',
    passwordHash: 'hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Create mock implementations
    mockUserRepository = {
      getByUsernameAsync: jest.fn(),
      getByIdAsync: jest.fn(),
      createAsync: jest.fn()
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      verify: jest.fn()
    };

    mockTokenService = {
      createAccessToken: jest.fn(),
      createRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      createToken: jest.fn(),
      verifyToken: jest.fn()
    };

    authService = new AuthService(
      mockUserRepository,
      mockPasswordHasher,
      mockTokenService
    );
  });

  describe('constructor', () => {
    it('should throw error when UserRepository is not provided', () => {
      expect(() => {
        new AuthService(null as any, mockPasswordHasher, mockTokenService);
      }).toThrow('UserRepository is required');
    });

    it('should throw error when PasswordHasher is not provided', () => {
      expect(() => {
        new AuthService(mockUserRepository, null as any, mockTokenService);
      }).toThrow('PasswordHasher is required');
    });

    it('should throw error when TokenService is not provided', () => {
      expect(() => {
        new AuthService(mockUserRepository, mockPasswordHasher, null as any);
      }).toThrow('TokenService is required');
    });

    it('should create instance successfully with all dependencies', () => {
      const service = new AuthService(
        mockUserRepository,
        mockPasswordHasher,
        mockTokenService
      );
      expect(service).toBeDefined();
    });
  });

  describe('loginAsync', () => {
    it('should return null when username is empty', async () => {
      const result = await authService.loginAsync('', 'password');
      expect(result).toBeNull();
      expect(mockUserRepository.getByUsernameAsync).not.toHaveBeenCalled();
    });

    it('should return null when username is whitespace only', async () => {
      const result = await authService.loginAsync('   ', 'password');
      expect(result).toBeNull();
      expect(mockUserRepository.getByUsernameAsync).not.toHaveBeenCalled();
    });

    it('should return null when password is empty', async () => {
      const result = await authService.loginAsync('testuser', '');
      expect(result).toBeNull();
      expect(mockUserRepository.getByUsernameAsync).not.toHaveBeenCalled();
    });

    it('should return null when password is whitespace only', async () => {
      const result = await authService.loginAsync('testuser', '   ');
      expect(result).toBeNull();
      expect(mockUserRepository.getByUsernameAsync).not.toHaveBeenCalled();
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.getByUsernameAsync.mockResolvedValue(null);

      const result = await authService.loginAsync('nonexistent', 'password');

      expect(result).toBeNull();
      expect(mockUserRepository.getByUsernameAsync).toHaveBeenCalledWith('nonexistent');
      expect(mockPasswordHasher.verify).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      mockUserRepository.getByUsernameAsync.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(false);

      const result = await authService.loginAsync('testuser', 'wrongpassword');

      expect(result).toBeNull();
      expect(mockPasswordHasher.verify).toHaveBeenCalledWith('wrongpassword', mockUser.passwordHash);
      expect(mockTokenService.createAccessToken).not.toHaveBeenCalled();
    });

    it('should return token pair when credentials are valid', async () => {
      mockUserRepository.getByUsernameAsync.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockTokenService.createAccessToken.mockReturnValue('access_token_123');
      mockTokenService.createRefreshToken.mockReturnValue('refresh_token_456');

      const result = await authService.loginAsync('testuser', 'correctpassword');

      expect(result).toEqual({
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_456'
      });
      expect(mockTokenService.createAccessToken).toHaveBeenCalledWith(mockUser);
      expect(mockTokenService.createRefreshToken).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('refreshTokenAsync', () => {
    const mockPayload: TokenPayload = {
      id: 'user123',
      username: 'testuser'
    };

    it('should return null when refresh token is empty', async () => {
      const result = await authService.refreshTokenAsync('');
      expect(result).toBeNull();
      expect(mockTokenService.verifyRefreshToken).not.toHaveBeenCalled();
    });

    it('should return null when refresh token is invalid', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(null);

      const result = await authService.refreshTokenAsync('invalid_token');

      expect(result).toBeNull();
      expect(mockUserRepository.getByIdAsync).not.toHaveBeenCalled();
    });

    it('should return null when user is not found', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(mockPayload);
      mockUserRepository.getByIdAsync.mockResolvedValue(null);

      const result = await authService.refreshTokenAsync('valid_token');

      expect(result).toBeNull();
      expect(mockUserRepository.getByIdAsync).toHaveBeenCalledWith('user123');
    });

    it('should return new token pair when refresh token is valid', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(mockPayload);
      mockUserRepository.getByIdAsync.mockResolvedValue(mockUser);
      mockTokenService.createAccessToken.mockReturnValue('new_access_token');
      mockTokenService.createRefreshToken.mockReturnValue('new_refresh_token');

      const result = await authService.refreshTokenAsync('valid_refresh_token');

      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token'
      });
      expect(mockTokenService.createAccessToken).toHaveBeenCalledWith(mockUser);
      expect(mockTokenService.createRefreshToken).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getUserByIdAsync', () => {
    it('should return user when found', async () => {
      mockUserRepository.getByIdAsync.mockResolvedValue(mockUser);

      const result = await authService.getUserByIdAsync('user123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.getByIdAsync).toHaveBeenCalledWith('user123');
    });

    it('should return null when user not found', async () => {
      mockUserRepository.getByIdAsync.mockResolvedValue(null);

      const result = await authService.getUserByIdAsync('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('registerAsync', () => {
    it('should throw error when username is empty', async () => {
      await expect(authService.registerAsync('', 'password'))
        .rejects
        .toThrow('Username cannot be empty');
    });

    it('should throw error when username is whitespace only', async () => {
      await expect(authService.registerAsync('   ', 'password'))
        .rejects
        .toThrow('Username cannot be empty');
    });

    it('should throw error when password is empty', async () => {
      await expect(authService.registerAsync('testuser', ''))
        .rejects
        .toThrow('Password cannot be empty');
    });

    it('should throw error when password is whitespace only', async () => {
      await expect(authService.registerAsync('testuser', '   '))
        .rejects
        .toThrow('Password cannot be empty');
    });

    it('should throw UsernameTakenException when username already exists', async () => {
      mockUserRepository.getByUsernameAsync.mockResolvedValue(mockUser);

      await expect(authService.registerAsync('testuser', 'password'))
        .rejects
        .toThrow(UsernameTakenException);
    });

    it('should create user successfully when username is available', async () => {
      const newUser: AppUser = {
        id: 'newUserId',
        username: 'newuser',
        passwordHash: 'hashed_password'
      };
      mockUserRepository.getByUsernameAsync.mockResolvedValue(null);
      mockPasswordHasher.hash.mockResolvedValue('hashed_password');
      mockUserRepository.createAsync.mockResolvedValue(newUser);

      await authService.registerAsync('newuser', 'password123');

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password123');
      expect(mockUserRepository.createAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'newuser',
          passwordHash: 'hashed_password'
        })
      );
    });
  });
});
