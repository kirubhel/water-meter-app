import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { MeterReadingService } from './meterReading.service';
import { CreateDataDto } from './dto/meterReading.dto';
import { DataEntity } from './meterReading.entity'; // For explicit return types

@Controller('data')
export class DataController {
  constructor(private readonly dataService: MeterReadingService) {}

  @Post()
  async createData(
    @Body() createDataDto: CreateDataDto,
  ): Promise<{ message: string; data: DataEntity }> { // More specific return type
    try {
      return await this.dataService.saveData(createDataDto.reading);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async getLatestData(): Promise<DataEntity[]> {
    return await this.dataService.getLatestData();
  }

  @Get('dataByMeterId')
  async getDataByMeterId(
    @Query('date') date?: string,
    @Query('MID') MID?: string,
  ): Promise<DataEntity[]> {
    return await this.dataService.getDataByMeterId(date, MID);
  }
}
