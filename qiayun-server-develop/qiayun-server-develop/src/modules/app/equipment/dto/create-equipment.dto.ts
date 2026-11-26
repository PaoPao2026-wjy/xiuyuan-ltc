// src/modules/app/equipment/dto/create-equipment.dto.ts
import { IsString, IsEnum, IsInt, IsDateString, MaxLength, IsUrl, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { EquipmentType } from '@prisma/client';

export class CreateEquipmentDto {
  @IsString()
  @MaxLength(50)
  equipmentNo: string; // 设备编号（唯一）

  @IsString()
  @MaxLength(100)
  name: string; // 设备名称

  @IsEnum(EquipmentType)
  type: EquipmentType; // 设备类型

  // @IsInt()
  // enterpriseId: number; // 所属企业ID

  @IsDateString()
  manufactureDate: string; // 出厂日期

  // @IsUrl()
  // @MaxLength(200)
  // nameplatePhoto: string; // 铭牌照片URL

  @IsOptional()
  @IsArray() // 验证是否为数组
  devicePhotos?: string[]; // 设备照片URL数组（可选）

   @IsNotEmpty({ message: '模板组合数据不能为空' })
  customInfo: any; // 基于模板的参数（JSON）

  @IsString()
  @MaxLength(500)
  remarks?: string; // 备注
}