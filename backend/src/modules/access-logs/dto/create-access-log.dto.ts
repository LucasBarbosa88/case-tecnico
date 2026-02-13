import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AccessAction {
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
}

export class CreateAccessLogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  environmentId: string;

  @ApiProperty({ enum: AccessAction })
  @IsEnum(AccessAction)
  action: AccessAction;
}
