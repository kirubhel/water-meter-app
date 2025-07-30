import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('meter_data')
export class DataEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  MID: string;

  @Column()
  status_code: string;

  @Column() // If this is a numeric value, consider: @Column('float') or @Column('decimal', { precision: 5, scale: 2 })
  battery_vol: string; // Potentially: number;

  @Column()
  network: string;

  @Column() // If this is a numeric value, consider: @Column('float') or @Column('decimal', { precision: 10, scale: 3 })
  WH: string; // Potentially: number;

}
