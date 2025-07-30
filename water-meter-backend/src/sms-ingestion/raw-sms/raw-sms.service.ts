// src/sms-ingestion/raw-sms/raw-sms.service.ts
import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service'; // <--- Correct import
import { NVarChar, DateTimeOffset, Int, Float } from 'mssql'; // Added Float

@Injectable()
export class RawSmsService {
  // It's good practice to have a dedicated logger instance for the service
  private readonly logger = new Logger(RawSmsService.name);

  constructor(
    // It's good practice to make injected services readonly
    private readonly databaseService: DatabaseService, // <--- Inject DatabaseService
  ) {}

  async processAndStoreSms(rawSms: string): Promise<{ message: string; parsedData?: any }> {
    this.logger.log(`RawSmsService: Processing SMS: "${rawSms}"`);

    if (!rawSms || !rawSms.startsWith("#") || !rawSms.includes(",")) {
      this.logger.warn(`Invalid SMS format received: "${rawSms}". Must start with # and contain commas.`);
      throw new BadRequestException(
        'Invalid SMS format: Must start with # and contain commas.',
      );
    }

    const parts = rawSms.split(',');
    // Expected format for Status: #,S,meterId,@,battery,network,volume (7 parts)
    // Expected format for Init:   #,I,password,meterId,server,vol,hand,digit (8 parts)

    let meterId_actual: string;
    let statusCode_actual: string | null = null;
    let batteryVol_actual: number | null = null;
    let network_actual: number | null = null;
    let wh_actual: number | null = null;
    const timestamp_actual = new Date(); // Use server time for the reading

    if (parts.length >= 3 && parts[0] === '#') {
      const messageTypeIndicator = parts[1].trim();

      if (messageTypeIndicator === 'S' && parts.length === 7 && parts[3].trim() === '@') {
        statusCode_actual = 'S_TYPE';
        meterId_actual = parts[2].trim();
        try {
          batteryVol_actual = parseInt(parts[4].trim(), 10);
          network_actual = parseInt(parts[5].trim(), 10);
          wh_actual = parseInt(parts[6].trim(), 10);
          if (isNaN(batteryVol_actual) || isNaN(network_actual) || isNaN(wh_actual)) {
            this.logger.warn(`Invalid numeric value in S-type SMS for meter ${meterId_actual}: ${rawSms}`);
            throw new BadRequestException('Invalid numeric value in S-type SMS parts after parsing.');
          }
        } catch (e) {
          this.logger.error(`Error parsing numeric values in S-type SMS for meter ${meterId_actual}: ${rawSms}`, e.stack);
          throw new BadRequestException(`Error parsing numeric values in S-type SMS: ${e instanceof Error ? e.message : String(e)}`);
        }
      } else if (messageTypeIndicator === 'I' && parts.length === 8) {
        statusCode_actual = 'I_TYPE';
        meterId_actual = parts[3].trim(); // Meter ID is at index 3 for init
        this.logger.log(`Initialization SMS received for MeterID: ${meterId_actual}. Raw: ${rawSms}`);
        // Not storing Init messages in meter_data in this version
        return {
          message: `Initialization SMS for ${meterId_actual} processed (not stored in meter_data).`,
          parsedData: { meterId: meterId_actual, type: 'I', rawSms: rawSms }
        };
      } else {
        this.logger.warn(`Unsupported SMS structure or type indicator: "${messageTypeIndicator}" in SMS: "${rawSms}"`);
        throw new BadRequestException(`Unsupported SMS structure or type indicator: ${messageTypeIndicator}`);
      }

      if (!meterId_actual || meterId_actual.trim() === '') {
        this.logger.warn(`Meter ID in SMS cannot be empty. SMS: "${rawSms}"`);
        throw new BadRequestException('Meter ID in SMS cannot be empty.');
      }

      // Only insert S_TYPE messages with validly parsed numeric data
      if (statusCode_actual === 'S_TYPE' && batteryVol_actual !== null && network_actual !== null && wh_actual !== null) {
        try {
          const request = this.databaseService.getRequest();
          request.input('MID', NVarChar(50), meterId_actual);
          request.input('timestamp', DateTimeOffset, timestamp_actual);
          request.input('status_code', NVarChar(10), statusCode_actual); // Using NVarChar(10) as per new logic
          request.input('battery_vol', Int, batteryVol_actual); // Using Int as per new logic
          request.input('network', Int, network_actual);       // Using Int as per new logic
          request.input('WH', Int, wh_actual);                 // Using Int as per new logic

          const dbResult = await request.query`
            INSERT INTO dbo.meter_data (MID, [timestamp], status_code, battery_vol, network, WH)
            VALUES (@MID, @timestamp, @status_code, @battery_vol, @network, @WH)
          `;

          this.logger.log(
            `RawSmsService: Successfully inserted reading for MeterID: ${meterId_actual}, WH: ${wh_actual}. Rows affected: ${dbResult.rowsAffected ? dbResult.rowsAffected[0] : 'N/A'}`,
          );
          return {
            message: `Reading for MeterID ${meterId_actual} stored successfully.`,
            parsedData: {
                meterId: meterId_actual,
                timestamp: timestamp_actual.toISOString(),
                statusCode: statusCode_actual,
                batteryVol: batteryVol_actual,
                network: network_actual,
                wh: wh_actual
            },
          };
        } catch (dbError) {
          this.logger.error(
            `Database error storing SMS data for meter ${meterId_actual}: ${dbError.message}`,
            dbError.stack,
          );
          throw new InternalServerErrorException(
            'Failed to store SMS data due to a database error.',
          );
        }
      }
    } else {
      this.logger.warn(
        `Invalid SMS structure (not enough parts or incorrect start char) for SMS: "${rawSms}"`,
      );
      throw new BadRequestException(
        'Invalid SMS structure: Not enough parts or incorrect starting character after initial check.',
      );
    }

    // Fallback for any unhandled S_TYPE paths or logic errors
    this.logger.error(
      `Reached end of processAndStoreSms without returning a value or throwing a specific error for SMS: "${rawSms}"`,
    );
    throw new InternalServerErrorException(
      'An unexpected error occurred while processing the SMS data.',
    );
  }
}