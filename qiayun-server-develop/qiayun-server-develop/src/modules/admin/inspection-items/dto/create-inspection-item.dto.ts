// src/modules/admin/inspection-items/dto/create-inspection-item.dto.ts
import { IsString, MaxLength } from 'class-validator';

export class CreateInspectionItemDto {
  @IsString()
  @MaxLength(100) // 匹配模型中 name 的 VarChar(100)
  name: string; // 检查项名称（必填）
}