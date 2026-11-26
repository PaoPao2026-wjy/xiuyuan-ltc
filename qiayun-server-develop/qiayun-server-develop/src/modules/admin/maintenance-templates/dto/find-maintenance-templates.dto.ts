// src/modules/admin/maintenance-templates/dto/find-maintenance-templates.dto.ts
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindMaintenanceTemplatesDto {
  // 分页参数
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize = 10;

  // 关键词搜索：模板名称模糊匹配
  @IsOptional()
  @IsString()
  keyword?: string;
}