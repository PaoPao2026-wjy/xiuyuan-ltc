// src/modules/app/enterprise/dto/create-enterprise.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsInt, Min, IsDateString } from 'class-validator';
import { EnterpriseType, RealAuthStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateEnterpriseDto {
  /**
   * 企业名称（必填）
   * 对应模型：String @db.VarChar(255)
   */
  @IsNotEmpty({ message: '企业名称不能为空' })
  @IsString({ message: '企业名称必须是字符串' })
  enterpriseName: string;

  /**
   * 企业类型（必填，枚举）
   * 对应模型：EnterpriseType（枚举）
   * 枚举值对应：STATE_OWNED(国有企业)、PRIVATE(民营企业)、FOREIGN(外资企业)、JOINT_VENTURE(合资企业)
   */
  @IsNotEmpty({ message: '企业类型不能为空' })
  @IsEnum(EnterpriseType, { 
    message: '企业类型必须是国有企业(STATE_OWNED)、民营企业(PRIVATE)、外资企业(FOREIGN)、合资企业(JOINT_VENTURE)' 
  })
  enterpriseType: EnterpriseType;

  /**
   * 企业地址（必填）
   * 对应模型：String @db.VarChar(255)
   */
  @IsNotEmpty({ message: '企业地址不能为空' })
  @IsString({ message: '企业地址必须是字符串' })
  enterpriseAddress: string;

  /**
   * 企业联系电话（必填）
   * 对应模型：String @db.VarChar(50)
   */
  @IsNotEmpty({ message: '联系电话不能为空' })
  @IsString({ message: '联系电话必须是字符串' })
  contactPhone: string;

  /**
   * 企业邮箱（选填）
   * 对应模型：String? @db.VarChar(100)
   */
  @IsOptional()
  @IsString({ message: '企业邮箱必须是字符串' })
  enterpriseEmail?: string;

  /**
   * 第一联系人姓名（选填）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsString({ message: '联系人姓名必须是字符串' })
  contactName: string;

  /**
   * 第一联系人职务（选填）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '联系人职务必须是字符串' })
  contactPosition?: string;

  /**
   * 第一联系人手机（选填）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsString({ message: '联系人电话必须是字符串' })
  contactMobile: string;

  /**
   * 第一联系人邮箱（选填）
   * 对应模型：String? @db.VarChar(100)
   */
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
  /**
   * 户号1（选填）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '户号1必须是字符串' })
  enterpriseUserNo1?: string;

  /**
   * 户号2（选填）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '户号2必须是字符串' })
  enterpriseUserNo2?: string;

  /**
   * 表号1（选填）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '表号1必须是字符串' })
  enterpriseMeterNo1?: string;

  /**
   * 表号2（选填）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '表号2必须是字符串' })
  enterpriseMeterNo2?: string;

  /**
   * 变压器容量1（选填，单位：kVA）
   * 对应模型：Decimal? @db.Decimal(10,2)
   */
  @IsOptional()
  @IsNumber({}, { message: '变压器容量1必须是数字（支持整数/小数）' })
  @Min(0, { message: '变压器容量1不能为负数' })
  transformerCapacity1?: number;

  /**
   * 变压器容量2（选填，单位：kVA）
   * 对应模型：Decimal? @db.Decimal(10,2)
   */
  @IsOptional()
  @IsNumber({}, { message: '变压器容量2必须是数字（支持整数/小数）' })
  @Min(0, { message: '变压器容量2不能为负数' })
  transformerCapacity2?: number;

  /**
   * 使用容量1（选填，单位：kVA）
   * 对应模型：Decimal? @db.Decimal(10,2)
   */
  @IsOptional()
  @IsNumber({}, { message: '使用容量1必须是数字（支持整数/小数）' })
  @Min(0, { message: '使用容量1不能为负数' })
  usageCapacity1?: number;

  /**
   * 使用容量2（选填，单位：kVA）
   * 对应模型：Decimal? @db.Decimal(10,2)
   */
  @IsOptional()
  @IsNumber({}, { message: '使用容量2必须是数字（支持整数/小数）' })
  @Min(0, { message: '使用容量2不能为负数' })
  usageCapacity2?: number;

  // ---------------------- 电气设备与设施信息 ----------------------
  /**
   * 进线方式（选填）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '进线方式必须是字符串' })
  powerSupplyMode?: string;

  /**
   * 进线修程（选填）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '进线修程必须是字符串' })
  powerSupplyMaintenanceType?: string;

  /**
   * 高压柜数量（选填）
   * 对应模型：Int?
   */
  @IsOptional()
  @IsInt({ message: '高压柜数量必须是整数' })
  @Min(0, { message: '高压柜数量不能为负数' })
  highVoltageCabinetCount?: number;

  /**
   * 变压器数量（选填）
   * 对应模型：Int?
   */
  @IsOptional()
  @IsInt({ message: '变压器数量必须是整数' })
  @Min(0, { message: '变压器数量不能为负数' })
  transformerCount?: number;

  /**
   * 低压柜数量（选填）
   * 对应模型：Int?
   */
  @IsOptional()
  @IsInt({ message: '低压柜数量必须是整数' })
  @Min(0, { message: '低压柜数量不能为负数' })
  lowVoltageCabinetCount?: number;

  /**
   * 电容柜数量（选填）
   * 对应模型：Int?
   */
  @IsOptional()
  @IsInt({ message: '电容柜数量必须是整数' })
  @Min(0, { message: '电容柜数量不能为负数' })
  capacitorCabinetCount?: number;

  /**
   * 直流屏信息（选填）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '直流屏信息必须是字符串' })
  dcScreen?: string;

  /**
   * 运检单位（选填）
   * 对应模型：String? @db.VarChar(100)
   */
  @IsOptional()
  @IsString({ message: '运检单位必须是字符串' })
  operationMaintenanceUnit?: string;

  /**
   * 电试日期（选填）
   * 对应模型：DateTime?
   */
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsOptional()
  @IsDateString({}, { message: '电试日期格式必须是ISO日期（如2023-10-01 或 2023-10-01T00:00:00.000Z）' })
  electricalTestDate?: string;

  /**
   * 模拟屏信息（选填）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '模拟屏信息必须是字符串' })
  analogScreen?: string;

  /**
   * 安全用具信息（选填）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '安全用具信息必须是字符串' })
  safetyEquipment?: string;

  /**
   * 消防器材信息（选填）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '消防器材信息必须是字符串' })
  fireFightingEquipment?: string;

  /**
   * 排风设备信息（选填）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '排风设备信息必须是字符串' })
  ventilationEquipment?: string;

  /**
   * 空调信息（选填）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '空调信息必须是字符串' })
  airConditioner?: string;

  /**
   * 高阻屏信息（选填）
   * 对应模型：String?
   */
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
   * 企业实名认证状态（选填，默认UNAUTHORIZED）
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