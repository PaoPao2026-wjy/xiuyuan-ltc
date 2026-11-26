// src/modules/admin/operation-items/dto/update-operation-item.dto.ts
import { IsEnum, IsString, IsOptional, MaxLength, ValidateIf } from 'class-validator';
import { OperationType } from '@prisma/client';

export class UpdateOperationItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string; // 可选更新名称

  @IsOptional()
  @IsEnum(OperationType)
  type?: OperationType; // 可选更新类型

  // 若更新为 SELECT 类型，options 为必填
  @IsOptional()
  @ValidateIf(o => o.type === OperationType.SELECT)
  options?: string[]; // 可选更新下拉选项
}