import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccessLogsService } from './access-logs.service';
import { CreateAccessLogDto } from './dto/create-access-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Access Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('access-logs')
export class AccessLogsController {
  constructor(private readonly accessLogsService: AccessLogsService) { }

  @Post()
  @ApiOperation({ summary: 'Registrar entrada ou saída' })
  create(@Body() createAccessLogDto: CreateAccessLogDto) {
    return this.accessLogsService.registerAccess(createAccessLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar histórico de acessos' })
  findAll(@Req() req: any) {
    return this.accessLogsService.findAll(req.user.sub, req.user.role);
  }
}
