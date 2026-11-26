// src/modules/admin/technicians/dto/find-technician-points-logs.dto.ts
import { IsEnum, IsInt, IsOptional, IsString, Min, IsDateString, Max } from 'class-validator';
import { PointsChangeType } from '@prisma/client';
import { Type } from 'class-transformer';

export class FindTechnicianPointsLogsDto {
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

  /**
   * 积分变动类型（选填，枚举）
   */
  @IsOptional()
  @IsEnum(PointsChangeType, { message: '积分变动类型枚举值不合法' })
  type?: PointsChangeType;

  /**
   * 关联工单ID（选填）
   */
  @IsOptional()
  @IsInt({ message: '关联工单ID必须是整数' })
  relatedOrderId?: number;

  /**
   * 变动原因关键词（选填，模糊匹配）
   */
  @IsOptional()
  @IsString({ message: '变动原因关键词必须是字符串' })
  reasonKeyword?: string;

  /**
   * 开始时间（选填，ISO格式，筛选创建时间≥该值）
   */
  @IsOptional()
  @IsDateString({}, { message: '开始时间格式必须是ISO日期（如2024-01-01T00:00:00Z）' })
  startTime?: string;

  /**
   * 结束时间（选填，ISO格式，筛选创建时间≤该值）
   */
  @IsOptional()
  @IsDateString({}, { message: '结束时间格式必须是ISO日期（如2024-12-31T23:59:59Z）' })
  endTime?: string;
}