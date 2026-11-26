import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './http.exception';

/**
 * 请求参数错误异常 (400)
 */
export class BadRequestException extends BaseHttpException {
  constructor(
    message: string = '请求参数错误',
    error?: any,
  ) {
    super(message, HttpStatus.BAD_REQUEST, error);
  }
}
