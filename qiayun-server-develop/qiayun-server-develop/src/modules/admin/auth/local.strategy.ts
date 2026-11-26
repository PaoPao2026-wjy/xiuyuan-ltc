// src/modules/admin/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminAuthService } from '../../admin/auth/auth.service';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(Strategy, 'admin-local') {
  constructor(private authService: AdminAuthService) {
    super({ usernameField: 'username' }); // 用username作为登录字段
  }

  async validate(username: string, password: string) {
    const admin = await this.authService.validateAdmin(username, password);
    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return admin;
  }
}