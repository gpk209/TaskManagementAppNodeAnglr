import { IUserRepository } from '../../core/interfaces/IUserRepository';
import { AppUser } from '../../core/entities/AppUser';
import { UserModel } from '../models/User.model';

/**
 * User repository implementation using MongoDB
 */
export class UserRepository implements IUserRepository {
  async getByUsernameAsync(username: string): Promise<AppUser | null> {
    const user = await UserModel.findOne({ username }).exec();
    
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      username: user.username,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async getByIdAsync(id: string): Promise<AppUser | null> {
    const user = await UserModel.findById(id).exec();
    
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      username: user.username,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async createAsync(user: AppUser): Promise<AppUser> {
    const newUser = new UserModel({
      username: user.username,
      passwordHash: user.passwordHash
    });

    const saved = await newUser.save();

    return {
      id: saved._id.toString(),
      username: saved.username,
      passwordHash: saved.passwordHash,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt
    };
  }
}
