// src/database/database.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get('DB_SERVER'),
        port: parseInt(config.get('DB_PORT') || '1433'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        options: {
          encrypt: config.get('DB_OPTIONS_ENCRYPT') === 'true',
          trustServerCertificate:
            config.get('DB_OPTIONS_TRUST_SERVER_CERTIFICATE') === 'true',
          enableArithAbort: true,
        },
        extra: {
          options: {
            encrypt: config.get('DB_OPTIONS_ENCRYPT') === 'true',
            trustServerCertificate:
              config.get('DB_OPTIONS_TRUST_SERVER_CERTIFICATE') === 'true',
          }
        },
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
      })
    })
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}