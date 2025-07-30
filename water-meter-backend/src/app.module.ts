// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { AppController } from './app.controller'; // Only if you have/need it
// import { AppService } from './app.service';     // Only if you have/need it
import { DatabaseModule } from './database/database.module';
import { SmsIngestionModule } from './sms-ingestion/sms-ingestion.module';
import { MeterReadingModule } from './meterReading/meterReading.module';
// ... any other modules like DevicesModule ...

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    SmsIngestionModule,
    MeterReadingModule,
    // DevicesModule,
  ],
  // controllers: [AppController], // Remove if app.controller.ts is gone
  // providers: [AppService],    // Remove if app.service.ts is gone
  controllers: [], // Explicitly empty if no app-level controllers
  providers: [], // Explicitly empty if no app-level services
})
export class AppModule {}
