// src/modules/admin/equipment-template/dto/update-equipment-template.dto.ts
import { IsString, IsEnum, IsBoolean, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';
import { EquipmentTemplateType } from '@prisma/client';

export class UpdateEquipmentTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string; // 模板名称（可选更新）

  @IsOptional()
  @IsEnum(EquipmentTemplateType)
  type?: EquipmentTemplateType; // 模板类型（可选更新）

  @IsOptional()
  @IsString()
  description?: string; // 模板描述（可选更新）

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean; // 是否默认模板（可选更新）

  @IsOptional()
  @IsNotEmpty({ message: '模板组合数据不能为空' })
  defaultStructure?: any; // 模板参数结构（JSON字符串，可选更新）
}