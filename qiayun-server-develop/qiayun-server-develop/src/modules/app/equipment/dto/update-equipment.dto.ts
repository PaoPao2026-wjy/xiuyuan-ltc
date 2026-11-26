// src/modules/admin/equipment/dto/update-equipment.dto.ts
import { IsString, IsEnum, IsInt, IsDateString, MaxLength, IsUrl, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { EquipmentType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class UpdateEquipmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  equipmentNo?: string; // 设备编号（唯一，可选更新）

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string; // 设备名称（可选更新）

  @IsOptional()
  @IsEnum(EquipmentType)
  type?: EquipmentType; // 设备类型（可选更新）

  // @IsOptional()
  // @IsInt()
  // enterpriseId?: number; // 所属企业ID（可选更新）

  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsOptional()
  @IsDateString()
  manufactureDate?: string; // 出厂日期（可选更新）

  // @IsOptional()
  // @IsUrl()
  // @MaxLength(200)
  // nameplatePhoto?: string; // 铭牌照片URL（可选更新）

  @IsOptional()
  @IsArray()
  devicePhotos?: string[]; // 设备照片URL数组（可选更新）

  @IsOptional()
  customInfo?: any; // 基于模板的参数（JSON，可选更新）

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string; // 备注（可选更新）
}