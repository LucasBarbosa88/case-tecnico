import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { EnvironmentsService } from './environments.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Environments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) { }

  @Post()
  @ApiOperation({ summary: 'Criar ambiente' })
  create(@Body() createEnvironmentDto: CreateEnvironmentDto) {
    return this.environmentsService.create(createEnvironmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os ambientes' })
  findAll() {
    return this.environmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ambiente por ID' })
  findOne(@Param('id') id: string) {
    return this.environmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ambiente' })
  update(@Param('id') id: string, @Body() updateEnvironmentDto: UpdateEnvironmentDto) {
    return this.environmentsService.update(id, updateEnvironmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover ambiente' })
  remove(@Param('id') id: string) {
    return this.environmentsService.remove(id);
  }
}
