import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataEntity } from './meterReading.entity';
// Assuming CreateDataDto is used by the controller, even if only its 'reading' property is passed here.
// import { CreateDataDto } from './dto/meterReading.dto';

@Injectable()
export class MeterReadingService { // Renamed for better clarity
  private readonly logger = new Logger(MeterReadingService.name);

  constructor(
    @InjectRepository(DataEntity)
    private dataRepository: Repository<DataEntity>,
  ) {}

  async saveData(reading: string): Promise<{ message: string; data: DataEntity }> {
    this.logger.log(`Attempting to save data from reading: ${reading}`);
    let values = reading.split(',');
    if (values.length < 7) {
      this.logger.error('Malformed reading data received.', reading);
      throw new BadRequestException('Malformed reading data: Expected at least 7 comma-separated values.');
    }

    let [_, __, MID, status_code, battery_vol, network, WH] = values;

    if (!MID) {
      this.logger.error('MID is missing from the parsed reading data.', reading);
      throw new BadRequestException('MID is missing from the reading data.');
    }

    try {
      let record = await this.dataRepository.findOne({ where: { MID } });

      if (record) {
        this.logger.log(`Found existing record for MID: ${MID}. Updating.`);
        record.status_code = status_code;
        record.battery_vol = battery_vol;
        record.network = network;
        record.WH = WH;
        record.timestamp = new Date(); // Update timestamp to reflect latest SMS data
      } else {
        this.logger.log(`No existing record for MID: ${MID}. Creating new record.`);
        record = this.dataRepository.create({ MID, status_code, battery_vol, network, WH });
        // For new records, 'timestamp' will be set by @CreateDateColumn
      }
      const savedData = await this.dataRepository.save(record);
      this.logger.log(`Data for MID: ${MID} saved successfully with id: ${savedData.id}`);
      return { message: "Data received and stored successfully.", data: savedData };
    } catch (error) {
      this.logger.error(`Error saving data for MID: ${MID}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to save data for MID: ${MID}.`);
    }
  }

  async getLatestData(): Promise<DataEntity[]> {
    console.log('Backend: getLatestData (latest per MID) called'); // Add log
    const subQuery = this.dataRepository
      .createQueryBuilder('subData')
      .select('subData.MID', 'MID')
      .addSelect('MAX(subData.timestamp)', 'maxTimestamp')
      .groupBy('subData.MID');

    const results = await this.dataRepository
      .createQueryBuilder('data')
      .innerJoin(
        `(${subQuery.getQuery()})`,
        'latest',
        'data.MID = latest.MID AND data.timestamp = latest.maxTimestamp'
      )
      .orderBy('data.timestamp', 'DESC') // Ensure consistent ordering if multiple records have exact same maxTimestamp
      .getMany();
    console.log(`Backend: getLatestData (latest per MID) found ${results.length} records.`); // Add log
    return results;
  }

  async getDataByMeterId(date?: string, MID?: string): Promise<DataEntity[]> {
    this.logger.log(`Fetching data by Meter ID: ${MID}, Date: ${date}`);
    const query = this.dataRepository.createQueryBuilder('data');

    if (MID) {
      query.andWhere('data.MID = :MID', { MID });
    }
    if (date) {
      query.andWhere('DATE(data.timestamp) = DATE(:date)', { date }); // Using DATE() function for date part comparison
    }
    query.orderBy('data.timestamp', 'DESC').limit(100); // Consider if limit is always needed or configurable

    const results = await query.getMany();
    this.logger.log(
      `Found ${results.length} records for MID: ${MID}, Date: ${date}`,
    );
    return results;
  }
}