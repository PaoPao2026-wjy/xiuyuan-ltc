import { IsEnum, IsInt, IsOptional, IsString, Min, Max, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkOrderDraftStatus, WorkOrderType, Priority } from '@prisma/client';

export class FindWorkOrderDraftsDto {
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

 // 草稿类型
  @IsOptional()
  @IsEnum(WorkOrderType)
  type?: WorkOrderType;

  // 草稿状态
  @IsOptional()
  @IsEnum(WorkOrderDraftStatus)
  draftStatus?: WorkOrderDraftStatus;

  // 优先级
  @IsOptional()
  @IsEnum(Priority) // 
  priority?: Priority;


  // 日期范围-开始时间
  @IsOptional()
  @IsString()
  @ValidateIf(o => o.endDate !== undefined)
  startDate?: string;

  // 日期范围-结束时间
  @IsOptional()
  @IsString()
  @ValidateIf(o => o.startDate !== undefined)
  endDate?: string;

  // 关键词搜索
  @IsOptional()
  @IsString()
  keyword?: string;
}