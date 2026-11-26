import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './http.exception';

/**
 * 未授权异常 (401)
 */
export class UnauthorizedException extends BaseHttpException {
  constructor(
    message: string = '未授权访问',
    error?: any,
  ) {
    super(message, HttpStatus.UNAUTHORIZED, error);
  }
}
