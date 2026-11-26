import { IsEnum, IsInt, IsOptional, IsString, Min, Max, ValidateIf} from 'class-validator';
import { CreatedSource, Priority, WorkOrderDispatchStatus, WorkOrderStatus, WorkOrderType } from '@prisma/client';
import { Type } from 'class-transformer';

export class FindWorkOrdersDto {
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

  // 工单状态（可选）
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  // 工单类型（可选）
  @IsOptional()
  @IsEnum(WorkOrderType)
  type?: WorkOrderType;

  // 优先级（可选）
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  // 企业ID（可选）
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  enterpriseId?: number;

  // 工单号搜索（可选）
  @IsOptional()
  @IsString()
  orderNo?: string;

  // 日期范围-开始时间（可选，需与结束时间同时存在）
  @IsOptional()
  @IsString()
  @ValidateIf(o => o.endDate !== undefined) // 有结束时间时才验证开始时间
  startDate?: string;

  // 日期范围-结束时间（可选，需与开始时间同时存在）
  @IsOptional()
  @IsString()
  @ValidateIf(o => o.startDate !== undefined) // 有开始时间时才验证结束时间
  endDate?: string;

  // 关键词搜索（标题/企业名）
  @IsOptional()
  @IsString()
  keyword?: string;

   // 派单状态（可选）
  @IsOptional()
  @IsEnum(WorkOrderDispatchStatus)
  dispatchStatus?: WorkOrderDispatchStatus;

  // 创建来源（可选）
  @IsOptional()
  @IsEnum(CreatedSource)
  createdSource?: CreatedSource;
}