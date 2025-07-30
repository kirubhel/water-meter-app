// src/devices/dto/create-device-info.dto.ts
// If you integrate this into MeterReadingModule, it might be src/meterReading/dto/register-device.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterDeviceInfoDto { // Renamed for clarity
  @IsString()
  @IsNotEmpty()
  MID: string; // Meter ID - This is crucial for linking

  @IsString()
  @IsNotEmpty()
  devicePlatformId: string; // Unique ID from the Flutter app's device

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  osVersion: string;

  @IsString()
  @IsOptional()
  fcmToken?: string; // From Flutter's DeviceInfoPayload.fcmToken
}