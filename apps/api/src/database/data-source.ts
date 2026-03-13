import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,

  synchronize: false,

  entities: ['src/**/*.entity.ts', 'dist/**/*.entity.js'],

  migrations: ['src/database/migrations/*.ts'],
});
