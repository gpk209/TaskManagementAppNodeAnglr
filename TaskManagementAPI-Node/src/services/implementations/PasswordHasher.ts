import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';

/**
 * Password hasher implementation using bcrypt
 */
export class PasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
