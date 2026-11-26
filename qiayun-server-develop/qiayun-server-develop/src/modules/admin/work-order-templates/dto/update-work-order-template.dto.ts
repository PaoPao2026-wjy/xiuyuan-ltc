import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { TemplateStatus } from '@prisma/client';

/**
 * 更新工单模板的参数DTO
 */
export class UpdateWorkOrderTemplateDto {
  @IsString()
  @IsOptional()
  templateName?: string;

  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus;

  @IsOptional()
  templateData?: any; //仅更新时传递需要修改的组合数据
}