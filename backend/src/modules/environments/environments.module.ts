import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentsService } from './environments.service';
import { EnvironmentsController } from './environments.controller';
import { Environment } from '../../entities/environment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Environment])],
  controllers: [EnvironmentsController],
  providers: [EnvironmentsService],
  exports: [EnvironmentsService],
})
export class EnvironmentsModule { }
