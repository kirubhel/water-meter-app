import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataEntity } from '../meterReading/meterReading.entity'; // Use DataEntity from meterReading module
import { RegisterDeviceInfoDto } from './dto/create-device-info.dto';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(DataEntity) // Inject Repository for DataEntity
    private readonly meterDataRepository: Repository<DataEntity>,
  ) {}

  async registerOrUpdateDevice(registerDeviceInfoDto: RegisterDeviceInfoDto): Promise<DataEntity> {
    const { MID, ...deviceSpecificInfo } = registerDeviceInfoDto;

    if (!MID) {
      this.logger.error('MID (Meter ID) is missing in the DTO.');
      throw new InternalServerErrorException('MID (Meter ID) is required to register or update device information.');
    }

    let meterRecord = await this.meterDataRepository.findOne({ where: { MID } });

    if (meterRecord) {
      // Record exists, update it with new device info from DTO
      this.logger.log(`Found existing record for MID: ${MID}. Updating device information...`);
      // Object.assign safely copies properties from DTO to the entity instance
      Object.assign(meterRecord, deviceSpecificInfo);
    } else {
      // Record does not exist, create a new one in dbo.meter_data
      // This assumes that a record for an MID might not exist yet,
      // and registering device info can create it.
      // If a record MUST exist from a prior SMS reading, you might throw a NotFoundException here.
      this.logger.log(`No existing record for MID: ${MID}. Creating new record with device information...`);
      meterRecord = this.meterDataRepository.create({
        MID, // Include MID
        ...deviceSpecificInfo // Spread device-specific properties
      });
    }

    try {
      return await this.meterDataRepository.save(meterRecord);
    } catch (error) {
      this.logger.error(`Failed to save device/meter data for MID: ${MID}`, error.stack);
      throw new InternalServerErrorException('Failed to register or update device information.');
    }
  }
}
