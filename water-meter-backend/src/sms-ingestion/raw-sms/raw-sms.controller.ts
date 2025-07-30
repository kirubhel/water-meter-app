// src/sms-ingestion/raw-sms/raw-sms.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RawSmsService } from './raw-sms.service'; // Import the service
import { IsNotEmpty, IsString } from 'class-validator';

export class RawSmsDto {
  @IsString()
  @IsNotEmpty()
  smsData: string;
}

@Controller('api')
export class RawSmsController {
  constructor(private readonly rawSmsService: RawSmsService) {} // Inject service

  @Post('raw-sms-data')
  @HttpCode(HttpStatus.CREATED)
  async receiveRawSms(@Body() payload: RawSmsDto): Promise<any> {
    // Changed to async and Promise<any>
    console.log(
      '>>> NestJS Backend: Controller received POST to /api/raw-sms-data',
    );
    const { smsData } = payload;
    console.log(
      '>>> NestJS Backend: Controller received raw SMS content:',
      smsData,
    );

    try {
      const result = await this.rawSmsService.processAndStoreSms(smsData);
      return result; // Return the result from the service
    } catch (error) {
      // Handle errors thrown by the service (e.g., BadRequestException, InternalServerErrorException)
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error; // Re-throw NestJS HTTP exceptions
      }
      console.error(
        '>>> NestJS Backend: Controller caught unexpected error:',
        error,
      );
      throw new InternalServerErrorException(
        'An unexpected error occurred while processing the SMS.',
      );
    }
  }
}