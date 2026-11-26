// src/modules/admin/enterprises/enterprises.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { Enterprise, EnterpriseType, RealAuthStatus } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util'; // 引入东八区时间工具
import { FindEnterprisesDto } from './dto/find-enterprises.dto';
import { AuditEnterpriseDto } from './dto/audit-enterprise.dto';

@Injectable()
export class EnterprisesService {
  constructor(private readonly prisma: PrismaService) {}

  // 创建企业
  async create(createDto: CreateEnterpriseDto): Promise<Enterprise> {
    const now = getCstTimeForPrisma();
    return await this.prisma.enterprise.create({  
      data: {
        ...createDto,
        enterpriseRealAuthStatus: RealAuthStatus.AUTHORIZED, // 默认审核通过
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      }
    });
  }

  // 查询所有企业(审核通过)
  async findAll(): Promise<Enterprise[]> {
    return await this.prisma.enterprise.findMany({
       where: { enterpriseRealAuthStatus: RealAuthStatus.AUTHORIZED, isDeleted: false },
      orderBy: { createdAt: 'desc' }, // 按创建时间倒序
    });
  }

  // 查询单个企业
  async findOne(id: number): Promise<Enterprise> {
    const enterprise = await this.prisma.enterprise.findUnique({ where: { id, isDeleted: false } });
    if (!enterprise) {
      throw new NotFoundException(`企业 ID ${id} 不存在`);
    }
    return enterprise;
  }

  // 更新企业
  async update(id: number, updateDto: UpdateEnterpriseDto): Promise<Enterprise> {
    // 先检查企业是否存在
    await this.findOne(id);
    const now = getCstTimeForPrisma();
    return await this.prisma.enterprise.update({
      where: { id },
      data: {
        ...updateDto,
        updatedAt: now,
      },
    });
  }

// 删除企业方法（新增绑定用户校验）
  async remove(id: number): Promise<void> {
    // 先检查企业是否存在且未删除
    await this.findOne(id);

    // 核心校验：检查是否有企业角色的微信用户绑定该企业（未删除）
    const bindedWechatUsers = await this.prisma.wechatUser.findFirst({
      where: {
        enterpriseId: id, // 绑定当前企业
        loginRole: 'ENTERPRISE', // 仅校验企业角色用户
        isDeleted: false, // 未被逻辑删除
      },
      select: { wechatId: true }, // 仅查主键，减少查询开销
    });

    //  若存在绑定的企业用户，禁止删除
    if (bindedWechatUsers) {
      throw new BadRequestException('该企业仍有绑定的企业端用户，无法删除');
    }

    // 无绑定用户，执行企业逻辑删除
    const now = getCstTimeForPrisma();
    try {
      await this.prisma.enterprise.update({ 
        where: { id },
        data: {
          isDeleted: true, 
          deletedAt: now, 
          updatedAt: now,
        }
      });
    } catch (error) {
      throw new BadRequestException('企业删除失败：' + error.message);
    }
  }

   // 企业分页查询
  async findAllWithPagination(
    queryDto: FindEnterprisesDto,
  ): Promise<{
    list: Enterprise[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pages: number;
    };
  }> {
    const { page, pageSize, enterpriseType, keyword } = queryDto;
    // 计算分页偏移量（跳过前 N 条）
    const skip = (page - 1) * pageSize;

    // 构建筛选条件
    const where = {
      isDeleted: false,
      // 类型筛选：若传递 enterpriseType，则精确匹配
      ...(enterpriseType && { enterpriseType: enterpriseType as EnterpriseType }),
      // 关键词搜索：若传递 keyword，模糊匹配企业名称（忽略大小写）
      ...(keyword && {
        enterpriseName: {
          contains: keyword.toLowerCase(), // 转换为小写进行模糊匹配
        },
      }),
    };

    //并行查询
    const [list, total] = await Promise.all([
      // 查询当前页数据（支持排序，这里按创建时间倒序）
      this.prisma.enterprise.findMany({
        where,
        skip,
        take: pageSize, // 取 pageSize 条
        orderBy: { createdAt: 'desc' }, // 最新创建的企业排在前面
      }),
      // 查询总条数
      this.prisma.enterprise.aggregate({
        where,
        _count: true, // 统计符合条件的总条数
      }),
    ]);

    // 计算总页数（向上取整，如 11 条数据，每页10条，总页数为2）
    const totalPage = Math.ceil(total._count / pageSize);

  return {
      list,
      pagination: {
        total: total._count, // 总条数
        page,
        pageSize,
        pages: totalPage, // 总页数
      },
    };
  }
  
  /**
   * 审核企业实名认证
   * @param id 企业ID
   * @param auditDto 审核参数
   */
  async auditEnterprise(adminId: number, id: number, auditDto: AuditEnterpriseDto): Promise<Enterprise> {
    // 校验企业是否存在且未删除
    const enterprise = await this.findOne(id);

    // 业务校验：已审核通过的企业不允许重复审核（可选，根据业务需求调整）
    if (enterprise.enterpriseRealAuthStatus === RealAuthStatus.AUTHORIZED) {
      throw new BadRequestException(`企业ID ${id} 已审核通过，禁止重复操作`);
    }

    const now = getCstTimeForPrisma();

    // 构建更新数据：审核状态 + 驳回原因（失败时） + 更新时间
    const updateData: any = {
      enterpriseRealAuthStatus: auditDto.enterpriseRealAuthStatus,
      updatedAt: now,
    };

    // 审核通过时：清空驳回原因；审核失败时：必填驳回原因（DTO已校验，此处兜底）
    if (auditDto.enterpriseRealAuthStatus === RealAuthStatus.AUTHORIZED) {
      updateData.enterpriseRealAuthRejectReason = null; // 清空驳回原因
    } else if (auditDto.enterpriseRealAuthStatus === RealAuthStatus.REJECTED) {
      if (!auditDto.enterpriseRealAuthRejectReason) {
        throw new BadRequestException('审核驳回时，驳回原因不能为空');
      }
      updateData.enterpriseRealAuthRejectReason = auditDto.enterpriseRealAuthRejectReason;
    }
    //记录审核日志
    const adminUser = await this.prisma.adminUser.findUnique({ where: { adminId: adminId } });
    if (!adminUser) {
      throw new NotFoundException(`管理员 ID ${adminId} 不存在`);
    }
     await this.prisma.enterpriseAuditLog.create({
    data: {
      enterpriseId: id,
      operatorId: adminId, 
      operatorName: adminUser.realName, 
      originalStatus: enterprise.enterpriseRealAuthStatus,
      newStatus: auditDto.enterpriseRealAuthStatus,
      rejectReason: auditDto.enterpriseRealAuthRejectReason,
      createdAt: now,
    },
  });
    //  执行更新
    return await this.prisma.enterprise.update({
      where: { id },
      data: updateData,
    });
  }
}