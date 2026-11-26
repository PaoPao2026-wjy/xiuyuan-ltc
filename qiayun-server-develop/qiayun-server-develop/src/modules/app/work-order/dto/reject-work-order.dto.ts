// src/modules/app/work-order/dto/reject-work-order.dto.ts
import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class RejectWorkOrderDto {
  @IsNumber()
  workOrderId: number; /// 工单ID（必填）

  @IsString()
  rejectReason: string; /// 拒绝原因（必填，文本）

  @IsDateString()
  @IsOptional()
  rejectTime?: string; /// 拒绝时间（可选，默认当前时间）

  @IsString()
  @IsOptional()
  remark?: string; /// 拒绝备注（可选）
}