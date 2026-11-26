// src/modules/admin/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service'; // 引入PrismaService
import { AdminStatus } from '@prisma/client'; // 引入用户状态枚举

/**
 * 后台用户守卫：仅允许后台用户（clientType=admin）访问接口
 * 用于保护后台管理接口，防止非后台用户访问
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> { 
    //  获取请求对象
    const request = context.switchToHttp().getRequest();
    //从请求头中提取Token
    const token = this.extractTokenFromHeader(request);
  //  console.log('token', token);
    if (!token) {
      return false; // 无Token时拒绝访问
    }

    try {
      //  验证Token（使用后台JWT密钥）
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('ADMIN_JWT_SECRET'),
      });

      // 验证客户端类型（必须是admin）
      if (payload.clientType !== 'admin') {
        return false;
      }
     // console.log('payload', payload);
     const adminUser = await this.prisma.adminUser.findUnique({
        where: {
          adminId: payload.adminId, // 从JWT payload中获取用户ID
          isDeleted: false, // 过滤已逻辑删除的用户
          status: AdminStatus.ACTIVE, // 仅允许「活跃」状态的用户（拒绝锁定/不活跃用户）
        },
        select: { adminId: true }, // 仅查必要字段，减少性能消耗
      });

      //无用户 → 拒绝访问（用户已删除/禁用）
      if (!adminUser) {
        return false;
      } 
      //  将用户信息挂载到request对象，供控制器使用
      request.user = {
        ...payload,
        adminId: adminUser.adminId, // 确保用户ID是数据库中存在的有效ID
      };
     // console.log('request.user', request.user);
      return true; // 验证通过，允许访问
    } catch {
      return false; // Token无效或过期时拒绝访问
    }
  }

  // 从请求头中提取Bearer Token
    private extractTokenFromHeader(request: Request): string | undefined {
    //  获取 authorization 头
    const authHeader = request.headers['authorization'];
    if (!authHeader) return undefined;

    // 拆分 "Bearer <token>" 格式
    const [type, token] = authHeader.split(' ');

    // 验证类型是否为 Bearer，返回 Token（或 undefined）
    return type === 'Bearer' ? token : undefined;
  }
}