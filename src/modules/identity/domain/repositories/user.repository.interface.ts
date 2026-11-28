import { User } from '../aggregates/user.aggregate';

export const USER_REPOSITORY = Symbol('IUserRepository');

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
