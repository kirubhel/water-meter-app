import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('device_info')
export class DeviceInfoEntity { // Corrected casing in the class name to match filename
 @PrimaryGeneratedColumn()
  id: number;

  @Column()
  MeterId: string; // Changed 'name' to 'MeterId' to match the DTO and expected data

  @Column()
  DeviceMobileNumber: string; // Added DeviceMobileNumber

 // Add other columns as needed
}
