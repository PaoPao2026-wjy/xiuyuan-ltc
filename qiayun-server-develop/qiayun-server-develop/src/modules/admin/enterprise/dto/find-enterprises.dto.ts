// src/modules/admin/enterprises/dto/find-enterprises.dto.ts
import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EnterpriseType } from '@prisma/client'; // 导入企业类型枚举

/**
 * 企业分页查询 DTO
 * - page: 当前页码（默认1，最小1）
 * - pageSize: 每页条数（默认10，最小1，最大100，防止性能问题）
 * - enterpriseType: 按企业类型筛选（可选，枚举值）
 * - keyword: 关键词搜索（可选，模糊匹配企业名称）
 */
export class FindEnterprisesDto {
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

  @IsOptional()
  @IsEnum(EnterpriseType) // 仅允许枚举中的有效值（STATE_OWNED/PRIVATE等）
  enterpriseType?: EnterpriseType;

  @IsOptional()
  @IsString()
  keyword?: string; // 模糊搜索：企业名称包含该关键词（忽略大小写）
}