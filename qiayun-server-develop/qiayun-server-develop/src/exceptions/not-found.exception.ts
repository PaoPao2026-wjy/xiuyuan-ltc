import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './http.exception';

/**
 * 资源未找到异常 (404)
 */
export class NotFoundException extends BaseHttpException {
  constructor(
    message: string = '请求的资源不存在',
    error?: any,
  ) {
    super(message, HttpStatus.NOT_FOUND, error);
  }
}
