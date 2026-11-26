import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './http.exception';

/**
 * 权限不足异常 (403)
 */
export class ForbiddenException extends BaseHttpException {
  constructor(
    message: string = '权限不足，无法访问',
    error?: any,
  ) {
    super(message, HttpStatus.FORBIDDEN, error);
  }
}
