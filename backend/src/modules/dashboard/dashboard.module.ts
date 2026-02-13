import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AccessLog } from '../../entities/access-log.entity';
import { Environment } from '../../entities/environment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccessLog, Environment])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
