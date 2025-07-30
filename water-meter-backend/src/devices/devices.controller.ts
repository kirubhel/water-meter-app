// src/devices/devices.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { DevicesService } from './devices.service'; // <-- Corrected import path
   import { RegisterDeviceInfoDto } from './dto/create-device-info.dto';

@Controller('devices') // <--- Route is /devices
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post() // <--- Handles POST to /devices
  @HttpCode(HttpStatus.CREATED)
   async registerDevice(@Body(new ValidationPipe()) createDeviceInfoDto: RegisterDeviceInfoDto) {
    console.log('NestJS: POST /devices endpoint hit with body:', createDeviceInfoDto); // <--- ADD THIS LOG
    const device = await this.devicesService.registerOrUpdateDevice(createDeviceInfoDto);
    return {
      message: 'Device information registered/updated successfully',
      data: device,
    };
  }
}