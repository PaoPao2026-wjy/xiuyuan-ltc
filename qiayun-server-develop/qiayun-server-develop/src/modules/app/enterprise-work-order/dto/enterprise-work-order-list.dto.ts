import { IsInt, IsOptional, IsString, Min, IsEnum, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkOrderStatus } from '@prisma/client';

export class EnterpriseWorkOrderListDto {
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

  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus; // 工单状态筛选

  @IsOptional()
  @IsString()
  keyword?: string; // 关键词（工单标题/编号）
}