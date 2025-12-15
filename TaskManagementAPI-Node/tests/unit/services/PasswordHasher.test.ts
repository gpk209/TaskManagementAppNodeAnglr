import { PasswordHasher } from '../../../src/services/implementations/PasswordHasher';

describe('PasswordHasher', () => {
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    passwordHasher = new PasswordHasher();
  });

  describe('hash', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hash = await passwordHasher.hash(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
    });

    it('should create different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await passwordHasher.hash(password);
      const hash2 = await passwordHasher.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should create hash of expected length (bcrypt format)', async () => {
      const password = 'testPassword123';
      const hash = await passwordHasher.hash(password);

      // bcrypt hashes are 60 characters
      expect(hash.length).toBe(60);
    });

    it('should create hash starting with bcrypt identifier', async () => {
      const password = 'testPassword123';
      const hash = await passwordHasher.hash(password);

      // bcrypt hashes start with $2a$ or $2b$
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('should hash short passwords', async () => {
      const password = 'abcd';
      const hash = await passwordHasher.hash(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(60);
    });

    it('should hash long passwords', async () => {
      const password = 'a'.repeat(100);
      const hash = await passwordHasher.hash(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(60);
    });

    it('should hash passwords with special characters', async () => {
      const password = 'P@$$w0rd!@#$%^&*()';
      const hash = await passwordHasher.hash(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(60);
    });

    it('should hash passwords with unicode characters', async () => {
      const password = 'пароль密码パスワード';
      const hash = await passwordHasher.hash(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(60);
    });
  });

  describe('verify', () => {
    it('should return true for correct password', async () => {
      const password = 'correctPassword';
      const hash = await passwordHasher.hash(password);

      const isValid = await passwordHasher.verify(password, hash);

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'correctPassword';
      const hash = await passwordHasher.hash(password);

      const isValid = await passwordHasher.verify('wrongPassword', hash);

      expect(isValid).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      const password = 'correctPassword';
      const hash = await passwordHasher.hash(password);

      const isValid = await passwordHasher.verify('', hash);

      expect(isValid).toBe(false);
    });

    it('should handle case-sensitive passwords', async () => {
      const password = 'CaseSensitive';
      const hash = await passwordHasher.hash(password);

      const isValidLower = await passwordHasher.verify('casesensitive', hash);
      const isValidUpper = await passwordHasher.verify('CASESENSITIVE', hash);
      const isValidCorrect = await passwordHasher.verify('CaseSensitive', hash);

      expect(isValidLower).toBe(false);
      expect(isValidUpper).toBe(false);
      expect(isValidCorrect).toBe(true);
    });

    it('should verify passwords with special characters', async () => {
      const password = 'P@$$w0rd!@#$%^&*()';
      const hash = await passwordHasher.hash(password);

      const isValid = await passwordHasher.verify(password, hash);

      expect(isValid).toBe(true);
    });

    it('should verify passwords with unicode characters', async () => {
      const password = 'пароль密码パスワード';
      const hash = await passwordHasher.hash(password);

      const isValid = await passwordHasher.verify(password, hash);

      expect(isValid).toBe(true);
    });

    it('should return false for similar but different passwords', async () => {
      const password = 'password123';
      const hash = await passwordHasher.hash(password);

      const results = await Promise.all([
        passwordHasher.verify('password124', hash),
        passwordHasher.verify('password12', hash),
        passwordHasher.verify('password1234', hash),
        passwordHasher.verify('Password123', hash),
        passwordHasher.verify(' password123', hash),
        passwordHasher.verify('password123 ', hash)
      ]);

      results.forEach(result => {
        expect(result).toBe(false);
      });
    });

    it('should return false for invalid hash format', async () => {
      const password = 'testPassword';
      const invalidHash = 'not-a-valid-bcrypt-hash';

      // bcrypt.compare will return false for invalid hash format
      const isValid = await passwordHasher.verify(password, invalidHash);

      expect(isValid).toBe(false);
    });
  });

  describe('hash and verify integration', () => {
    it('should hash and verify multiple passwords correctly', async () => {
      const passwords = ['pass1', 'pass2', 'pass3'];
      const hashes = await Promise.all(
        passwords.map(p => passwordHasher.hash(p))
      );

      // Each password should only verify against its own hash
      for (let i = 0; i < passwords.length; i++) {
        for (let j = 0; j < hashes.length; j++) {
          const isValid = await passwordHasher.verify(passwords[i], hashes[j]);
          expect(isValid).toBe(i === j);
        }
      }
    });

    it('should handle concurrent hash operations', async () => {
      const password = 'concurrentTest';
      
      const hashes = await Promise.all([
        passwordHasher.hash(password),
        passwordHasher.hash(password),
        passwordHasher.hash(password)
      ]);

      // All hashes should be different
      expect(new Set(hashes).size).toBe(3);

      // But all should verify correctly
      const verifications = await Promise.all(
        hashes.map(hash => passwordHasher.verify(password, hash))
      );

      verifications.forEach(result => {
        expect(result).toBe(true);
      });
    });
  });
});
