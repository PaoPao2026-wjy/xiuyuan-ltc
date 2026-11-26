// src/modules/mini-app/work-order/dto/work-order-list.dto.ts
import { IsEnum, IsOptional, IsInt, Min, Max} from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class WorkOrderListDto {
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

  @IsEnum(WorkOrderStatus)
  @IsOptional()
  status?: WorkOrderStatus; // 工单状态（可选筛选）
}