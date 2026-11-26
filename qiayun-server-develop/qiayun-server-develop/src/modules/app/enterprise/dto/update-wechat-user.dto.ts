// src/modules/app/enterprise/dto/update-wechat-user.dto.ts
import { IsOptional, IsString, IsPhoneNumber, IsUrl } from 'class-validator';

/**
 * 企业端用户更新微信信息的DTO
 * 所有字段均为可选（按需更新）
 */
export class UpdateWechatUserDto {
  /**
   * 微信昵称（可选）
   */
  @IsOptional()
  @IsString({ message: '微信昵称必须是字符串' })
  nickname?: string;

  /**
   * 微信头像URL（可选）
   */
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatarUrl?: string;


  /**
   * 性别（可选）
   */
  @IsOptional()
  @IsString({ message: '性别必须是字符串' })
  gender?: string;

  /**
   * 国家（可选）
   */
  @IsOptional()
  @IsString({ message: '国家必须是字符串' })
  country?: string;

  /**
   * 省份（可选）
   */
  @IsOptional()
  @IsString({ message: '省份必须是字符串' })
  province?: string;

  /**
   * 城市（可选）
   */
  @IsOptional()
  @IsString({ message: '城市必须是字符串' })
  city?: string;

  /**
   * 语言（可选）
   */
  @IsOptional()
  @IsString({ message: '语言必须是字符串' })
  language?: string;

  /**
   * 联系人姓名（可选）
   */
  @IsOptional()
  @IsString({ message: '联系人姓名必须是字符串' })
  contactName?: string;

  /**
   * 联系人职务（可选）
   */
  @IsOptional()
  @IsString({ message: '联系人职务必须是字符串' })
  contactPosition?: string;
}