import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as entities from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get('database.host');
        const isProduction = configService.get('nodeEnv') === 'production';
        const isRenderDB = host?.includes('render.com');

        return {
          type: 'postgres',
          host,
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          entities: Object.values(entities),
          synchronize: true, // ⚠️ TEMPORAL - Cambiado a true para crear tablas iniciales
          logging: !isProduction,
          migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
          migrationsRun: false,
          // Activar SSL si es producción O si el host es de Render
          ssl: { rejectUnauthorized: false },
        };
      },
    }),
  ],
})
export class DatabaseModule { }
