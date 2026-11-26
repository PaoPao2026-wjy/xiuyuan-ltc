// src/modules/admin/equipment/dto/query-equipment.dto.ts
import { IsOptional, IsEnum, IsInt, Min, IsString, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentType } from '@prisma/client';

export class QueryEquipmentDto {
  // 分页参数
  @IsOptional()
  @IsInt()
  @Min(1) // 页码最小为1
  @Type(() => Number) // 自动将查询参数转为数字（避免字符串类型）
  page = 1; // 默认值：第1页

  @IsOptional()
  @IsInt()
  @Min(1) // 每页最小1条
  @Max(100) // 限制最大100条，避免全量查询性能问题
  @Type(() => Number)
  pageSize = 10; // 默认值：每页10条

  // 筛选参数
  @IsOptional()
  @IsEnum(EquipmentType)
  type?: EquipmentType; // 按设备类型筛选

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  enterpriseId?: number; // 按企业筛选


  @IsOptional()
  @IsString()
  keyword?: string; // 模糊搜索（设备名称/编号）
}