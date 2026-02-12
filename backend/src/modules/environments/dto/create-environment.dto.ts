import { IsString, IsNotEmpty, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentType } from '../../../entities/environment.entity';

export class CreateEnvironmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: EnvironmentType })
  @IsEnum(EnvironmentType)
  type: EnvironmentType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  building?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  floor?: string;
}
