import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../../domain/account';
import { Address } from '../../../domain/address';
import { AccountRepository } from '../../../domain/repositories/account.repository';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class TypeOrmUserRepository implements AccountRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly orm: Repository<UserOrmEntity>,
  ) {}

  async findById(id: number): Promise<Account | null> {
    const row = await this.orm.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<Account | null> {
    const row = await this.orm.findOne({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async save(account: Account): Promise<Account> {
    const saved = await this.orm.save(this.toOrm(account));
    return this.toDomain(saved);
  }

  private async toDomain(row: UserOrmEntity): Promise<Account> {
    return new Account(
      row.id,
      row.email,
      row.password,
      row.role,
      row.confirmed,
      await this.addressOf(row.id),
    );
  }

  private toOrm(account: Account): UserOrmEntity {
    const row = new UserOrmEntity();
    if (account.id) {
      row.id = account.id;
    }
    row.email = account.getEmail();
    row.password = account.getPasswordHash();
    row.role = account.role;
    row.confirmed = account.confirmedEmail;
    return row;
  }

  private async addressOf(accountId: number): Promise<Address | null> {
    const rows = await this.orm.manager.query(
      'SELECT street, city, country FROM addresses WHERE userId = ? LIMIT 1',
      [accountId],
    );
    const row = Array.isArray(rows) ? rows[0] : undefined;
    if (!row) {
      return null;
    }
    return {
      street: row.street,
      city: row.city,
      country: row.country,
    };
  }
}
