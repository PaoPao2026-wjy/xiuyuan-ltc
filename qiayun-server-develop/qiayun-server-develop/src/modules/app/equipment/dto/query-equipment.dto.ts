// src/modules/app/equipment/dto/query-equipment.dto.ts
import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { EquipmentType } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryEquipmentDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page = 1; // 页码，默认第1页

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize = 10; // 每页条数，默认10条
 
  @IsOptional()
  @IsEnum(EquipmentType)
  type?: EquipmentType; // 按设备类型筛选

  // @IsOptional()
  // @IsInt()
  // @Type(() => Number)
  // enterpriseId?: number; // 按企业筛选
}