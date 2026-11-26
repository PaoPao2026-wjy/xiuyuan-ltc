// src/modules/app/guards/app.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * 小程序用户守卫：仅允许小程序用户（clientType=app）访问接口
 * 用于保护小程序端接口，防止非小程序用户访问
 */
@Injectable()
export class AppGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取请求对象
    const request = context.switchToHttp().getRequest();
    // 从请求头提取Token
    const token = this.extractTokenFromHeader(request);
    console.log('token', token);
    if (!token) {
      return false; // 无Token时拒绝访问
    }

    try {
      // 验证Token（使用小程序JWT密钥）
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('APP_JWT_SECRET'),
      });

      console.log('payload', payload);

      // 验证客户端类型（必须是app）
      if (payload.clientType !== 'app') {
        return false;
      }

      // 将用户信息挂载到request对象，供控制器使用
      request.user = payload;
      return true; // 验证通过，允许访问
    } catch {
      return false; // Token无效或过期时拒绝访问
    }
  }

  // 从请求头提取Bearer Token
  private extractTokenFromHeader(request: Request): string | undefined {
    // 获取 authorization 头（Node.js 中 headers 是小写键的对象）
    const authHeader = request.headers['authorization'];
    if (!authHeader) return undefined;

    // 拆分 "Bearer <token>" 格式
    const [type, token] = authHeader.split(' ');

    // 验证类型是否为 Bearer，返回 Token（或 undefined）
    return type === 'Bearer' ? token : undefined;
  }
}