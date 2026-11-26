// src/modules/mini-app/auth/dto/wechat-register-login.dto.ts
import { LoginRole } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class WechatRegisterLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'code 不能为空' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: '手机号 encryptedData 不能为空（需授权手机号）' })
  phoneEncryptedData: string;

  @IsString()
  @IsNotEmpty({ message: '手机号 iv 不能为空' })
  phoneIv: string;

   @IsEnum(LoginRole)
  @IsNotEmpty({ message: '登录角色不能为空' })
  loginRole: LoginRole; // 新增：登录角色（ENTERPRISE/INDIVIDUAL）
}