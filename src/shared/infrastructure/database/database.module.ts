import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfigAsync } from '../../../config/typeorm.config';

@Module({
  imports: [TypeOrmModule.forRootAsync(typeormConfigAsync)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
