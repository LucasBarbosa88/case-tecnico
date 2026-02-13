import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessLogsService } from './access-logs.service';
import { AccessLogsController } from './access-logs.controller';
import { AccessLog } from '../../entities/access-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccessLog])],
  controllers: [AccessLogsController],
  providers: [AccessLogsService],
  exports: [AccessLogsService],
})
export class AccessLogsModule { }
