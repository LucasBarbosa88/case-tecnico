import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { AccessLog } from '../../entities/access-log.entity';
import { Environment } from '../../entities/environment.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(AccessLog)
    private readonly accessLogRepository: Repository<AccessLog>,
    @InjectRepository(Environment)
    private readonly environmentRepository: Repository<Environment>,
  ) { }

  async getOccupationData() {
    const activeSessions = await this.accessLogRepository.find({
      where: { checkOut: IsNull() },
      relations: ['environment'],
    });

    const occupationMap = new Map<string, number>();
    activeSessions.forEach((session) => {
      const envId = session.environmentId;
      occupationMap.set(envId, (occupationMap.get(envId) || 0) + 1);
    });

    const environments = await this.environmentRepository.find();

    const data = environments.map((env) => {
      const currentOccupancy = occupationMap.get(env.id) || 0;
      const occupationRate = env.capacity > 0 ? (currentOccupancy / env.capacity) * 100 : 0;

      return {
        environmentId: env.id,
        name: env.name,
        type: env.type,
        capacity: env.capacity,
        currentOccupancy,
        occupationRate: Number(occupationRate.toFixed(2)),
      };
    });

    return data;
  }
}
