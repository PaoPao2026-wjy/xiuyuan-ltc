// src/modules/admin/operation-items/dto/create-operation-item.dto.ts
import { IsEnum, IsString, IsOptional, MaxLength, ValidateIf } from 'class-validator';
import { OperationType } from '@prisma/client';

export class CreateOperationItemDto {
  @IsString()
  @MaxLength(100)
  name: string; // 操作项名称（必填）

  @IsEnum(OperationType)
  type: OperationType; // 操作类型（BOOLEAN/TEXT/SELECT，必填）

  // 仅当 type 为 SELECT 时，options 为必填（JSON数组，如 ["正常","异常"]）
  @IsOptional()
  @ValidateIf(o => o.type === OperationType.SELECT) // 条件验证
  options?: string[]; // 下拉选项（仅SELECT类型需要）
}