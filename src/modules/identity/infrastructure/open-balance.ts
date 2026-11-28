import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class OpenBalance {
  constructor(private readonly dataSource: DataSource) {}

  async openIfMissing(accountId: number): Promise<void> {
    await this.dataSource.query(
      'UPDATE accounts SET balance = 0 WHERE id = ? AND balance IS NULL',
      [accountId],
    );
  }
}
