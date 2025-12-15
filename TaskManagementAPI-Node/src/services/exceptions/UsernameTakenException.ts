import { ConflictException } from './BaseException';

/**
 * Exception thrown when attempting to register with an existing username
 */
export class UsernameTakenException extends ConflictException {
  constructor(username: string) {
    super(`Username '${username}' is already taken`);
  }
}
