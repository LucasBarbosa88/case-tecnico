import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Environment } from '../../entities/environment.entity';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';

@Injectable()
export class EnvironmentsService {
  constructor(
    @InjectRepository(Environment)
    private readonly environmentRepository: Repository<Environment>,
  ) { }

  async create(createEnvironmentDto: CreateEnvironmentDto) {
    try {
      const environment = this.environmentRepository.create(createEnvironmentDto);
      return await this.environmentRepository.save(environment);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Já existe um ambiente ativo com este nome.');
      }
      throw new InternalServerErrorException('Erro ao criar ambiente');
    }
  }

  async findAll() {
    try {
      return await this.environmentRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar ambientes');
    }
  }

  async findOne(id: string) {
    try {
      const environment = await this.environmentRepository.findOne({ where: { id } });
      if (!environment) throw new NotFoundException('Ambiente não encontrado');
      return environment;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro ao buscar ambiente');
    }
  }

  async update(id: string, updateEnvironmentDto: UpdateEnvironmentDto) {
    try {
      const environment = await this.findOne(id);
      this.environmentRepository.merge(environment, updateEnvironmentDto);
      return await this.environmentRepository.save(environment);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.code === '23505') {
        throw new ConflictException('Já existe um ambiente ativo com este nome.');
      }
      throw new InternalServerErrorException('Erro ao atualizar ambiente');
    }
  }

  async remove(id: string) {
    try {
      const environment = await this.findOne(id);
      return await this.environmentRepository.softRemove(environment);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro ao remover ambiente');
    }
  }
}
