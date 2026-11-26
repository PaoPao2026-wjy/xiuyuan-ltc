// src/modules/admin/equipment-template/dto/query-equipment-template.dto.ts
import { IsOptional, IsEnum, IsInt, Min, IsBoolean, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EquipmentTemplateType } from '@prisma/client';

export class QueryEquipmentTemplateDto {
  // 分页参数
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page = 1; // 页码，默认第1页

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize = 10; // 每页条数，默认10条

  // 筛选参数
  @IsOptional()
  @IsEnum(EquipmentTemplateType)
  type?: EquipmentTemplateType; // 按类型筛选

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
  // 处理逻辑：转字符串→去空格→小写
  const strValue = typeof value === 'string' 
    ? value.trim().toLowerCase() 
    : String(value).toLowerCase(); // 非字符串转字符串后处理
  switch (strValue) {
    case 'true':
    case '1':
      return true;
    case 'false':
    case '0':
      return false;
    default:
      console.warn(`未匹配的isDefault值：${strValue}`);
      return undefined;
  }
})
  isDefault?: boolean; // 按是否默认筛选
}