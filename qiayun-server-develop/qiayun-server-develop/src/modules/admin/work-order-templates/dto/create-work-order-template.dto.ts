import { IsString, IsNotEmpty, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { TemplateStatus } from '@prisma/client';

/**
 * 创建工单模板的参数DTO
 */
export class CreateWorkOrderTemplateDto {
  @IsString()
  @IsNotEmpty({ message: '模板名称不能为空' })
  templateName: string;

  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus = TemplateStatus.ENABLED; // 默认启用

  @IsNotEmpty({ message: '模板组合数据不能为空' })
  templateData: any; // 前端传入的完整组合数据（JSON结构）
}