import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/aggregates/user.aggregate';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly orm: Repository<UserOrmEntity>,
  ) {}

  async findById(id: number): Promise<User | null> {
    const row = await this.orm.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.orm.findOne({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<User> {
    const row = this.toOrm(user);
    const saved = await this.orm.save(row);
    return this.toDomain(saved);
  }

  private toDomain(row: UserOrmEntity): User {
    return new User(row.id, row.email, row.password, row.role, row.confirmed);
  }

  private toOrm(user: User): UserOrmEntity {
    const row = new UserOrmEntity();
    row.id = user.id;
    row.email = user.getEmail();
    row.password = user.getPasswordHash();
    row.role = user.role;
    row.confirmed = user.confirmedEmail;
    return row;
  }
}
