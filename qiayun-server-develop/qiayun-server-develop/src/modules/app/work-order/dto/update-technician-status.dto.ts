import { IsNumber, IsString, IsOptional, IsArray, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { TechnicianWorkOrderStatus } from '@prisma/client';

export class UpdateTechnicianStatusDto {
  @IsNumber()
  workOrderId: number; // 工单ID（必填）

  @IsEnum(TechnicianWorkOrderStatus)
  processingStatus: TechnicianWorkOrderStatus; // 执行状态（必填）

  // 细分状态字段（按processingStatus按需传参）
  @IsDateString()
  @IsOptional()
  estimatedArrivalTime?: string; // 预计到达时间（ARRIVAL_NOTIFIED时填）

  @IsDateString()
  @IsOptional()
  departureTime?: string; // 出发时间（DEPARTED时填）

  @IsDateString()
  @IsOptional()
  arrivalTime?: string; // 到达时间（ARRIVED时填）

  @IsBoolean()
  @IsOptional()
  selfInspectionCompleted?: boolean; // 自检是否完成（SELF_INSPECTED时填）

  @IsArray()
  @IsOptional()
  selfInspectionPhotos?: string[]; // 自检照片（SELF_INSPECTED时填）

  @IsDateString()
  @IsOptional()
  selfInspectionTime?: string; // 自检完成时间（SELF_INSPECTED时填）

  @IsDateString()
  @IsOptional()
  executionStartTime?: string; // 执行开始时间（EXECUTING时填）

  @IsString()
  @IsOptional()
  rejectReason?: string; // 拒绝原因（REJECTED时必填）

  @IsDateString()
  @IsOptional()
  rejectTime?: string; // 拒绝时间（REJECTED时填，默认当前时间）

  @IsString()
  @IsOptional()
  notStartedRemark?: string; // 未开始节点备注

  @IsString()
  @IsOptional()
  arrivalNotifiedRemark?: string; // 已通知预计到达时间备注

  @IsString()
  @IsOptional()
  departedRemark?: string; // 已出发节点备注

  @IsString()
  @IsOptional()
  arrivedRemark?: string; // 已到达节点备注

  @IsString()
  @IsOptional()
  selfInspectedRemark?: string; // 已完成自检节点备注

  @IsString()
  @IsOptional()
  executingRemark?: string; // 执行巡检任务节点备注

  @IsString()
  @IsOptional()
  completedRemark?: string; // 流程完成节点备注


  @IsString()
  @IsOptional()
  remark?: string; // 状态备注（可选）

  @IsBoolean()
  @IsOptional()
  isReassigned?: boolean; // 是否为重新分配记录（可选，默认false）
}