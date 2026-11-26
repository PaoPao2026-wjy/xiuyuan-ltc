// src/modules/mini-app/work-order/dto/accept-work-order.dto.ts
import { IsNumber } from 'class-validator';

export class AcceptWorkOrderDto {
  @IsNumber()
  workOrderId: number; // 要接的工单ID
}