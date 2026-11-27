import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HERO_REPOSITORY } from './domain/repositories/hero.repository.interface';
import { HeroOrmEntity } from './infrastructure/persistence/typeorm/hero.orm-entity';
import { TypeOrmHeroRepository } from './infrastructure/persistence/typeorm/hero.repository';
import { GetHeroHandler } from './application/queries/get-hero/get-hero.handler';
import { GetHeroPairHandler } from './application/queries/get-hero-pair/get-hero-pair.handler';
import { ListHeroesHandler } from './application/queries/list-heroes/list-heroes.handler';
import { HeroController } from './presentation/http/hero.controller';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([HeroOrmEntity])],
  controllers: [HeroController],
  providers: [
    GetHeroHandler,
    GetHeroPairHandler,
    ListHeroesHandler,
    TypeOrmHeroRepository,
    {
      provide: HERO_REPOSITORY,
      useClass: TypeOrmHeroRepository,
    },
  ],
  exports: [CqrsModule, TypeOrmModule],
})
export class HeroCatalogModule {}
