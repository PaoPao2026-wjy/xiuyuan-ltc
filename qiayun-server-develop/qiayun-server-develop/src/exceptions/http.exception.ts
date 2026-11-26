import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 基础HTTP异常类，继承自NestJS的HttpException
 */
export class BaseHttpException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    public error?: any,
  ) {
    super(
      {
        code: statusCode,
        message,
        error: error || null,
      },
      statusCode,
    );
  }
}
