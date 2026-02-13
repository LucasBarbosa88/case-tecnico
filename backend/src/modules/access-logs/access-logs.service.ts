import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { AccessLog } from '../../entities/access-log.entity';
import { CreateAccessLogDto, AccessAction } from './dto/create-access-log.dto';

@Injectable()
export class AccessLogsService {
  constructor(
    @InjectRepository(AccessLog)
    private readonly accessLogRepository: Repository<AccessLog>,
  ) { }

  async registerAccess(createAccessLogDto: CreateAccessLogDto) {
    const { studentId, environmentId, action } = createAccessLogDto;

    try {
      // Check for active session
      const activeSession = await this.accessLogRepository.findOne({
        where: {
          userId: studentId,
          checkOut: IsNull(),
        },
        order: { checkIn: 'DESC' },
      });

      if (action === AccessAction.CHECK_IN) {
        if (activeSession) {
          throw new BadRequestException('Aluno já possui um check-in ativo em outro ambiente.');
        }

        const log = this.accessLogRepository.create({
          userId: studentId,
          environmentId: environmentId,
          checkIn: new Date(),
        });
        return await this.accessLogRepository.save(log);
      }

      if (action === AccessAction.CHECK_OUT) {
        if (!activeSession) {
          throw new BadRequestException('Não há check-in ativo para realizar check-out.');
        }

        if (activeSession.environmentId !== environmentId) {
          throw new BadRequestException('O check-out deve ser feito no mesmo ambiente do check-in.');
        }

        activeSession.checkOut = new Date();
        return await this.accessLogRepository.save(activeSession);
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Erro ao registrar acesso: ' + error.message);
    }
  }

  async findAll(userId: string, role: string) {
    try {
      const query = this.accessLogRepository.createQueryBuilder('log')
        .leftJoinAndSelect('log.user', 'user')
        .leftJoinAndSelect('log.environment', 'environment')
        .withDeleted()
        .orderBy('log.checkIn', 'DESC');

      if (role === 'student') {
        query.where('log.userId = :userId', { userId });
      }

      const logs = await query.getMany();
      return logs;
    } catch (error) {
      console.error('Error in AccessLogsService.findAll:', error);
      throw new InternalServerErrorException('Erro ao listar registros de acesso');
    }
  }
}
