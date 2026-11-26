// src/common/guards/anon.guard.ts
import { Injectable, CanActivate } from '@nestjs/common';

/**
 * 匿名访问守卫：允许接口无需登录即可访问
 * 用于登录、注册等公开接口
 */
@Injectable()
export class AnonGuard implements CanActivate {
  // 始终返回true，表示允许访问
  canActivate(): boolean {
    return true;
  }
}