import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './http.exception';

/**
 * 资源冲突异常 (409)
 */
export class ConflictException extends BaseHttpException {
  constructor(
    message: string = '资源冲突',
    error?: any,
  ) {
    super(message, HttpStatus.CONFLICT, error);
  }
}
