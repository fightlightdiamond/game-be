import { DataSource } from 'typeorm';
import { HeroesEntity } from './heroes.entity';

export const HeroProviders = [
  {
    provide: 'HERO_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(HeroesEntity),
    inject: ['DATA_SOURCE'],
  },
];
