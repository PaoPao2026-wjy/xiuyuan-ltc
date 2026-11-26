// src/modules/admin/maintenance-templates/dto/create-maintenance-template.dto.ts
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateMaintenanceTemplateDto {
  @IsString()
  @MaxLength(100) // 匹配模型中 name 的 VarChar(100)
  name: string; // 模板名称（必填）

  @IsOptional()
  @IsString()
  description?: string; // 模板描述（可选）
}