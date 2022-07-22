// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
// require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

module.exports = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || '3306', //parseInt(process.env.DB_PORT!, 10) || 3306,
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  type: process.env.DB_CONNECTION || 'mysql',
  database: process.env.DB_DATABASE || '',
  entities: ['**/*.entity{ .ts,.js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  migrations: ['src/migrations/*.js'],
  factories: ['src/migrations/factories/*.factory{.ts,.js}'],
  seeds: ['src/migrations/seeders/*.seed{.ts,.js}'],
  cli: {
    entitiesDir: 'src',
    subscribersDir: 'src',
    migrationsDir: 'src/migrations',
  },
};
