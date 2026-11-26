import { IsNumber, IsEnum, IsOptional, Min, IsString, IsInt } from 'class-validator'; 
import { Transform } from 'class-transformer';
import {Type } from 'class-transformer'; // 必须导入
import { AdminRole, AdminStatus } from '@prisma/client';

export class QueryAdminUserDto {

  @IsInt({ message: 'page必须是整数' })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'page必须是有效数字' })
  @Min(1, { message: 'page必须不小于1' })
  @IsOptional() // 允许前端不传参
  @Type(() => Number) // 强制将字符串转为数字（如"1"→1）
  @Transform(({ value }) => {
    return value === undefined ? 1 : Number(value);
  })
  page?: number;

  @IsInt({ message: 'pageSize必须是整数' })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'pageSize必须是有效数字' })
  @Min(1, { message: 'pageSize必须不小于1' })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => {
    return value === undefined ? 10 : Number(value);
  })
  pageSize?: number;

  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole; // 按角色筛选（可选）

  @IsEnum(AdminStatus)
  @IsOptional()
  status?: AdminStatus; // 按状态筛选（可选）

  @IsString()
  @IsOptional()
  keyword?: string; // 搜索关键词（匹配用户名/真实姓名/手机号，可选）
}