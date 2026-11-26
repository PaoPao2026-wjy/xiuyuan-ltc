import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // 提取 message
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // 如果是对象，优先取 message 字段
        message = (exceptionResponse as any).message || 'Bad Request';
      } else {
        message = 'Bad Request';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '服务器内部错误';
      
      // 记录未知错误的详细信息
      this.logger.error(
        `Unhandled exception: ${exception}`,
        (exception as Error)?.stack,
      );
    }

    // 统一返回格式：{ code, message, data }
    const errorResponse = {
      code: status,
      message,
      error: HttpStatus[status] || 'Error',
      statusCode: status,
    };

    // 记录错误信息
    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      JSON.stringify({ message, stack: (exception as Error)?.stack }),
    );

    response.status(status).json(errorResponse);
  }
} 