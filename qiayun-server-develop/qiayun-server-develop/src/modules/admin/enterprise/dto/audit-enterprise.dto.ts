// src/modules/admin/enterprises/dto/audit-enterprise.dto.ts
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { RealAuthStatus } from '@prisma/client';

export class AuditEnterpriseDto {
  /**
   * 审核状态（必填）
   * 仅允许：审核中(AUDITING)、已认证(AUTHORIZED)、已驳回(REJECTED)
   */
  @IsEnum(RealAuthStatus, {
    message: '审核状态仅支持：审核中(AUDITING)、已认证(AUTHORIZED)、已驳回(REJECTED)',
  })
  enterpriseRealAuthStatus: RealAuthStatus;

  /**
   * 审核驳回原因（仅审核失败时必填）
   */
  @ValidateIf((o) => o.enterpriseRealAuthStatus === RealAuthStatus.REJECTED)
  @IsString({ message: '驳回原因必须是字符串' })
  @IsOptional() // 非REJECTED状态时可选
  enterpriseRealAuthRejectReason?: string;
}