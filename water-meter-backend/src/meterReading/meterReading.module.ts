import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataEntity } from './meterReading.entity';
import { MeterReadingService } from './meterReading.service';
import { DataController } from './meterReading.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DataEntity])],
  providers: [MeterReadingService],
  controllers: [DataController],
})
export class MeterReadingModule {}
