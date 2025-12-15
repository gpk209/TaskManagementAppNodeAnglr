/**
 * AppUser entity representing a user in the system
 */
export interface AppUser {
  id?: string;
  username: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}
