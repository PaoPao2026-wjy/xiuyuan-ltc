// src/modules/mini-app/auth/dto/get-by-openid.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class GetByOpenidDto {
  @IsString()
  @IsNotEmpty({ message: 'openid 不能为空' })
  openid: string;
}