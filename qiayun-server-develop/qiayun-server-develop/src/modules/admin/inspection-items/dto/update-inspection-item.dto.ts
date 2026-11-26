// src/modules/admin/inspection-items/dto/update-inspection-item.dto.ts
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateInspectionItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string; // 可选更新检查项名称
}