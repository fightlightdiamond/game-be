import { Module } from '@nestjs/common';
import { LEDGER } from './domain/ledger';
import { TypeOrmLedger } from './infrastructure/typeorm-ledger';

@Module({
  providers: [{ provide: LEDGER, useClass: TypeOrmLedger }],
  exports: [LEDGER],
})
export class LedgerModule {}
