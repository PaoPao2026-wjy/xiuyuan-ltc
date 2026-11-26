// src/modules/mini-app/auth/wechat-auth.service.ts
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { WechatCryptoService } from './wechat-crypto.service'; // 微信解密工具
import { WechatLoginDto } from './dto/wechat-login.dto';
import { WechatRegisterLoginDto } from './dto/wechat-register-login.dto';
import { WechatGender, TechnicianStatus, TechnicianWorkStatus, LoginRole, Enterprise, Prisma } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';

/** 基础用户信息（所有角色通用） */
interface BaseUserInfo {
  wechatId: number;
  openid: string;
  nickname: string;
  avatarUrl: string | null;
  phone: string | null;
  loginRole: LoginRole;
}

/** 个人（电工）用户信息 */
interface IndividualUserInfo extends BaseUserInfo {
  technicianId: number;
  workStatus: TechnicianWorkStatus;
}

/** 企业用户信息（新增企业字段） */
interface EnterpriseUserInfo extends BaseUserInfo {
  enterpriseId?: number; // 关联的企业ID
  enterpriseName?: string; // 企业名称（前端常用）
  hasEnterpriseInfo: boolean; // 标记是否完善企业信息
}

/** 联合类型：个人/企业用户 */
type UserInfo = IndividualUserInfo | EnterpriseUserInfo;

/** 最终返回的登录数据类型 */
export interface LoginResponse {
  token: string;
  user: UserInfo;
}


export interface EnterpriseInfo {
  id: number;
  enterpriseName: string;
}

/** 老用户登录返回类型 */
export interface OldUserLoginResponse {
  token: string;
  user: {
    wechatId: number;
    openid: string;
    nickname: string;
    avatarUrl: string | null;
    phone: string | null;
    loginRole: LoginRole;
    // 个人角色专属
    technicianId?: number;
    workStatus?: TechnicianWorkStatus;
    // 企业角色专属
    enterpriseId?: number;
    enterpriseName?: string;
    hasEnterpriseInfo: boolean;
  };
}

export interface CommonUserInfo {
  wechatId: number;
  openid: string;
  nickname: string;
  avatarUrl: string | null;
  phone: string | null;
  loginRole: LoginRole;
  technicianId?: number;
  workStatus?: TechnicianWorkStatus;
  enterpriseId?: number;
  enterpriseName?: string;
  hasEnterpriseInfo: boolean;
}

/** 通用登录/查询返回类型 */
export interface CommonLoginResponse {
  token: string;
  user: CommonUserInfo;
}

@Injectable()
export class WechatAuthService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService,
    private cryptoService: WechatCryptoService,
    private jwtService: JwtService,
  ) {}

  /**
   * 老用户登录（已注册，仅需 code）
   */
 async loginOldUser(dto: WechatLoginDto): Promise<OldUserLoginResponse> {
  //  用 code 换微信 session（仅需 openid）
  const { openid } = await this.getWechatSession(dto.code);

  // 查询微信用户（关联角色，不强制关联technician/enterprise）
  const wechatUser = await this.prisma.wechatUser.findFirst({
    where: { openid, isDeleted: false },
    select: {
      wechatId: true,
      openid: true,
      nickname: true,
      avatarUrl: true,
      phone: true,
      loginRole: true,
      enterpriseId: true, // 企业角色关联的企业ID
      isDeleted: true,
    },
  });

  //  基础校验：用户是否存在
  if (!wechatUser) {
    throw new BadRequestException('该微信账号未注册，请先完成注册');
  }

  let technician = null;
  let enterprise: EnterpriseInfo | null = null;

  //  按角色分支处理关联数据
  if (wechatUser.loginRole === LoginRole.INDIVIDUAL) {
    // 个人角色：必须关联电工记录
    technician = await this.prisma.technician.findUnique({
      where: { wechatId: wechatUser.wechatId, isDeleted: false },
      select: {
        technicianId: true,
        phone: true,
        workStatus: true,
      },
    });
    if (!technician) {
      throw new InternalServerErrorException('个人用户数据异常，缺失电工记录');
    }
  } else if (wechatUser.loginRole === LoginRole.ENTERPRISE) {
    // 企业角色：查询关联的企业信息（可选）
    if (wechatUser.enterpriseId) {
      enterprise = await this.prisma.enterprise.findUnique({
        where: { id: wechatUser.enterpriseId, isDeleted: false },
        select: { id: true, enterpriseName: true },
      }) as EnterpriseInfo | null;

      // 异常：企业ID存在但企业记录缺失
      if (!enterprise) {
        throw new InternalServerErrorException(
          `企业ID ${wechatUser.enterpriseId} 不存在或已被删除，请联系管理员`
        );
      }
    }
  } else {
    throw new BadRequestException(`不支持的登录角色：${wechatUser.loginRole}`);
  }

  // 生成兼容双角色的 JWT Token
  const token = this.generateToken(wechatUser, technician);

  // 构建兼容双角色的返回数据
  return {
    token,
    user: {
      wechatId: wechatUser.wechatId,
      openid: wechatUser.openid,
      nickname: wechatUser.nickname,
      avatarUrl: wechatUser.avatarUrl,
      phone: wechatUser.phone || technician?.phone || null, // 优先取微信用户手机号，其次电工
      loginRole: wechatUser.loginRole,
      // 个人角色专属字段
      ...(wechatUser.loginRole === LoginRole.INDIVIDUAL && {
        technicianId: technician!.technicianId,
        workStatus: technician!.workStatus,
      }),
      // 企业角色专属字段
      ...(wechatUser.loginRole === LoginRole.ENTERPRISE && {
        enterpriseId: enterprise?.id ?? wechatUser.enterpriseId ?? undefined,
        enterpriseName: enterprise?.enterpriseName,
        hasEnterpriseInfo: !!enterprise,
      }),
      // 统一标记：是否完善企业信息（企业角色专用）
      hasEnterpriseInfo: wechatUser.loginRole === LoginRole.ENTERPRISE ? !!enterprise : false,
    },
  };
}

  /**
 * 新用户注册+登录（未注册则注册，已注册则直接登录，需 code+手机号加密数据）
 */
// async registerAndLoginNewUser(dto: WechatRegisterLoginDto): Promise<LoginResponse> {
//   //  用 code 换微信 session
//   const { openid, session_key } = await this.getWechatSession(dto.code);
//   const now = getCstTimeForPrisma();

//   //  校验用户是否已注册
//   let wechatUser = await this.prisma.wechatUser.findUnique({
//     where: { openid, isDeleted: false },
//     // 新增：查询时直接带出 enterpriseId（避免二次查库）
//     select: {
//       wechatId: true,
//       openid: true,
//       nickname: true,
//       avatarUrl: true,
//       phone: true,
//       loginRole: true,
//       enterpriseId: true, // 关联的企业ID
//       isDeleted: true,
//     },
//   });
//   let technician = null;
//   let enterprise = null; // 企业信息

//   //  未注册用户 → 分支创建
//   if (!wechatUser) {
//     const phoneNumber = this.decryptPhoneNumber(dto.phoneEncryptedData, dto.phoneIv, session_key);
//     const result = await this.prisma.$transaction(async (tx) => {
//       // 创建微信用户（企业角色的 enterpriseId 初始为 null，需后续完善）
//       const newWechatUser = await tx.wechatUser.create({
//         data: {
//           openid,
//           nickname: `微信用户_${openid.slice(-6)}`,
//           avatarUrl: null,
//           gender: WechatGender.UNKNOWN,
//           phone: phoneNumber,
//           status: 'normal',
//           loginRole: dto.loginRole,
//           enterpriseId: null, // 初始无企业ID，需用户后续完善
//           createdAt: now,
//           updatedAt: now,
//         },
//       });

//       // 个人角色 → 创建电工
//       if (dto.loginRole === LoginRole.INDIVIDUAL) {
//         const newTechnician = await tx.technician.create({
//           data: {
//             wechatId: newWechatUser.wechatId,
//             realName: `微信用户_${openid.slice(-6)}`,
//             phone: phoneNumber,
//             status: TechnicianStatus.ACTIVE,
//             workStatus: TechnicianWorkStatus.AVAILABLE,
//             rating: 5.0,
//             totalOrders: 0,
//             completedOrders: 0,
//           },
//         });
//         return { wechatUser: newWechatUser, technician: newTechnician };
//       }

//       // 企业角色 → 仅创建微信用户
//       return { wechatUser: newWechatUser, technician: null };
//     });
//     wechatUser = result.wechatUser;
//     technician = result.technician;
//   }

//   // 已注册用户 → 补全关联数据（核心优化：处理企业ID）
//   if (wechatUser && !technician) {
//     // 个人角色：校验电工记录
//     if (wechatUser.loginRole === LoginRole.INDIVIDUAL) {
//       technician = await this.prisma.technician.findUnique({
//         where: { wechatId: wechatUser.wechatId, isDeleted: false },
//       });
//       if (!technician) {
//         throw new InternalServerErrorException('个人用户数据异常，缺失电工记录');
//       }
//     } 
//     // 企业角色：处理企业ID + 查询企业信息
//     else if (wechatUser.loginRole === LoginRole.ENTERPRISE) {
//       // 老用户有 enterpriseId → 查询关联的企业
//       if (wechatUser.enterpriseId) {
//         enterprise = await this.prisma.enterprise.findUnique({
//           where: { 
//             id: wechatUser.enterpriseId, 
//             isDeleted: false // 仅查询未删除的企业
//           },
//           select: {
//             id: true,
//             enterpriseName: true, // 仅返回前端需要的字段
//           },
//         });

//         // 异常：企业ID存在但企业记录缺失/已删除
//         if (!enterprise) {
//           throw new InternalServerErrorException(
//             `企业ID ${wechatUser.enterpriseId} 不存在或已被删除，请联系管理员`
//           );
//         }
//       }
//       // 老用户无 enterpriseId → 标记为未完善企业信息
//       else {
//         enterprise = null;
//       }
//     } 
//     // 未知角色
//     else {
//       throw new BadRequestException(`不支持的登录角色：${wechatUser.loginRole}`);
//     }
//   }

//   //  生成 Token（兼容企业/个人）
//   const token = this.generateToken(wechatUser, technician);

//   //  构建返回数据
//   const baseUserInfo: BaseUserInfo = {
//     wechatId: wechatUser.wechatId,
//     openid: wechatUser.openid,
//     nickname: wechatUser.nickname,
//     avatarUrl: wechatUser.avatarUrl,
//     phone: wechatUser.phone,
//     loginRole: wechatUser.loginRole,
//   };

//   let userInfo: UserInfo;
//   // 个人角色：返回电工信息
//   if (wechatUser.loginRole === LoginRole.INDIVIDUAL) {
//     userInfo = {
//       ...baseUserInfo,
//       technicianId: technician!.technicianId,
//       workStatus: technician!.workStatus,
//     };
//   } 
//   // 企业角色：返回企业信息（核心优化）
//   else {
//     userInfo = {
//       ...baseUserInfo,
//       enterpriseId: enterprise?.id ?? wechatUser.enterpriseId ?? undefined,
//       enterpriseName: enterprise?.enterpriseName,
//       hasEnterpriseInfo: !!enterprise, // true=已完善，false=未完善
//     };
//   }

//   return { token, user: userInfo };
// }

/**
 * 新用户注册+登录（未注册则注册，已注册则直接登录，需 code+手机号加密数据）
 * 优化点：支持同一openid/手机号对应不同角色，同角色下唯一
 */
async registerAndLoginNewUser(dto: WechatRegisterLoginDto): Promise<LoginResponse> {
  //  用 code 换微信 session
  const { openid, session_key } = await this.getWechatSession(dto.code);
  const now = getCstTimeForPrisma();

  //  核心修改1：将 findUnique → findFirst（支持组合条件），补充 loginRole 条件
  let wechatUser = await this.prisma.wechatUser.findFirst({ // 替换 findUnique 为 findFirst
    where: { 
      openid, 
      loginRole: dto.loginRole, // 组合唯一核心条件，必须保留
      isDeleted: false 
    },
    select: {
      wechatId: true,
      openid: true,
      nickname: true,
      avatarUrl: true,
      phone: true,
      loginRole: true,
      enterpriseId: true,
      isDeleted: true,
    },
  });
  let technician = null;
  let enterprise = null;

  //  未注册用户 → 分支创建（增加同角色唯一性校验 + 异常捕获）
  if (!wechatUser) {
    // 解密手机号
    const phoneNumber = this.decryptPhoneNumber(dto.phoneEncryptedData, dto.phoneIv, session_key);
    
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 事务内再次校验：同样替换 findUnique → findFirst
        const existUserInTx = await tx.wechatUser.findFirst({ // 替换 findUnique 为 findFirst
          where: {
            isDeleted: false,
            loginRole: dto.loginRole,
            OR: [
              { openid }, 
              { phone: phoneNumber }
            ]
          }
        });
        if (existUserInTx) {
          throw new BadRequestException(`当前${dto.loginRole === LoginRole.INDIVIDUAL ? '个人' : '企业'}角色下，该手机号/微信账号已注册`);
        }

        // 创建微信用户（同角色下唯一）
        const newWechatUser = await tx.wechatUser.create({
          data: {
            openid,
            nickname: `微信用户_${openid.slice(-6)}`,
            avatarUrl: null,
            gender: WechatGender.UNKNOWN,
            phone: phoneNumber,
            status: 'normal',
            loginRole: dto.loginRole,
            enterpriseId: null,
            createdAt: now,
            updatedAt: now,
          },
        });

        // 个人角色 → 创建电工
        if (dto.loginRole === LoginRole.INDIVIDUAL) {
          const newTechnician = await tx.technician.create({
            data: {
              wechatId: newWechatUser.wechatId,
              realName: `微信用户_${openid.slice(-6)}`,
              phone: phoneNumber,
              status: TechnicianStatus.ACTIVE,
              workStatus: TechnicianWorkStatus.AVAILABLE,
              rating: 5.0,
              totalOrders: 0,
              completedOrders: 0,
            },
          });
          return { wechatUser: newWechatUser, technician: newTechnician };
        }

        // 企业角色 → 仅创建微信用户
        return { wechatUser: newWechatUser, technician: null };
      });
      wechatUser = result.wechatUser;
      technician = result.technician;
    } catch (error) {
      // 捕获数据库唯一约束异常（处理并发场景）
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException(`当前${dto.loginRole === LoginRole.INDIVIDUAL ? '个人' : '企业'}角色下，该手机号/微信账号已注册`);
      }
      // 重新抛出其他异常
      throw error;
    }
  }

  // 已注册用户 → 补全关联数据（逻辑不变）
  if (wechatUser && !technician) {
    if (wechatUser.loginRole === LoginRole.INDIVIDUAL) {
      // 这里用 findUnique 是合法的：technician 的 wechatId 是唯一约束
      technician = await this.prisma.technician.findUnique({
        where: { wechatId: wechatUser.wechatId, isDeleted: false },
      });
      if (!technician) {
        throw new InternalServerErrorException('个人用户数据异常，缺失电工记录');
      }
    } else if (wechatUser.loginRole === LoginRole.ENTERPRISE) {
      if (wechatUser.enterpriseId) {
        // 这里用 findUnique 是合法的：enterprise 的 id 是主键
        enterprise = await this.prisma.enterprise.findUnique({
          where: { id: wechatUser.enterpriseId, isDeleted: false },
          select: { id: true, enterpriseName: true },
        });
        // if (!enterprise) {
        //   throw new InternalServerErrorException(`企业ID ${wechatUser.enterpriseId} 不存在或已被删除，请联系管理员`);
        // }
      } else {
        enterprise = null;
      }
    } else {
      throw new BadRequestException(`不支持的登录角色：${wechatUser.loginRole}`);
    }
  }

  //  生成 Token（兼容企业/个人）
  const token = this.generateToken(wechatUser, technician);

  //  构建返回数据
  const baseUserInfo: BaseUserInfo = {
    wechatId: wechatUser.wechatId,
    openid: wechatUser.openid,
    nickname: wechatUser.nickname,
    avatarUrl: wechatUser.avatarUrl,
    phone: wechatUser.phone,
    loginRole: wechatUser.loginRole,
  };

  let userInfo: UserInfo;
  if (wechatUser.loginRole === LoginRole.INDIVIDUAL) {
    userInfo = {
      ...baseUserInfo,
      technicianId: technician!.technicianId,
      workStatus: technician!.workStatus,
    };
  } else {
    userInfo = {
      ...baseUserInfo,
      enterpriseId: enterprise?.id ?? wechatUser.enterpriseId ?? undefined,
      enterpriseName: enterprise?.enterpriseName,
      hasEnterpriseInfo: !!enterprise,
    };
  }

  return { token, user: userInfo };
}


/**
   * 根据openid获取用户信息并生成Token（兼容企业/个人角色）
   * @param openid 微信用户唯一标识
   * @returns 通用登录返回类型（兼容双角色）
   */
  async getUserByOpenid(openid: string): Promise<CommonLoginResponse> {
    //  查询微信用户（仅查必要字段，不强制关联technician）
    const wechatUser = await this.prisma.wechatUser.findFirst({
      where: { openid, isDeleted: false },
      select: {
        wechatId: true,
        openid: true,
        nickname: true,
        avatarUrl: true,
        phone: true,
        loginRole: true,
        enterpriseId: true, // 企业角色关联的企业ID
        isDeleted: true,
      },
    });

    //  基础校验：用户是否存在
    if (!wechatUser) {
      throw new BadRequestException(`openid为${openid}的用户未注册`);
    }

    let technician = null;
    let enterprise: EnterpriseInfo | null = null;

    //  按角色分支处理关联数据
    if (wechatUser.loginRole === LoginRole.INDIVIDUAL) {
      // 个人角色：必须关联电工记录
      technician = await this.prisma.technician.findUnique({
        where: { wechatId: wechatUser.wechatId, isDeleted: false },
        select: {
          technicianId: true,
          phone: true,
          workStatus: true,
        },
      });
      if (!technician) {
        throw new BadRequestException(`openid为${openid}的个人用户未关联电工信息`);
      }
    } else if (wechatUser.loginRole === LoginRole.ENTERPRISE) {
      // 企业角色：查询关联的企业信息（可选，无则标记未完善）
      if (wechatUser.enterpriseId) {
        enterprise = await this.prisma.enterprise.findUnique({
          where: { id: wechatUser.enterpriseId, isDeleted: false },
          select: { id: true, enterpriseName: true },
        }) as EnterpriseInfo | null;

        // 企业ID存在但企业缺失时抛错（也可仅标记未完善）
        if (!enterprise) {
          throw new InternalServerErrorException(
            `openid为${openid}的企业用户关联的企业ID ${wechatUser.enterpriseId} 不存在`
          );
        }
      }
    } else {
      throw new BadRequestException(`openid为${openid}的用户角色无效：${wechatUser.loginRole}`);
    }

    //  生成兼容双角色的Token
    const token = this.generateToken(wechatUser, technician);

    //  构建通用返回数据（兼容双角色）
    return {
      token,
      user: {
        wechatId: wechatUser.wechatId,
        openid: wechatUser.openid,
        nickname: wechatUser.nickname,
        avatarUrl: wechatUser.avatarUrl,
        phone: wechatUser.phone || technician?.phone || null,
        loginRole: wechatUser.loginRole,
        // 个人角色专属字段
        ...(wechatUser.loginRole === LoginRole.INDIVIDUAL && {
          technicianId: technician!.technicianId,
          workStatus: technician!.workStatus,
        }),
        // 企业角色专属字段
        ...(wechatUser.loginRole === LoginRole.ENTERPRISE && {
          enterpriseId: enterprise?.id ?? wechatUser.enterpriseId ?? undefined,
          enterpriseName: enterprise?.enterpriseName,
        }),
        // 标记企业信息是否完善（企业角色专用）
        hasEnterpriseInfo: wechatUser.loginRole === LoginRole.ENTERPRISE ? !!enterprise : false,
      },
    };
  }

  /**
   * 工具方法：调用微信 jscode2session 接口获取 openid 和 session_key
   */
  private async getWechatSession(code: string) {
    const appid = this.configService.get<string>('WECHAT_APPID');
    const secret = this.configService.get<string>('WECHAT_SECRET');

    if (!appid || !secret) {
      throw new BadRequestException('微信小程序配置缺失，请联系管理员');
    }

    console.log('appid:', appid);
    console.log('secret:', secret);
    console.log('code:', code);

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    try {
      const { data } = await firstValueFrom(this.httpService.get(url));
      if (data.errcode) {
        throw new Error(`微信接口错误：${data.errmsg}（错误码：${data.errcode}）`);
      }
      return {
        openid: data.openid,
        session_key: data.session_key,
        unionid: data.unionid,
      };
    } catch (error) {
      throw new BadRequestException(`获取微信会话失败：${error.message}`);
    }
  }

  /**
   * 工具方法：解密手机号加密数据
   */
  private decryptPhoneNumber(encryptedData: string, iv: string, sessionKey: string): string {
    try {
      const decryptedData = this.cryptoService.decryptWechatData(encryptedData, iv, sessionKey);
      // 微信手机号解密结果固定返回 phoneNumber 字段
      if (!decryptedData.phoneNumber) {
        throw new Error('解密结果中未找到手机号');
      }
      return decryptedData.phoneNumber;
    } catch (error) {
      throw new BadRequestException(`手机号解密失败：${error.message}（请重新授权手机号）`);
    }
  }

 /**
 * 工具方法：生成 JWT Token（兼容企业/个人角色）
 * @param wechatUser 微信用户信息
 * @param technician 电工信息（个人角色有值，企业角色为null）
 * @returns JWT Token
 */
private generateToken(wechatUser: any, technician: any) {
  const basePayload = {
    sub: wechatUser.wechatId,
    openid: wechatUser.openid,
    nickname: wechatUser.nickname,
    loginRole: wechatUser.loginRole,
    clientType: 'app',
  };

  // 个人角色：补充电工ID
  if (wechatUser.loginRole === LoginRole.INDIVIDUAL) {
    return this.jwtService.sign({
      ...basePayload,
      technicianId: technician?.technicianId ?? null,
    }, {
      secret: this.configService.get('APP_JWT_SECRET'),
      expiresIn: '30d',
    });
  }

  // 企业角色：补充企业ID（老用户有则带，无则为null）
  return this.jwtService.sign({
    ...basePayload,
    enterpriseId: wechatUser.enterpriseId ?? null,
  }, {
    secret: this.configService.get('APP_JWT_SECRET'),
    expiresIn: '30d',
  });
}

}