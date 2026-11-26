// src/modules/mini-app/technician/dto/update-technician.dto.ts
import { 
  IsString, IsNumber, IsOptional, IsArray, IsDecimal, IsUrl, 
  IsEnum, Matches, ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
// 导入Prisma枚举（或本地定义枚举，保持与模型一致）
import { 
  TechnicianWorkStatus, 
  TechnicianStatus, 
  EmploymentStatus 
} from '@prisma/client';

/**
 * 从业资历子项DTO（workExperience数组内的对象结构）
 */
class WorkExperienceItemDto {
  @IsString()
  @IsOptional()
  companyName?: string; // 公司名称

  @IsString()
  @IsOptional()
  startTime?: string; // 入职时间（格式：YYYY-MM-DD）

  @IsString()
  @IsOptional()
  endTime?: string | null; // 离职时间（格式：YYYY-MM-DD，在职则为null）

  @IsString()
  @IsOptional()
  jobDesc?: string; // 工作描述
}

/**
 * 电工信息更新DTO（完整匹配电工表字段）
 */
export class UpdateTechnicianDto {
  // 原有字段
  @IsString()
  @IsOptional()
  realName?: string; // 姓名

  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string; // 手机号（新增格式校验）

  @IsArray()
  @IsOptional()
  skills?: string[]; // 技能标签（JSON数组）

  @IsArray()
  @IsOptional()
  certificates?: string[]; // 证书列表（JSON数组）

  @IsString()
  @IsOptional()
  jobName?: string; // 岗位名称

  @IsNumber()
  @IsOptional()
  experienceYears?: number; // 工作年限

  @IsDecimal()
  @IsOptional()
  locationLat?: string; // 纬度（字符串形式的小数）

  @IsDecimal()
  @IsOptional()
  locationLng?: string; // 经度（字符串形式的小数）

  @IsOptional()
  @IsString()
  avatarUrl?: string; // 头像URL

  // ===================== 新增字段 =====================
  @IsEnum(TechnicianWorkStatus)
  @IsOptional()
  workStatus?: TechnicianWorkStatus; // 工作状态（枚举：AVAILABLE/BUSY/OFFLINE）

  @IsEnum(TechnicianStatus)
  @IsOptional()
  status?: TechnicianStatus; // 账号状态（枚举：ACTIVE/INACTIVE）

  @IsString()
  @IsOptional()
  idCardNo?: string; // 身份证号（18位，格式校验）

   @IsString()
  @IsOptional()
  idCardFrontPhoto?: string; // 身份证正面照片URL

  @IsString()
  @IsOptional()
  idCardBackPhoto?: string; // 身份证背面照片URL

  @IsEnum(EmploymentStatus)
  @IsOptional()
  employmentStatus?: EmploymentStatus; // 从业状态（枚举：ON_THE_JOB/UNEMPLOYED）

  @IsArray()
  @IsOptional()
  @Type(() => WorkExperienceItemDto) // 转换子项类型
  workExperience?: WorkExperienceItemDto[]; // 从业资历（JSON数组）
}