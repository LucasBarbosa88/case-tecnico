import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createStudentDto: CreateStudentDto) {
    try {
      const existingDeleted = await this.userRepository.findOne({
        where: [
          { email: createStudentDto.email },
          { registration: createStudentDto.registration },
        ],
        withDeleted: true,
      });

      if (existingDeleted && existingDeleted.deletedAt) {
        existingDeleted.deletedAt = null as any;
        const hashedPassword = await bcrypt.hash(createStudentDto.password, 10);
        this.userRepository.merge(existingDeleted, {
          ...createStudentDto,
          password: hashedPassword,
        });
        return await this.userRepository.save(existingDeleted);
      }

      const hashedPassword = await bcrypt.hash(createStudentDto.password, 10);
      const student = this.userRepository.create({
        ...createStudentDto,
        password: hashedPassword,
        role: UserRole.STUDENT,
      });
      return await this.userRepository.save(student);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email ou matrícula já cadastrados em um aluno ativo.');
      }
      throw new InternalServerErrorException('Erro ao criar aluno');
    }
  }

  async findAll() {
    try {
      return await this.userRepository.find({
        where: { role: UserRole.STUDENT },
        select: ['id', 'name', 'email', 'registration', 'isActive', 'createdAt'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar alunos');
    }
  }

  async findOne(id: string) {
    try {
      const student = await this.userRepository.findOne({
        where: { id, role: UserRole.STUDENT },
      });
      if (!student) throw new NotFoundException('Estudante não encontrado');
      const { password, ...result } = student;
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro ao buscar aluno');
    }
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    try {
      const student = await this.userRepository.findOne({ where: { id } });
      if (!student) throw new NotFoundException('Estudante não encontrado');

      if (updateStudentDto.email || updateStudentDto.registration) {
        const conflicting = await this.userRepository.findOne({
          where: [
            { email: updateStudentDto.email || student.email },
            { registration: updateStudentDto.registration || student.registration },
          ],
          withDeleted: true,
        });

        if (conflicting && conflicting.id !== id) {
          if (conflicting.deletedAt) {
            const timestamp = Date.now();
            if (conflicting.email === updateStudentDto.email) {
              conflicting.email = `deletado-${timestamp}-${conflicting.email}`;
            }
            if (conflicting.registration === updateStudentDto.registration) {
              conflicting.registration = `DEL-${timestamp}-${conflicting.registration}`;
            }
            await this.userRepository.save(conflicting);
          } else {
            throw new ConflictException('Email ou matrícula já cadastrados em um aluno ativo.');
          }
        }
      }

      if (updateStudentDto.password) {
        updateStudentDto.password = await bcrypt.hash(updateStudentDto.password, 10);
      }

      await this.userRepository.update(id, updateStudentDto);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      if (error.code === '23505') {
        throw new ConflictException('Já existe um aluno ativo com este email ou matrícula.');
      }
      throw new InternalServerErrorException('Erro ao atualizar aluno');
    }
  }

  async remove(id: string) {
    try {
      const student = await this.userRepository.findOne({ where: { id } });
      if (!student) throw new NotFoundException('Estudante não encontrado');
      return await this.userRepository.softRemove(student);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro ao remover aluno');
    }
  }
}
