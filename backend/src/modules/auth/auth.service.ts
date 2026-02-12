import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: registerDto.email },
          { registration: registerDto.registration },
        ],
      });

      if (existingUser) {
        throw new ConflictException('Email ou matrícula já cadastrados');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      const user = this.userRepository.create({
        ...registerDto,
        password: hashedPassword,
        role: UserRole.STUDENT,
      });

      const savedUser = await this.userRepository.save(user);

      return this.buildResponse(savedUser);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      if (error.code === '23505') {
        throw new ConflictException('Email ou matrícula já cadastrados');
      }
      throw new InternalServerErrorException('Erro ao registrar usuário');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const response = this.buildResponse(user);
      return response;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Erro ao realizar login');
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Erro ao buscar perfil');
    }
  }

  private buildResponse(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const { password, ...userData } = user;

    return {
      user: userData,
      access_token: this.jwtService.sign(payload),
    };
  }
}
