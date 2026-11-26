import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAuthService } from '../../admin/auth/auth.service';
import { AdminRegisterDto } from '../../admin/auth/dto/admin-register.dto';
import { AdminLoginDto } from '../../admin/auth/dto/admin-login.dto';
import { AnonGuard } from '../../../common/guards/anon.guard'; // 允许匿名访问

@Controller('admin/auth') // 路由前缀：/api/admin/auth
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @UseGuards(AnonGuard) // 注册接口允许匿名访问
  @Post('register')
  async register(@Body() dto: AdminRegisterDto) {
    return {
      code: 200,
      message: '注册成功',
      data: await this.authService.register(dto),
    };
  }

  
  @UseGuards(AuthGuard('admin-local'), AnonGuard) // 使用admin-local策略
  @Post('login')
  async login(@Request() req, @Body() dto: AdminLoginDto) {
    return {
      code: 200,
      message: '登录成功',
      data: await this.authService.login(req.user),
    };
  }
}