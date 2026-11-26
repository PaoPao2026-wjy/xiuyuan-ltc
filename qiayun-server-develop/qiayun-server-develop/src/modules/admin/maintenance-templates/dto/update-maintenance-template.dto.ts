// src/modules/admin/maintenance-templates/dto/update-maintenance-template.dto.ts
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateMaintenanceTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string; // 可选更新名称

  @IsOptional()
  @IsString()
  description?: string; // 可选更新描述
}