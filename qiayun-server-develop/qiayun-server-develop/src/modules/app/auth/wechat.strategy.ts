import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { WechatAuthService } from './app-auth.service';

@Injectable()
export class WechatStrategy extends PassportStrategy(Strategy, 'app-wechat') {
  constructor(private authService: WechatAuthService) {
    super();
  }

  // 验证逻辑：通过微信code获取用户信息
  async validate(req) {
    const { code } = req.body;
    if (!code) {
      throw new UnauthorizedException('缺少微信code');
    }

    const wechatUser = await this.authService.loginOldUser(code);
    if (!wechatUser) {
      throw new UnauthorizedException('微信授权失败');
    }
    return wechatUser; // 验证通过后，用户信息注入到req.user
  }
}