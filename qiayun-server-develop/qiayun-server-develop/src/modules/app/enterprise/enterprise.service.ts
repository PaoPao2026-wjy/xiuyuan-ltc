// src/modules/app/enterprise/enterprise.service.ts
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { Prisma, RealAuthStatus, WechatGender } from '@prisma/client'; 
import { getCstTimeForPrisma } from 'src/common/utils/time.util';
import { UpdateWechatUserDto } from './dto/update-wechat-user.dto';

@Injectable()
export class EnterpriseService {
  constructor(private prisma: PrismaService) {}

  /**
   * 小程序企业用户创建/绑定企业（核心逻辑：社会信用代码去重）
   * @param createDto 企业信息（含社会信用代码）
   * @param wechatId 小程序用户微信ID（从Token解析）
   */
  async createOrBindEnterprise(createDto: CreateEnterpriseDto, wechatId: number) {
    //  校验当前用户是否为企业角色 & 未绑定企业
    const wechatUser = await this.prisma.wechatUser.findUnique({
      where: { wechatId, isDeleted: false },
      select: { loginRole: true, enterpriseId: true },
    });
    const now = getCstTimeForPrisma();
    if (!wechatUser) {
      throw new NotFoundException('小程序用户不存在');
    }
    if (wechatUser.loginRole !== 'ENTERPRISE') {
      throw new ForbiddenException('仅企业角色用户可创建/绑定企业');
    }
    if (wechatUser.enterpriseId) {
      throw new BadRequestException('您已绑定企业，不可重复操作');
    }

    //  按社会信用代码查询企业是否已存在
    const existingEnterprise = await this.prisma.enterprise.findUnique({
      where: { 
        socialCreditCode: createDto.socialCreditCode,
        isDeleted: false 
      },
    });

    // 企业已存在 → 直接绑定当前用户到该企业
    if (existingEnterprise) {
      await this.prisma.wechatUser.update({
        where: { wechatId },
        data: {
          enterpriseId: existingEnterprise.id,
          updatedAt: now,
        },
      });
      return {
        isNew: false, // 标记：非新建，仅绑定
        enterprise: existingEnterprise,
      };
    }

    //  企业不存在 → 新建企业并绑定当前用户（捕获唯一约束异常）
    try {
      return this.prisma.$transaction(async (tx) => {
        // 新建企业（DTO中新增的contactName2/3、businessLicensePhoto等字段自动映射）
        const newEnterprise = await tx.enterprise.create({
          data: {
            ...createDto,
            enterpriseRealAuthStatus: RealAuthStatus.AUDITING, // 默认审核中
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
          },
        });

        // 绑定当前用户到新企业
        await tx.wechatUser.update({
          where: { wechatId },
          data: {
            enterpriseId: newEnterprise.id,
            updatedAt: now,
          },
        });

        return {
          isNew: true, // 标记：新建企业
          enterprise: newEnterprise,
        };
      });
    } catch (error) {
      // 捕获社会信用代码唯一约束冲突（并发场景）
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('该统一社会信用代码已被其他企业使用');
      }
      // 其他错误向上抛出
      throw new BadRequestException(`创建企业失败：${error.message}`);
    }
  }

  /**
   * 小程序企业用户查询绑定的企业信息
   * @param wechatId 小程序用户微信ID
   * @returns 企业信息（绑定则返回详情，未绑定/企业不存在则返回null）
   */
  async findMyEnterprise(wechatId: number) {
    // 查用户绑定的enterpriseId
    const wechatUser = await this.prisma.wechatUser.findUnique({
      where: { wechatId, isDeleted: false },
      select: { enterpriseId: true },
    });

    // 未绑定任何企业 → 直接返回null
    if (!wechatUser?.enterpriseId) {
      return null;
    }

    // 查企业详情（企业不存在/已删除 → 返回null）
    const enterprise = await this.prisma.enterprise.findUnique({
      where: { id: wechatUser.enterpriseId, isDeleted: false },
    });

    return enterprise || null;
  }

  /**
   * 小程序企业用户更新绑定的企业信息
   * @param updateDto 更新参数
   * @param wechatId 小程序用户微信ID
   */
  async updateMyEnterprise(updateDto: UpdateEnterpriseDto, wechatId: number) {
    // 查用户绑定的企业ID
    const wechatUser = await this.prisma.wechatUser.findUnique({
      where: { wechatId, isDeleted: false },
      select: { enterpriseId: true },
    });
    const now = getCstTimeForPrisma();

    if (!wechatUser?.enterpriseId) {
      throw new NotFoundException('您尚未绑定企业，无法更新');
    }

    //  校验企业是否存在（防止企业被删除后更新）
    const enterprise = await this.prisma.enterprise.findUnique({
      where: { id: wechatUser.enterpriseId, isDeleted: false },
    });
    if (!enterprise) {
      throw new NotFoundException('绑定的企业信息不存在，无法更新');
    }

    //  更新企业信息
    const { socialCreditCode, ...updateData } = updateDto; // 剔除不可修改的字段
    try {
      return this.prisma.enterprise.update({
        where: { id: wechatUser.enterpriseId, isDeleted: false },
        data: {
          ...updateData,
          updatedAt: now,
        },
      });
    } catch (error) {
      throw new BadRequestException(`更新企业失败：${error.message}`);
    }
  }

 /**
 * 企业端用户查询自身微信信息详情（含完整企业信息）
 * @param wechatId 小程序用户微信ID（从Token解析）
 */
async findWechatUserDetail(wechatId: number) {
  const wechatUser = await this.prisma.wechatUser.findUnique({
    where: { wechatId, isDeleted: false },
    select: {
      wechatId: true,
      nickname: true,
      phone: true, // 包含手机号
      contactName: true, // 包含联系人姓名  
      contactPosition: true, // 包含联系人职务
      avatarUrl: true,
      gender: true,
      country: true,
      province: true,
      city: true,
      language: true,
      loginRole: true,
      enterpriseId: true,
      createdAt: true,
      updatedAt: true,
      enterprise: {
        where: { isDeleted: false }, // 确保只返回未删除的企业
      },
    },
  });

  if (!wechatUser) {
    throw new NotFoundException('微信用户信息不存在');
  }

  // 直接返回，enterprise 字段会自动为 null（若无关联或企业已删除）
  return {
    wechatId: wechatUser.wechatId,
    nickname: wechatUser.nickname,
    phone: wechatUser.phone, // 包含手机号
    contactName: wechatUser.contactName, // 包含联系人姓名  
    contactPosition: wechatUser.contactPosition, // 包含联系人职务
    avatarUrl: wechatUser.avatarUrl,
    gender: wechatUser.gender,
    country: wechatUser.country,
    province: wechatUser.province,
    city: wechatUser.city,
    language: wechatUser.language,
    loginRole: wechatUser.loginRole,
    enterpriseId: wechatUser.enterpriseId,
    createdAt: wechatUser.createdAt,
    updatedAt: wechatUser.updatedAt,
    enterprise: wechatUser.enterprise, // 可能为 null
  };
}


  /**
 * 企业端用户更新自身微信信息
 * @param updateDto 微信信息更新参数
 * @param wechatId 小程序用户微信ID（从Token解析）
 */
async updateWechatUserInfo(updateDto: UpdateWechatUserDto, wechatId: number) {
  // 校验用户存在且未被删除
  const wechatUser = await this.prisma.wechatUser.findUnique({
    where: { wechatId, isDeleted: false },
  });

  if (!wechatUser) {
    throw new NotFoundException('微信用户信息不存在');
  }

  // 校验用户为企业角色（仅企业用户可更新）
  if (wechatUser.loginRole !== 'ENTERPRISE') {
    throw new ForbiddenException('仅企业角色用户可更新微信信息');
  }

  // 构建更新数据
  const updateData: any = {
    updatedAt: getCstTimeForPrisma(), // 统一更新时间
  };

  // 微信昵称
  if (updateDto.nickname) {
    updateData.nickname = updateDto.nickname;
  }

  // 头像URL
  if (updateDto.avatarUrl) {
    updateData.avatarUrl = updateDto.avatarUrl;
  }

  // 性别
  if (updateDto.gender) {
    // 定义前端传入值与Prisma枚举的映射关系
    const genderMapping: Record<string, WechatGender> = {
      '男': WechatGender.MALE,
      '女': WechatGender.FEMALE,
      '未知': WechatGender.UNKNOWN,
      'MALE': WechatGender.MALE,
      'FEMALE': WechatGender.FEMALE,
      'UNKNOWN': WechatGender.UNKNOWN,
    };

    // 校验传入的性别值是否有效
    if (!Object.keys(genderMapping).includes(updateDto.gender)) {
      throw new BadRequestException(
        `性别值无效，仅支持：男/女/未知 或 MALE/FEMALE/UNKNOWN`
      );
    }

    // 
    updateData.gender = genderMapping[updateDto.gender];
  }

  //  其他字符串字段
  if (updateDto.country) updateData.country = updateDto.country;
  if (updateDto.province) updateData.province = updateDto.province;
  if (updateDto.city) updateData.city = updateDto.city;
  if (updateDto.language) updateData.language = updateDto.language;
  if (updateDto.contactName) updateData.contactName = updateDto.contactName;
  if (updateDto.contactPosition) updateData.contactPosition = updateDto.contactPosition;

  //  执行更新
  try {
    const updatedUser = await this.prisma.wechatUser.update({
      where: { wechatId, isDeleted: false },
      data: updateData,
      select: {
        wechatId: true,
        nickname: true,      
        contactName: true, // 包含联系人姓名  
        contactPosition: true, // 包含联系人职务
        phone: true, // 包含手机号
        avatarUrl: true,
        gender: true,         
        country: true,
        province: true,
        city: true,
        language: true,
        updatedAt: true,
      },
    });

    //  格式化返回字段
    const reverseGenderMap: Record<WechatGender, string> = {
      [WechatGender.MALE]: '男',
      [WechatGender.FEMALE]: '女',
      [WechatGender.UNKNOWN]: '未知',
    };

    return {
      wechatId: updatedUser.wechatId,
      nickname: updatedUser.nickname,        
      avatarUrl: updatedUser.avatarUrl,
      phone: updatedUser.phone, // 包含手机号
      contactName: updatedUser.contactName, // 包含联系人姓名  
      contactPosition: updatedUser.contactPosition, // 包含联系人职务
      gender: reverseGenderMap[updatedUser.gender],
      country: updatedUser.country,
      province: updatedUser.province,
      city: updatedUser.city,
      language: updatedUser.language,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2003: 外键/枚举约束错误；P2025: 记录不存在（双重校验）
      if (error.code === 'P2003' || error.code === 'P2025') {
        throw new BadRequestException('更新失败：参数值不符合要求，请检查后重试');
      }
    }
    throw new BadRequestException(`更新微信信息失败：${error.message}`);
  }
}
}