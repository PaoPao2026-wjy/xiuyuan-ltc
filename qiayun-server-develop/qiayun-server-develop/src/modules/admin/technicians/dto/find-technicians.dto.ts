// src/modules/admin/technicians/dto/find-technicians.dto.ts
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentStatus, RealAuthStatus, TechnicianStatus, TechnicianWorkStatus } from '@prisma/client';

export class FindTechniciansDto {
  // 分页参数（默认第1页，每页10条）
  @IsOptional()
   @IsInt()
   @Min(1) // 页码最小为1
   @Type(() => Number) // 自动将查询参数转为数字（避免字符串类型）
   page = 1; // 默认值：第1页
 
   @IsOptional()
   @IsInt()
   @Min(1) // 每页最小1条
   @Max(100) // 限制最大100条，避免全量查询性能问题
   @Type(() => Number)
   pageSize = 10; // 默认值：每页10条

  /**
   * 工作状态（选填，枚举：AVAILABLE/BUSY/REST）
   */
  @IsOptional()
  @IsEnum(TechnicianWorkStatus, { message: '工作状态枚举值不合法' })
  workStatus?: TechnicianWorkStatus;

  /**
   * 账号状态（选填，枚举：ACTIVE/DISABLED/LOCKED）
   */
  @IsOptional()
  @IsEnum(TechnicianStatus, { message: '账号状态枚举值不合法' })
  status?: TechnicianStatus;

  /**
   * 实名认证状态（选填，枚举：UNAUTHORIZED/AUDITING/AUTHORIZED/REJECTED）
   */
  @IsOptional()
  @IsEnum(RealAuthStatus, { message: '实名认证状态枚举值不合法' })
  realAuthStatus?: RealAuthStatus;

  /**
   * 从业状态（选填，枚举：ON_THE_JOB/UNEMPLOYED）
   */
  @IsOptional()
  @IsEnum(EmploymentStatus, { message: '从业状态枚举值不合法' })
  employmentStatus?: EmploymentStatus;

  /**
   * 身份证号（选填，精确匹配）
   */
  @IsOptional()
  @IsString({ message: '身份证号必须是字符串' })
  idCardNo?: string;

  /**
   * 关键词（选填，模糊匹配姓名/手机号）
   */
  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;
}