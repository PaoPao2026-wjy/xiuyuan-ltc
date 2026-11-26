// src/modules/app/work-order/dto/update-work-order-processing-result.dto.ts
import { IsNumber, IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class UpdateWorkOrderProcessingResultDto {
  @IsNumber()
  workOrderId: number; /// 工单ID（必填）

  @IsObject()
  @IsOptional()
  processingResult?: Record<string, any>; /// 处理结果（JSON对象，可选）

  @IsArray()
  @IsOptional()
  processingImages?: string[]; /// 处理图片URL数组（可选）

  @IsArray()
  @IsOptional()
  processingVideos?: string[]; /// 处理视频URL数组（可选）

  @IsString()
  @IsOptional()
  remark?: string; /// 备注（可选）
}