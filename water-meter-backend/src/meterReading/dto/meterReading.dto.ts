import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDataDto {
  @IsNotEmpty()
  @IsString()
  reading: string;
}
