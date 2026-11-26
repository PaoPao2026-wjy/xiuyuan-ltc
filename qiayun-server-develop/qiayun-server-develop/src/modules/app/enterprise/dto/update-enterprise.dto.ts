// src/modules/app/enterprise/dto/update-enterprise.dto.ts
import { IsEnum, IsOptional, IsString, IsNumber, IsInt, Min, IsDateString } from 'class-validator';
import { EnterpriseType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class UpdateEnterpriseDto {
  /**
   * 企业名称（可选更新）
   * 对应模型：String @db.VarChar(255)
   */
  @IsOptional()
  @IsString({ message: '企业名称必须是字符串' })
  enterpriseName?: string;

  /**
   * 企业类型（可选更新）
   * 对应模型：EnterpriseType（枚举）
   */
  @IsOptional()
  @IsEnum(EnterpriseType, { message: '企业类型必须是国有企业/民营企业/外资企业/合资企业' })
  enterpriseType?: EnterpriseType;

  /**
   * 企业地址（可选更新）
   * 对应模型：String @db.VarChar(255)
   */
  @IsOptional()
  @IsString({ message: '企业地址必须是字符串' })
  enterpriseAddress?: string;

  /**
   * 企业联系电话（可选更新）
   * 对应模型：String @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '联系电话必须是字符串' })
  contactPhone?: string;

  /**
   * 企业邮箱（可选更新）
   * 对应模型：String? @db.VarChar(100)
   */
  @IsOptional()
  @IsString({ message: '企业邮箱必须是字符串' })
  enterpriseEmail?: string;

  /**
   * 第一联系人姓名（可选更新）
   * 对应模型：String @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '第一联系人姓名必须是字符串' })
  contactName?: string;

  /**
   * 第一联系人职务（可选更新）
   * 对应模型：String @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '第一联系人职务必须是字符串' })
  contactPosition?: string;

  /**
   * 第一联系人手机（可选更新）
   * 对应模型：String @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '第一联系人手机必须是字符串' })
  contactMobile?: string;

  /**
   * 第一联系人邮箱（可选更新）
   * 对应模型：String? @db.VarChar(100)
   */
  @IsOptional()
  @IsString({ message: '第一联系人邮箱必须是字符串' })
  contactEmail?: string;

  /**
   * 第二联系人姓名（可选更新）
   * 对应模型：String? @db.VarChar(50) @map("contact_name2")
   */
  @IsOptional()
  @IsString({ message: '第二联系人姓名必须是字符串' })
  contactName2?: string;

  /**
   * 第二联系人手机（可选更新）
   * 对应模型：String? @db.VarChar(50) @map("contact_mobile2")
   */
  @IsOptional()
  @IsString({ message: '第二联系人手机必须是字符串' })
  contactMobile2?: string;

  /**
   * 第三联系人姓名（可选更新）
   * 对应模型：String? @db.VarChar(50) @map("contact_name3")
   */
  @IsOptional()
  @IsString({ message: '第三联系人姓名必须是字符串' })
  contactName3?: string;

  /**
   * 第三联系人手机（可选更新）
   * 对应模型：String? @db.VarChar(50) @map("contact_mobile3")
   */
  @IsOptional()
  @IsString({ message: '第三联系人手机必须是字符串' })
  contactMobile3?: string;

  // ---------------------- 用户基础信息（户号/表号/容量）----------------------
  /**
   * 户号1（可选更新）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '户号1必须是字符串' })
  enterpriseUserNo1?: string;

  /**
   * 户号2（可选更新）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '户号2必须是字符串' })
  enterpriseUserNo2?: string;

  /**
   * 表号1（可选更新）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '表号1必须是字符串' })
  enterpriseMeterNo1?: string;

  /**
   * 表号2（可选更新）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '表号2必须是字符串' })
  enterpriseMeterNo2?: string;

  /**
   * 变压器容量1（可选更新，单位：kVA）
   * 对应模型：Decimal? @db.Decimal(10,2)
   */
  @IsOptional()
  @IsNumber({}, { message: '变压器容量1必须是数字' })
  @Min(0, { message: '变压器容量1不能为负数' })
  transformerCapacity1?: number;

  /**
   * 变压器容量2（可选更新，单位：kVA）
   * 对应模型：Decimal? @db.Decimal(10,2)
   */
  @IsOptional()
  @IsNumber({}, { message: '变压器容量2必须是数字' })
  @Min(0, { message: '变压器容量2不能为负数' })
  transformerCapacity2?: number;

  /**
   * 使用容量1（可选更新，单位：kVA）
   * 对应模型：Decimal? @db.Decimal(10,2)
   */
  @IsOptional()
  @IsNumber({}, { message: '使用容量1必须是数字' })
  @Min(0, { message: '使用容量1不能为负数' })
  usageCapacity1?: number;

  /**
   * 使用容量2（可选更新，单位：kVA）
   * 对应模型：Decimal? @db.Decimal(10,2)
   */
  @IsOptional()
  @IsNumber({}, { message: '使用容量2必须是数字' })
  @Min(0, { message: '使用容量2不能为负数' })
  usageCapacity2?: number;

  // ---------------------- 电气设备与设施信息 ----------------------
  /**
   * 进线方式（可选更新）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '进线方式必须是字符串' })
  powerSupplyMode?: string;

  /**
   * 进线修程（可选更新）
   * 对应模型：String? @db.VarChar(50)
   */
  @IsOptional()
  @IsString({ message: '进线修程必须是字符串' })
  powerSupplyMaintenanceType?: string;

  /**
   * 高压柜数量（可选更新）
   * 对应模型：Int?
   */
  @IsOptional()
  @IsInt({ message: '高压柜数量必须是整数' })
  @Min(0, { message: '高压柜数量不能为负数' })
  highVoltageCabinetCount?: number;

  /**
   * 变压器数量（可选更新）
   * 对应模型：Int?
   */
  @IsOptional()
  @IsInt({ message: '变压器数量必须是整数' })
  @Min(0, { message: '变压器数量不能为负数' })
  transformerCount?: number;

  /**
   * 低压柜数量（可选更新）
   * 对应模型：Int?
   */
  @IsOptional()
  @IsInt({ message: '低压柜数量必须是整数' })
  @Min(0, { message: '低压柜数量不能为负数' })
  lowVoltageCabinetCount?: number;

  /**
   * 电容柜数量（可选更新）
   * 对应模型：Int?
   */
  @IsOptional()
  @IsInt({ message: '电容柜数量必须是整数' })
  @Min(0, { message: '电容柜数量不能为负数' })
  capacitorCabinetCount?: number;

  /**
   * 直流屏信息（可选更新）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '直流屏信息必须是字符串' })
  dcScreen?: string;

  /**
   * 运检单位（可选更新）
   * 对应模型：String? @db.VarChar(100)
   */
  @IsOptional()
  @IsString({ message: '运检单位必须是字符串' })
  operationMaintenanceUnit?: string;

  /**
   * 电试日期（可选更新）
   * 对应模型：DateTime?
   */
  @Transform(({ value }) => (value === null || value === '' ? undefined : value))
  @IsOptional()
  @IsDateString({}, { message: '电试日期格式必须是ISO日期（如2023-10-01）' })
  electricalTestDate?: string;

  /**
   * 模拟屏信息（可选更新）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '模拟屏信息必须是字符串' })
  analogScreen?: string;

  /**
   * 安全用具信息（可选更新）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '安全用具信息必须是字符串' })
  safetyEquipment?: string;

  /**
   * 消防器材信息（可选更新）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '消防器材信息必须是字符串' })
  fireFightingEquipment?: string;

  /**
   * 排风设备信息（可选更新）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '排风设备信息必须是字符串' })
  ventilationEquipment?: string;

  /**
   * 空调信息（可选更新）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '空调信息必须是字符串' })
  airConditioner?: string;

  /**
   * 高阻屏信息（可选更新）
   * 对应模型：String?
   */
  @IsOptional()
  @IsString({ message: '高阻屏信息必须是字符串' })
  highResistanceScreen?: string;

  /**
   * 统一社会信用代码（可选更新，唯一）
   * 对应模型：String? @unique @map("social_credit_code") @db.VarChar(18)
   */
  @IsOptional()
  @IsString({ message: '统一社会信用代码必须是字符串' })
  socialCreditCode?: string;

  /**
   * 营业执照照片URL（可选更新）
   * 对应模型：String? @map("business_license_photo") @db.VarChar(500)
   */
  @IsOptional()
  @IsString({ message: '营业执照照片URL必须是字符串' })
  businessLicensePhoto?: string;
}