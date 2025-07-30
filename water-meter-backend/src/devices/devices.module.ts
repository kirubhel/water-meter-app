// src/devices/devices.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service'; // Note: Import order of Service and Controller differs from context, no functional change.
import { DevicesController } from './devices.controller';
import { DataEntity } from '../meterReading/meterReading.entity'; // Import DataEntity

@Module({
  imports: [TypeOrmModule.forFeature([DataEntity])], // Use DataEntity here
  controllers: [DevicesController],
  providers: [DevicesService],
  // exports: [DevicesService] // This line has been removed.
})
export class DevicesModule {}