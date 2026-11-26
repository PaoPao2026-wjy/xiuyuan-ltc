import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminRegisterDto } from '../auth/dto/admin-register.dto';
import { AdminRole } from '@prisma/client'; // 从Prisma生成的客户端导入枚举类型
import { getCstTimeForPrisma } from '../../../common/utils/time.util'; // 引入东八区时间工具

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 注册新后台用户
  async register(dto: AdminRegisterDto) {
    // 检查用户名/手机号/邮箱是否已存在
    const existingUser = await this.prisma.adminUser.findFirst({
      where: {
        OR: [
          { username: dto.username },
          { phone: dto.phone },
          { email: dto.email },
        ],
      },
    });
    if (existingUser) {
      throw new ConflictException('用户名、手机号或邮箱已被注册');
    }

    // 密码加密（盐值10轮）
    const hashedPassword = await bcrypt.hash(dto.password, 10);

     const now = getCstTimeForPrisma();
    // 创建用户（默认角色为普通员工，状态为活跃）
    const newAdmin = await this.prisma.adminUser.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        realName: dto.realName,
        phone: dto.phone,
        email: dto.email,
        isDeleted: false, // 默认未删除
        createdAt: now,
        updatedAt: now,
        role: AdminRole.STAFF, // 默认普通员工
        status: 'ACTIVE',
      },
    });

    // 隐藏密码，返回用户信息
    const { password: _, ...result } = newAdmin;
    return result;
  }

  // 验证账号密码（供LocalStrategy调用）
  async validateAdmin(username: string, password: string) {
    // 查询用户（仅查询活跃状态的）
    const admin = await this.prisma.adminUser.findFirst({
      where: { username, status: 'ACTIVE' , isDeleted: false }, // 过滤已删除用户
    });
    if (!admin) return null;

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) return null;

    // 隐藏密码，返回用户信息
    const { password: _, ...result } = admin;
    return result;
  }

  // 生成JWT令牌
  async login(admin: any) {
    const payload = {
      sub: admin.adminId, // 用户ID
      username: admin.username,
      role: admin.role,
      clientType: 'admin', // 标记为后台用户
      adminId: admin.adminId,
    };

    return {
      access_token: this.jwtService.sign(payload), // 生成Token
      user: {
        adminId: admin.adminId,
        username: admin.username,
        realName: admin.realName,
        role: admin.role,
      },
    };
  }
}