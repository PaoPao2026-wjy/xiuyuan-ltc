import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { QueryAdminUserDto } from './dto/query-admin-user.dto';
import * as bcrypt from 'bcrypt';
import { AdminRole, AdminStatus } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';

@Injectable()
export class AdminUserService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建新后台用户（密码自动加密）
   */
  async create(createDto: CreateAdminUserDto) {
    // 检查用户名/手机号/邮箱是否已存在
    const existingUser = await this.prisma.adminUser.findFirst({
      where: {
        OR: [
          { username: createDto.username },
          { phone: createDto.phone },
          { email: createDto.email },
        ],
      },
    });
    if (existingUser) {
      throw new ConflictException('用户名、手机号或邮箱已被占用');
    }

    // 密码加密（盐值10轮）
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const now = getCstTimeForPrisma();
    //  创建用户
    return this.prisma.adminUser.create({
      data: {
        ...createDto,
        createdAt: now,
        updatedAt: now,
        isDeleted: false, // 默认未删除
        password: hashedPassword, // 存储加密后的密码
        status: AdminStatus.ACTIVE, // 默认状态为活跃
      },
      select: {
        password: false, // 隐藏密码字段
        adminId: true,
        username: true,
        realName: true,
        phone: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * 分页查询后台用户（支持角色、状态筛选和关键词搜索）
   */
  async findAll(queryDto: QueryAdminUserDto) {
    const { page, pageSize, role, status, keyword } = queryDto;
    const skip = (page - 1) * pageSize; // 计算偏移量

    // 构建查询条件
    const where: any = { isDeleted: false }; // 默认查询未删除用户
    if (role) where.role = role;
    if (status) where.status = status;
    if (keyword) {
      where.OR = [
        { username: { contains: keyword.toLowerCase} },
        { realName: { contains: keyword.toLowerCase} },
        { phone: { contains: keyword } }, 
      ];
    }

    // 执行查询
    const [list, total] = await Promise.all([
      this.prisma.adminUser.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }, // 按创建时间倒序
        select: {
          password: false, // 隐藏密码
          adminId: true,
          username: true,
          realName: true,
          phone: true,
          email: true,
          role: true,
          avatar: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prisma.adminUser.count({ where }), // 总条数
    ]);

    return {
      list,
      pagination: {
        total,
        page,
        pageSize,
        pages: Math.ceil(total / pageSize), // 总页数
      },
    };
  }

  /**
   * 通过ID查询单个用户
   */
  async findOne(adminId: number) {
    const user = await this.prisma.adminUser.findUnique({
      where: { adminId, isDeleted: false }, // 过滤已删除用户
      select: {
        password: false, // 隐藏密码
        adminId: true,
        username: true,
        realName: true,
        phone: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${adminId} 不存在`);
    }
    return user;
  }

  /**
   * 更新用户信息（不包含密码，密码更新单独处理）
   */
  async update(adminId: number, updateDto: UpdateAdminUserDto) {
    // 检查用户是否存在
    await this.findOne(adminId);

    const now = getCstTimeForPrisma();
    // 若更新了用户名/手机号/邮箱，检查是否与其他用户冲突
    if (updateDto.username || updateDto.phone || updateDto.email) {
      const conflictUser = await this.prisma.adminUser.findFirst({
        where: {
          isDeleted: false, // 过滤已删除用户
          adminId: { not: adminId }, // 排除当前用户
          OR: [
            { username: updateDto.username },
            { phone: updateDto.phone },
            { email: updateDto.email },
          ].filter(Boolean), // 过滤未提供的字段
        },
      });
      if (conflictUser) {
        throw new ConflictException('用户名、手机号或邮箱已被占用');
      }
    }

    //  执行更新
    return this.prisma.adminUser.update({
      where: { adminId },
      data: {
        ...updateDto,
        updatedAt: now,
      },
      select: {
        password: false,
        adminId: true,
        username: true,
        realName: true,
        phone: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  /**
   * 重置用户密码
   */
  async resetPassword(adminId: number, newPassword: string) {
    // 检查用户是否存在
    await this.findOne(adminId);

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    const now = getCstTimeForPrisma();
    return this.prisma.adminUser.update({
      where: { adminId },
      data: {
        password: hashedPassword,
        updatedAt: now,
      },
      select: { adminId: true, username: true, updatedAt: true },
    });
  }

  /**
   * 删除用户
   */
  async remove(adminId: number) {
    //检查用户是否存在
    await this.findOne(adminId);

    // 执行删除
    const now = getCstTimeForPrisma();
    await this.prisma.adminUser.update({ 
      where: { adminId },
      data: {
        isDeleted: true, 
        deletedAt: now, 
        updatedAt: now,
      }
    });
  }
}