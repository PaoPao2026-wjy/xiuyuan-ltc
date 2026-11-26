// src/modules/app/work-order/dto/query-tech-work-order-detail.dto.ts
import { IsNumber } from 'class-validator';

export class QueryTechWorkOrderDetailDto {
  @IsNumber()
  workOrderId: number; /// 工单ID（必填）
}