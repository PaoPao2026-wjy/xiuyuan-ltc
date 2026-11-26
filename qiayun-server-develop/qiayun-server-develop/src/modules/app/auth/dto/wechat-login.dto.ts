// src/modules/app/dto/wechat-login.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class WechatLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'code 不能为空（需通过 wx.login() 获取）' })
  code: string; // 微信小程序登录返回的code
}