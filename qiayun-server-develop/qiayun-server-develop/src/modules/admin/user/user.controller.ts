import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';

import { AdminUserService } from './user.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { QueryAdminUserDto } from './dto/query-admin-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AdminGuard } from '../auth/admin.guard'; 
import { BadRequestException, NotFoundException } from '@nestjs/common';



@Controller('admin/users') // 路由前缀：/api/admin/users
@UseGuards(AdminGuard) // 所有接口需后台用户登录
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  // 创建新用户
  @UseGuards(AdminGuard) 
  @Post()
  async create(@Body() createDto: CreateAdminUserDto) {
    return {
      code: 200,
      message: '用户创建成功',
      data: await this.adminUserService.create(createDto),
    };
  }


  // 查询所有用户
  @UseGuards(AdminGuard) 
  @Get()
  async findAll(@Query() queryDto: QueryAdminUserDto) {
    console.log('page类型:', typeof queryDto.page, '值:', queryDto.page);
  console.log('pageSize类型:', typeof queryDto.pageSize, '值:', queryDto.pageSize);
    return {
      code: 200,
      data: await this.adminUserService.findAll(queryDto),
    };
  }


  // 查询单个用户
  @UseGuards(AdminGuard) 
  @Get(':adminId')
  async findOne(@Param('adminId') adminId: string) {
    // 校验 adminId 是否为有效数字
    const id = Number(adminId);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('用户ID必须是正整数');
    }

  // 调用服务时传入有效数字
  const user = await this.adminUserService.findOne(id);
  if (!user) {
    throw new NotFoundException(`用户ID ${id} 不存在`);
  }

  return { code: 200, data: user };
}

  // 更新用户信息
  @Put(':adminId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('adminId') adminId: string,
    @Body() updateDto: UpdateAdminUserDto,
  ) {
    // 校验 adminId 是否为有效数字
    const id = Number(adminId);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('用户ID必须是正整数');
    }

    // 调用服务时传入有效数字
    return {
      code: 200,
      message: '用户更新成功',
      data: await this.adminUserService.update(id, updateDto),
    };
  }


  // 重置用户密码
  @UseGuards(AdminGuard)
  @Put(':adminId/password')
  async resetPassword(
    @Param('adminId') adminId: string,
    @Body() dto: ResetPasswordDto,
  ) {
    // 校验 adminId 是否为有效数字
    const id = Number(adminId);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('用户ID必须是正整数');
    }
    return {
      code: 200,
      message: '密码重置成功',
      data: await this.adminUserService.resetPassword(id, dto.newPassword),
    };
  }


  // 删除用户
  @UseGuards(AdminGuard)
  @Delete(':adminId')
  async remove(@Param('adminId') adminId: string) {
    // 校验 adminId 是否为有效数字
    const id = Number(adminId);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('用户ID必须是正整数');
    }

    return {
      code: 200,
      message: '用户删除成功',
      data: this.adminUserService.remove(+adminId),
    };
  }
}