// src/modules/admin/enterprises/dto/update-enterprise.dto.ts
import { IsEnum, IsOptional, IsString, IsInt, Min, IsNumber, IsDateString } from 'class-validator';
import { EnterpriseType, RealAuthStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

export class UpdateEnterpriseDto {
  @IsOptional()
  @IsString({ message: '企业名称必须是字符串' })
  enterpriseName?: string;

  @IsOptional()
  @IsEnum(EnterpriseType, { message: '企业类型必须是国有企业/民营企业/外资企业/合资企业' })
  enterpriseType?: EnterpriseType;

  @IsOptional()
  @IsString({ message: '企业地址必须是字符串' })
  enterpriseAddress?: string;

  @IsOptional()
  @IsString({ message: '联系电话必须是字符串' })
  contactPhone?: string;

  @IsOptional()
  @IsString({ message: '企业邮箱必须是字符串' })
  enterpriseEmail?: string;

  @IsOptional()
  @IsString({ message: '联系人姓名必须是字符串' })
  contactName?: string;

  @IsOptional()
  @IsString({ message: '联系人职务必须是字符串' })
  contactPosition?: string;

  @IsOptional()
  @IsString({ message: '联系人电话必须是字符串' })
  contactMobile?: string;

  @IsOptional()
  @IsString({ message: '联系人邮箱必须是字符串' })
  contactEmail?: string;

  // ---------------------- 新增：第二/第三联系人 ----------------------
  /**
   * 第二联系人姓名（选填）
   * 对应模型：String? @db.VarChar(50) @map("contact_name2")
   */
  @IsOptional()
  @IsString({ message: '第二联系人姓名必须是字符串' })
  contactName2?: string;

  /**
   * 第二联系人电话（选填）
   * 对应模型：String? @db.VarChar(50) @map("contact_mobile2")
   */
  @IsOptional()
  @IsString({ message: '第二联系人电话必须是字符串' })
  contactMobile2?: string;

  /**
   * 第三联系人姓名（选填）
   * 对应模型：String? @db.VarChar(50) @map("contact_name3")
   */
  @IsOptional()
  @IsString({ message: '第三联系人姓名必须是字符串' })
  contactName3?: string;

  /**
   * 第三联系人电话（选填）
   * 对应模型：String? @db.VarChar(50) @map("contact_mobile3")
   */
  @IsOptional()
  @IsString({ message: '第三联系人电话必须是字符串' })
  contactMobile3?: string;

  // ---------------------- 用户基础信息（户号/表号/容量）----------------------
  @IsOptional()
  @IsString({ message: '户号1必须是字符串' })
  enterpriseUserNo1?: string;

  @IsOptional()
  @IsString({ message: '户号2必须是字符串' })
  enterpriseUserNo2?: string;

  @IsOptional()
  @IsString({ message: '表号1必须是字符串' })
  enterpriseMeterNo1?: string;

  @IsOptional()
  @IsString({ message: '表号2必须是字符串' })
  enterpriseMeterNo2?: string;

  @IsOptional()
  @IsNumber({}, { message: '变压器容量1必须是数字' })
  @Min(0, { message: '变压器容量1不能为负数' })
  transformerCapacity1?: number;

  @IsOptional()
  @IsNumber({}, { message: '变压器容量2必须是数字' })
  @Min(0, { message: '变压器容量2不能为负数' })
  transformerCapacity2?: number;

  @IsOptional()
  @IsNumber({}, { message: '使用容量1必须是数字' })
  @Min(0, { message: '使用容量1不能为负数' })
  usageCapacity1?: number;

  @IsOptional()
  @IsNumber({}, { message: '使用容量2必须是数字' })
  @Min(0, { message: '使用容量2不能为负数' })
  usageCapacity2?: number;

  // ---------------------- 电气设备与设施信息（全可选）----------------------
  @IsOptional()
  @IsString({ message: '进线方式必须是字符串' })
  powerSupplyMode?: string;

  @IsOptional()
  @IsString({ message: '进线修程必须是字符串' })
  powerSupplyMaintenanceType?: string;

  @IsOptional()
  @IsInt({ message: '高压柜数量必须是整数' })
  @Min(0, { message: '高压柜数量不能为负数' })
  highVoltageCabinetCount?: number;

  @IsOptional()
  @IsInt({ message: '变压器数量必须是整数' })
  @Min(0, { message: '变压器数量不能为负数' })
  transformerCount?: number;

  @IsOptional()
  @IsInt({ message: '低压柜数量必须是整数' })
  @Min(0, { message: '低压柜数量不能为负数' })
  lowVoltageCabinetCount?: number;

  @IsOptional()
  @IsInt({ message: '电容柜数量必须是整数' })
  @Min(0, { message: '电容柜数量不能为负数' })
  capacitorCabinetCount?: number;

  @IsOptional()
  @IsString({ message: '直流屏信息必须是字符串' })
  dcScreen?: string;

  @IsOptional()
  @IsString({ message: '运检单位必须是字符串' })
  operationMaintenanceUnit?: string;

  /**
   * 电试日期（选填）
   * 对应模型：DateTime?
   */
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsOptional()
  @IsDateString({}, { message: '电试日期格式必须是ISO日期（如2023-10-01）' })
  electricalTestDate?: string;

  @IsOptional()
  @IsString({ message: '模拟屏信息必须是字符串' })
  analogScreen?: string;

  @IsOptional()
  @IsString({ message: '安全用具信息必须是字符串' })
  safetyEquipment?: string;

  @IsOptional()
  @IsString({ message: '消防器材信息必须是字符串' })
  fireFightingEquipment?: string;

  @IsOptional()
  @IsString({ message: '排风设备信息必须是字符串' })
  ventilationEquipment?: string;

  @IsOptional()
  @IsString({ message: '空调信息必须是字符串' })
  airConditioner?: string;

  @IsOptional()
  @IsString({ message: '高阻屏信息必须是字符串' })
  highResistanceScreen?: string;

  // ---------------------- 新增：企业认证信息 ----------------------
  /**
   * 统一社会信用代码（选填，唯一）
   * 对应模型：String? @unique @map("social_credit_code") @db.VarChar(18)
   */
  @IsOptional()
  @IsString({ message: '统一社会信用代码必须是字符串' })
  socialCreditCode?: string;

  /**
   * 营业执照照片URL（选填）
   * 对应模型：String? @map("business_license_photo") @db.VarChar(500)
   */
  @IsOptional()
  @IsString({ message: '营业执照照片URL必须是字符串' })
  businessLicensePhoto?: string;

  /**
   * 企业实名认证状态（选填）
   * 对应模型：RealAuthStatus @default(UNAUTHORIZED) @map("enterprise_real_auth_status")
   */
  @IsOptional()
  @IsEnum(RealAuthStatus, { 
    message: '实名认证状态必须是未认证(UNAUTHORIZED)、审核中(AUDITING)、已认证(AUTHORIZED)、已驳回(REJECTED)' 
  })
  enterpriseRealAuthStatus?: RealAuthStatus;

  /**
   * 企业认证驳回原因（选填）
   * 对应模型：String? @map("enterprise_real_auth_reject_reason") @db.Text
   */
  @IsOptional()
  @IsString({ message: '认证驳回原因必须是字符串' })
  enterpriseRealAuthRejectReason?: string;
}