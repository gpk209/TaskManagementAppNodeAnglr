import { AppUser } from '../entities/AppUser';

/**
 * Interface for user repository operations
 */
export interface IUserRepository {
  getByUsernameAsync(username: string): Promise<AppUser | null>;
  getByIdAsync(id: string): Promise<AppUser | null>;
  createAsync(user: AppUser): Promise<AppUser>;
}
