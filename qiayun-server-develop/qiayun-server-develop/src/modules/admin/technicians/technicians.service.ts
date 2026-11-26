// src/modules/admin/technicians/technicians.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindTechniciansDto } from './dto/find-technicians.dto';
import { Technician, TechnicianPointsLog, WechatUser } from '@prisma/client';
import { safeJsonParse } from 'src/common/utils/safe-json.util';
import { FindTechnicianPointsLogsDto } from './dto/find-technician-points-logs.dto';

// 扩展详情返回类型：包含关联的微信用户信息
type TechnicianDetail = Technician & {
  wechatUser?: Pick<WechatUser, 'wechatId' | 'nickname' | 'avatarUrl' | 'gender'>;
};

// 积分日志返回类型
type TechnicianPointsLogItem = TechnicianPointsLog & {
  technician?: Pick<Technician, 'technicianId' | 'realName' | 'phone'>; // 关联电工基础信息
};

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 电工列表（分页+筛选）
   * 新增：实名认证状态、从业状态、身份证号筛选
   */
  async findAllWithPagination(
    queryDto: FindTechniciansDto,
  ): Promise<{
    list: TechnicianDetail[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pages: number;
    };
  }> {
    const { page, pageSize, workStatus, status, realAuthStatus, employmentStatus, idCardNo, keyword } = queryDto;
    const skip = (page - 1) * pageSize;

    // 构建查询条件（新增实名认证/从业状态/身份证号筛选）
    const where = {
      isDeleted: false, 
      ...(workStatus && { workStatus }),
      ...(status && { status }),
      ...(realAuthStatus && { realAuthStatus }), // 实名认证状态筛选
      ...(employmentStatus && { employmentStatus }), // 从业状态筛选
     ...(idCardNo && { idCardNo: { contains: idCardNo } }), // 身份证号模糊匹配
      // 关键词搜索：姓名/手机号模糊匹配（不区分大小写）
      ...(keyword && {
        OR: [
          { realName: { contains: keyword.toLowerCase() } },
          { phone: { contains: keyword.toLowerCase() } },
        ],
      }),
    };

    const [list, total] = await Promise.all([
      this.prisma.technician.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          wechatUser: {
            select: {
              wechatId: true,
              nickname: true,
              avatarUrl: true,
              gender: true,
            },
          },
        },
      }),
      this.prisma.technician.count({ where }),
    ]);

    // 解析JSON字段（skills/certificates/workExperience）
    const parsedList = list.map(tech => ({
      ...tech,
      // skills: safeJsonParse(tech.skills),
      // certificates: safeJsonParse(tech.certificates),
      // workExperience: safeJsonParse(tech.workExperience), // 新增：解析从业资历
    })) as TechnicianDetail[];

    return {
      list: parsedList,
      pagination: {
        total,
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 电工详情（按ID查询）
   */
  async findOne(technicianId: number): Promise<TechnicianDetail> {
    const technician = await this.prisma.technician.findUnique({
      where: {
        technicianId,
        isDeleted: false,
      },
      include: {
        wechatUser: {
          select: {
            wechatId: true,
            nickname: true,
            avatarUrl: true,
            gender: true,
            country: true,
            province: true,
            city: true,
            createdAt: true,
          },
        },
      },
    });

    if (!technician) {
      throw new NotFoundException(`电工 ID ${technicianId} 不存在或已删除`);
    }

    // 解析所有JSON字段
    return {
      ...technician,
      // skills: technician.skills ? JSON.parse(String(technician.skills)) : [],
      // certificates: technician.certificates ? JSON.parse(String(technician.certificates)) : [],
      // workExperience: technician.workExperience ? JSON.parse(String(technician.workExperience)) : [],
    } as TechnicianDetail;
  }

  /**
   * 电工积分变动日志（分页+筛选）
   * @param technicianId 电工ID（必填，筛选指定电工的积分日志）
   * @param queryDto 分页+筛选参数
   */
  async findTechnicianPointsLogsWithPagination(
    technicianId: number,
    queryDto: FindTechnicianPointsLogsDto,
  ): Promise<{
    list: TechnicianPointsLogItem[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pages: number;
    };
  }> {
    // 1. 校验电工是否存在
    await this.findOne(technicianId);

    const { page, pageSize, type, relatedOrderId, reasonKeyword, startTime, endTime } = queryDto;
    const skip = (page - 1) * pageSize;

    // 2. 构建积分日志筛选条件
    const where = {
      isDeleted: false,
      technicianId, // 仅查询指定电工的积分日志
      ...(type && { type }), // 积分变动类型筛选
      ...(relatedOrderId && { relatedOrderId }), // 关联工单ID筛选
      // 变动原因关键词模糊匹配
      ...(reasonKeyword && { reason: { contains: reasonKeyword.toLowerCase() } }),
      // 时间范围筛选
      ...(startTime && endTime && {
        createdAt: {
          gte: new Date(startTime), // 大于等于开始时间
          lte: new Date(endTime), // 小于等于结束时间
        },
      }),
      ...(startTime && !endTime && { createdAt: { gte: new Date(startTime) } }),
      ...(!startTime && endTime && { createdAt: { lte: new Date(endTime) } }),
    };

    // 3. 并行查询列表和总数
    const [list, total] = await Promise.all([
      this.prisma.technicianPointsLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }, // 按变动时间倒序
        include: {
          // 关联电工基础信息（便于展示）
          technician: {
            select: {
              technicianId: true,
              realName: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.technicianPointsLog.count({ where }),
    ]);

    return {
      list: list as TechnicianPointsLogItem[],
      pagination: {
        total,
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
      },
    };
  }
}