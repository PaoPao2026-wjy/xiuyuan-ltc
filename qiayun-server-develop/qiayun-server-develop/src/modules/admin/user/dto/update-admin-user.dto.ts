import { IsString, IsPhoneNumber, IsEmail, MaxLength, IsEnum, IsOptional, MinLength } from 'class-validator';
import { AdminRole, AdminStatus } from '@prisma/client';

export class UpdateAdminUserDto {
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  @IsOptional()
  username?: string; // 用户名（可选更新）

  @IsString()
  @MaxLength(50)
  @IsOptional()
  realName?: string; // 真实姓名（可选更新）

  @IsPhoneNumber('CN', { message: '手机号格式错误' })
  @IsOptional()
  phone?: string; // 手机号（可选更新）

  @IsEmail({}, { message: '邮箱格式错误' })
  @MaxLength(100)
  @IsOptional()
  email?: string; // 邮箱（可选更新）

  @IsEnum(AdminRole, { message: '角色必须是ADMIN、MANAGER或STAFF' })
  @IsOptional()
  role?: AdminRole; // 角色（可选更新）

  @IsEnum(AdminStatus, { message: '状态必须是ACTIVE、INACTIVE或LOCKED' })
  @IsOptional()
  status?: AdminStatus; // 状态（可选更新）

  @IsString()
  @MaxLength(200)
  @IsOptional()
  avatar?: string; // 头像URL（可选更新）
}