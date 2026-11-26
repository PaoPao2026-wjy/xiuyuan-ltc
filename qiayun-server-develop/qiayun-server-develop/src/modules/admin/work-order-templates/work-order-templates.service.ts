import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateWorkOrderTemplateDto } from './dto/create-work-order-template.dto';
import { UpdateWorkOrderTemplateDto } from './dto/update-work-order-template.dto';
import { FindWorkOrderTemplatesDto } from './dto/find-work-order-templates.dto';
import { TemplateStatus, WorkOrderTemplate } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';

@Injectable()
export class WorkOrderTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 新增工单模板
   */
  async create(
    createDto: CreateWorkOrderTemplateDto,
    adminId: number,
  ): Promise<WorkOrderTemplate> {
    const now = getCstTimeForPrisma();
    return this.prisma.workOrderTemplate.create({
      data: {
        ...createDto,
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      },
      include: {
        creator: { select: { adminId: true, realName: true } }, // 关联创建者信息
      },
    });
  }

  /**
   * 更新工单模板
   */
  async update(
    id: number,
    updateDto: UpdateWorkOrderTemplateDto,
  ): Promise<WorkOrderTemplate> {
    // 先验证模板存在
    await this.findOne(id);

    const now = getCstTimeForPrisma();
    return this.prisma.workOrderTemplate.update({
      where: { id },
      data: {
        ...updateDto,
        updatedAt: now, // 更新时间戳
      },
      include: {
        creator: { select: { adminId: true, realName: true } },
      },
    });
  }

  /**
   * 逻辑删除工单模板
   */
  async remove(id: number): Promise<void> {
    // 先验证模板存在
    await this.findOne(id);

    const now = getCstTimeForPrisma();
    await this.prisma.workOrderTemplate.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      },
    });
  }

  /**
   * 分页查询工单模板
   */
  async findAllByPage(
    queryDto: FindWorkOrderTemplatesDto,
  ): Promise<{
    list: WorkOrderTemplate[];
    pagination: { total: number; page: number; pageSize: number; pages: number };
  }> {
    const { page, pageSize, keyword, status } = queryDto;
    const skip = (page - 1) * pageSize;

    // 构建查询条件：过滤已删除 + 关键词搜索 + 状态筛选
    const where = {
      isDeleted: false,
      ...(keyword && { templateName: { contains: keyword } }), // 模糊搜索模板名称
      ...(status && { status: status as TemplateStatus }), // 筛选状态
    };

    // 并行查询列表和总数（优化性能）
    const [list, total] = await Promise.all([
      this.prisma.workOrderTemplate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }, // 按创建时间倒序
        include: {
          creator: { select: { realName: true } }, // 关联创建者姓名
        },
      }),
      this.prisma.workOrderTemplate.count({ where }),
    ]);

    return {
      list,
      pagination: {
        total,
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 获取模板详情（含完整templateData）
   */
  async findOne(id: number): Promise<WorkOrderTemplate & { creator: { realName: string } }> {
    const template = await this.prisma.workOrderTemplate.findUnique({
      where: { id, isDeleted: false },
      include: {
        creator: { select: { realName: true } }, // 关联创建者姓名
      },
    });

    if (!template) {
      throw new NotFoundException(`工单模板 ID ${id} 不存在或已删除`);
    }

    return template;
  }

  /**
   * 获取全量模板列表（无分页）
   */
  async findAll(status?: string): Promise<WorkOrderTemplate[]> {
    const where = {
      isDeleted: false,
      ...(status && { status: status as TemplateStatus }), // 可选：按状态筛选
    };

    return this.prisma.workOrderTemplate.findMany({
      where,
      orderBy: { templateName: 'asc' }, // 按名称正序排列
      include: {
        creator: { select: { realName: true } },
      },
    });
  }
}