// src/modules/app/equipment/dto/query-default-template.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EquipmentTemplateType, EquipmentType } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryDefaultEquipmentTemplateDto {
  /**
   * 设备类型（必选）
   * 需传递EquipmentTemplateType枚举值（如HIGH_VOLTAGE_CABINET）
   */
 @IsNotEmpty({ message: '设备类型不能为空' })
  @IsEnum(EquipmentTemplateType, { message: '设备模板类型不合法' })
  type?: EquipmentTemplateType; // 按类型筛选
}