// src/modules/admin/dto/reset-password.dto.ts
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(6, { message: '新密码长度不能少于6位' })
  @MaxLength(20, { message: '新密码长度不能超过20位' })
  @Matches(/^(?=.*[^\d]).+$/, { 
    message: '新密码不能是纯数字，必须包含字母或符号' 
  })
  newPassword: string;
}