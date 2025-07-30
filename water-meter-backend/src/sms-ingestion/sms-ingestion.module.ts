// src/sms-ingestion/sms-ingestion.module.ts
import { Module } from '@nestjs/common';
import { RawSmsController } from './raw-sms/raw-sms.controller';
import { RawSmsService } from './raw-sms/raw-sms.service';
// DatabaseModule is global, so no need to import it here for RawSmsService to use DatabaseService

@Module({
  controllers: [RawSmsController],
  providers: [RawSmsService],
})
export class SmsIngestionModule {}