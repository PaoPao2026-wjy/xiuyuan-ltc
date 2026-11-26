// src/modules/mini-app/auth/wechat-auth.controller.ts
import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { WechatAuthService } from './app-auth.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { WechatRegisterLoginDto } from './dto/wechat-register-login.dto';
import { AppGuard } from './app.guard';
import { GetByOpenidDto } from './dto/get-by-openid.dto';
import { LoginResponse } from './app-auth.service'; // 导入类型


@Controller('app/auth')
export class WechatAuthController {
  constructor(private readonly wechatAuthService: WechatAuthService) {}

  /**
   * 老用户登录接口
   * @param dto 包含 wx.login() 获取的 code
   * @returns Token + 用户基本信息
   */
  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async loginOldUser(@Body() dto: WechatLoginDto) {
    const data = await this.wechatAuthService.loginOldUser(dto);
    return {
      code: 200,
      message: '登录成功',
      data,
    };
  }

  /**
   * 新用户注册+登录接口
   * @param dto 包含 code + 手机号 encryptedData + iv
   * @returns Token + 新用户信息（含手机号）
   */
  @Post('register-login')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async registerAndLoginNewUser(@Body() dto: WechatRegisterLoginDto): Promise<{
    code: number;
    message: string;
    data: LoginResponse;
  }> {
    const data = await this.wechatAuthService.registerAndLoginNewUser(dto);
    return {
      code: 200,
      message: '注册并登录成功',
      data,
    };
}

  // 根据 openid 查询用户信息（包含电工信息）
  @Post('login-by-openid')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getUserByOpenid(@Body() dto: GetByOpenidDto) {
    const data = await this.wechatAuthService.getUserByOpenid(dto.openid);
    return {
      code: 200,
      message: '获取成功',
      data,
    };
  }

}