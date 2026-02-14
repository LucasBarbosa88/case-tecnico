import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { AccessLog } from './access-log.entity';

export enum EnvironmentType {
  CLASSROOM = 'classroom',
  LABORATORY = 'laboratory',
  STUDY_ROOM = 'study_room',
}

@Entity('environments')
@Index(['name'], { unique: true, where: '"deletedAt" IS NULL' })
export class Environment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: EnvironmentType })
  type: EnvironmentType;

  @Column({ nullable: true, length: 500 })
  description: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ nullable: true, length: 100 })
  building: string;

  @Column({ nullable: true, length: 50 })
  floor: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => AccessLog, (accessLog) => accessLog.environment)
  accessLogs: AccessLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
