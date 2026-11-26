// src/modules/mini-app/technician/technician.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { Prisma, RealAuthStatus } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';

@Injectable()
export class TechnicianService {
  constructor(private prisma: PrismaService) {}

  /**
 * 获取电工个人信息详情（含关联企业信息）
 * @param technicianId 电工ID
 */
// async getTechnicianDetail(technicianId: number) {
//   const technician = await this.prisma.technician.findUnique({
//     where: { technicianId, isDeleted: false },
//     include: {
//       wechatUser: {
//         select: {
//           nickname: true,
//           avatarUrl: true,
//           gender: true,
//           phone: true,
//         },
//       },
//       // 关联查询电工与企业的关联关系（中间表）
//       enterpriseRelations: {
//         where: {
//           status: 'ACTIVE', // 仅查询启用状态的关联
//           isDeleted: false, // 排除已删除的关联
//           enterprise: { isDeleted: false } // 确保关联的企业未删除
//         },
//         include: {
//           // 关联查询企业核心信息
//           enterprise: {
//              select: {
//           id: true,
//           createdAt: true,
//           updatedAt: true,
//           enterpriseName: true,
//           enterpriseType: true, // 企业类型
//           enterpriseAddress: true,
//           contactPhone: true,
//           enterpriseEmail: true, // 企业邮箱
          
//           // 联系人信息字段
//           contactName: true,
//           contactPosition: true, // 联系人职务
//           contactMobile: true, // 联系人电话
//           contactEmail: true, // 联系人邮箱
          
//           // 用户基础信息-户号/表号/容量
//           enterpriseUserNo1: true, // 户号1
//           enterpriseUserNo2: true, // 户号2
//           enterpriseMeterNo1: true, // 表号1
//           enterpriseMeterNo2: true, // 表号2
//           transformerCapacity1: true, // 变压器容量1
//           transformerCapacity2: true, // 变压器容量2
//           usageCapacity1: true, // 使用容量1
//           usageCapacity2: true, // 使用容量2
          
//           // 电气设备与设施信息
//           powerSupplyMode: true, // 进线方式
//           powerSupplyMaintenanceType: true, // 进线修程
//           highVoltageCabinetCount: true, // 高压柜数量
//           transformerCount: true, // 变压器数量
//           lowVoltageCabinetCount: true, // 低压柜数量
//           capacitorCabinetCount: true, // 电容柜数量
//           dcScreen: true, // 直流屏
//           operationMaintenanceUnit: true, // 运检单位
//           electricalTestDate: true, // 电试日期
//           analogScreen: true, // 模拟屏
//           safetyEquipment: true, //安全用具
//           fireFightingEquipment: true, // 消防器材
//           ventilationEquipment: true, // 排风设备
//           airConditioner: true, // 空调
//           highResistanceScreen: true, // 高阻屏
//         }
//           }
//         },
//         orderBy: { createdAt: 'desc' } // 按关联时间倒序
//       }
//     },
//   });

//   if (!technician) {
//     throw new NotFoundException('电工信息不存在');
//   }

//   // 处理关联企业数据：提取企业信息数组
//   const relatedEnterprises = technician.enterpriseRelations.map(relation => relation.enterprise);

//   return {
//     technicianId: technician.technicianId,
//     wechatId: technician.wechatId,
//     realName: technician.realName,
//     phone: technician.phone || technician.wechatUser?.phone, // 优先用电工表手机号
//     skills: technician.skills || [],
//     jobName: technician.jobName || '',
//     certificates: technician.certificates || [],
//     experienceYears: technician.experienceYears,
//     rating: technician.rating,
//     totalOrders: technician.totalOrders,
//     completedOrders: technician.completedOrders,
//     workStatus: technician.workStatus,
//     location: {
//       lat: technician.locationLat,
//       lng: technician.locationLng,
//     },
//     // 微信用户信息
//     wechatInfo: {
//       nickname: technician.wechatUser?.nickname,
//       avatarUrl: technician.wechatUser?.avatarUrl,
//       gender: technician.wechatUser?.gender,
//     },
//     // 关联企业信息列表
//     relatedEnterprises: relatedEnterprises || []
//   };
// }
/**
   * 获取电工个人信息详情（补充新增字段）
   * @param technicianId 电工ID
   */
  async getTechnicianDetail(technicianId: number) {
    const technician = await this.prisma.technician.findUnique({
      where: { technicianId, isDeleted: false },
      include: {
        wechatUser: {
          select: {
            nickname: true,
            avatarUrl: true,
            gender: true,
            phone: true,
          },
        },
      },
    });

    if (!technician) {
      throw new NotFoundException('电工信息不存在');
    }

    // 构建返回数据（包含所有新增字段）
    return {
      technicianId: technician.technicianId,
      wechatId: technician.wechatId,
      realName: technician.realName || '',
      phone: technician.phone || technician.wechatUser?.phone || '',
      skills: technician.skills || [],
      jobName: technician.jobName || '',
      certificates: technician.certificates || [],
      experienceYears: technician.experienceYears || 0,
      rating: technician.rating || 5.0,
      totalOrders: technician.totalOrders,
      completedOrders: technician.completedOrders,
      workStatus: technician.workStatus, // 新增：工作状态枚举
      status: technician.status, // 新增：账号状态枚举
      location: {
        lat: technician.locationLat,
        lng: technician.locationLng,
      },
      idCardNo: technician.idCardNo || null,
      idCardFrontPhoto: technician.idCardFrontPhoto || null,
      idCardBackPhoto: technician.idCardBackPhoto || null,
      realAuthStatus: technician.realAuthStatus, // 实名认证状态（仅展示）
      realAuthRejectReason: technician.realAuthRejectReason || null,
      employmentStatus: technician.employmentStatus, // 从业状态枚举
      workExperience: technician.workExperience || [], // 从业资历数组
      wechatInfo: {
        nickname: technician.wechatUser?.nickname || '',
        avatarUrl: technician.wechatUser?.avatarUrl || '',
        gender: technician.wechatUser?.gender || 'UNKNOWN',
      },
      points: technician.points || 0, // 新增：积分
      createdAt: technician.createdAt,
      updatedAt: technician.updatedAt,
    };
  }


  /**
   * 更新电工个人信息
   * @param technicianId 电工ID
   * @param dto 更新参数
   */
  async updateTechnician(technicianId: number, dto: UpdateTechnicianDto) {
    //  查询电工信息，检查存在性+关联微信用户
    const technician = await this.prisma.technician.findUnique({
      where: { technicianId, isDeleted: false },
      include: { wechatUser: true },
    });
    const now = getCstTimeForPrisma();

    if (!technician) {
      throw new NotFoundException('电工信息不存在');
    }

    //  校验头像更新条件（需关联微信用户）
    if (dto.avatarUrl && !technician.wechatUser) {
      throw new BadRequestException('未关联微信账号，无法更新头像');
    }

    // 构建更新数据（核心修复：JSON/Decimal 类型适配）
    const { avatarUrl, ...technicianData } = dto;
    
    // 工具函数：将 DTO 中的数组转为 Prisma 兼容的 InputJsonValue
    const toPrismaJson = (value: any): Prisma.InputJsonValue => {
      if (Array.isArray(value)) {
        // 深拷贝去除 class 原型，转为纯 JSON 数组
        return JSON.parse(JSON.stringify(value));
      }
      return value;
    };

    // 最终更新数据
    const updateData: Prisma.TechnicianUpdateInput = {
      ...technicianData,
      updatedAt: now,
      realAuthStatus: RealAuthStatus.AUTHORIZED, 
      ...(dto.skills && { skills: toPrismaJson(dto.skills) }),
      ...(dto.certificates && { certificates: toPrismaJson(dto.certificates) }),
      ...(dto.workExperience && { workExperience: toPrismaJson(dto.workExperience) }),
      ...(dto.locationLat && { 
        locationLat: parseFloat(dto.locationLat) 
      }),
      ...(dto.locationLng && { 
        locationLng: parseFloat(dto.locationLng) 
      }),
      ...(avatarUrl && {
        wechatUser: {
          update: {
            avatarUrl,
            updatedAt: now,
          },
        },
      }),
    };

    try {
      const updated = await this.prisma.technician.update({
        where: { technicianId },
        data: updateData,
        include: { wechatUser: true },
      });

      return {
        technicianId: updated.technicianId,
        avatarUrl: updated.wechatUser?.avatarUrl || null,
        idCardNo: updated.idCardNo || null,
        workStatus: updated.workStatus,
        employmentStatus: updated.employmentStatus,
        updatedAt: updated.updatedAt,
        location: {
          lat: updated.locationLat ? updated.locationLat.toNumber() : null,
          lng: updated.locationLng ? updated.locationLng.toNumber() : null,
        },
      };
    } catch (error) {
      // 捕获身份证号唯一约束冲突
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        if (error.meta?.target === 'technicians_id_card_no_key') {
          throw new BadRequestException('该身份证号已被其他电工使用');
        }
      }
      // 捕获枚举值无效/参数错误
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('更新失败：参数值不符合要求（如枚举值错误）');
      }
      throw new BadRequestException(`更新电工信息失败：${error.message}`);
    }
  }
}