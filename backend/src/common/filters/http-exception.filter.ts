import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'object' && res !== null && 'message' in res
        ? (res as any).message
        : res;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.CONFLICT;
      const driverError = (exception as any).driverError;
      if (driverError && driverError.code === '23505') {
        message = 'Registro duplicado. Verifique se os dados já existem (email, matrícula, etc).';
      } else {
        message = 'Erro de banco de dados: ' + exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `Http Status: ${status} Error Message: ${JSON.stringify(message)}`,
      (exception as any).stack,
    );

    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message[0] : message,
    });
  }
}

