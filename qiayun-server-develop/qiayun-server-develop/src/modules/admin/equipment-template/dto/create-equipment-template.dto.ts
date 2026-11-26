// src/modules/admin/equipment-template/dto/create-equipment-template.dto.ts
import { IsString, IsEnum, IsBoolean, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';
import { EquipmentTemplateType } from '@prisma/client';

export class CreateEquipmentTemplateDto {
  @IsString()
  @MaxLength(100)
  name: string; // 模板名称

  @IsEnum(EquipmentTemplateType)
  type: EquipmentTemplateType; // 模板类型

  @IsOptional()
  @IsString()
  description?: string; // 模板描述

  @IsOptional()
  @IsBoolean()
  isDefault = false; // 是否默认模板

  @IsNotEmpty({ message: '模板组合数据不能为空' })
  defaultStructure: any; // 模板参数结构（JSON字符串）
}