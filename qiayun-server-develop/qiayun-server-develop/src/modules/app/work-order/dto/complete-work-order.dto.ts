import { IsNumber, IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';

/**
 * 工程师完成工单提交的参数DTO
 */
export class CompleteWorkOrderDto {
  @IsNumber({}, { message: '工单ID必须是数字' })
  workOrderId: number; // 必选：工单ID

  @IsString({ message: '处理结果必须是字符串' })
  processingResult: string; // 必选：处理结果描述（如“已修复漏电问题，设备正常运行”）

  @IsOptional()
  @IsArray({ message: '处理图片必须是数组' })
  @IsString({ each: true, message: '每张图片地址必须是字符串' })
  processingImages?: string[]; // 可选：处理过程图片（URL数组）

  @IsOptional()
  @IsArray({ message: '处理视频必须是数组' })
  @IsString({ each: true, message: '每个视频地址必须是字符串' })
  processingVideos?: string[]; // 可选：处理过程视频（URL数组）

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string; // 可选：额外备注（如“建议定期维护”）

}