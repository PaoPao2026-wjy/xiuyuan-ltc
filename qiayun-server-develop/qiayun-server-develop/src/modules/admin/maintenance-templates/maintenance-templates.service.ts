// src/modules/admin/maintenance-templates/maintenance-templates.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMaintenanceTemplateDto } from './dto/create-maintenance-template.dto';
import { UpdateMaintenanceTemplateDto } from './dto/update-maintenance-template.dto';
import { FindMaintenanceTemplatesDto } from './dto/find-maintenance-templates.dto';
import { MaintenanceTemplate, InspectionItem, OperationItem } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';

// 扩展模板详情类型：包含关联的检查项+操作项
type TemplateDetail = MaintenanceTemplate & {
  items: InspectionItem[]; // 模板关联的检查项
  operations: OperationItem[]; // 模板关联的操作项
};


// 带检查项+操作项的模板类型
type TemplateWithItems = MaintenanceTemplate & {
  items: InspectionItem[];
  operations: OperationItem[];
};;


@Injectable()
export class MaintenanceTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 模板列表（分页+关键词搜索）
   */
  async findAllByPage(
    queryDto: FindMaintenanceTemplatesDto,
  ): Promise<{
    list: MaintenanceTemplate[];
    pagination: { total: number; page: number; pageSize: number; pages: number };
  }> {
    const { page, pageSize, keyword } = queryDto;
    const skip = (page - 1) * pageSize;

    // 构建查询条件：过滤已删除+关键词搜索
    const where = {
      isDeleted: false,
      ...(keyword && { name: { contains: keyword.toLowerCase() } }),
    };

    // 并行查询列表+总数
    const [list, total] = await Promise.all([
      this.prisma.maintenanceTemplate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { realName: true } }, // 关联创建者姓名
        },
      }),
      this.prisma.maintenanceTemplate.count({ where }),
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
   * 无分页的带检查项模板列表
   * 模板直接关联检查项 + 模板直接关联操作项
   */
  async findAllWithItemsNoPagination(
    keyword?: string,
  ): Promise<TemplateWithItems[]> {
    const where = {
      isDeleted: false,
      ...(keyword && { name: { contains: keyword.toLowerCase() } }),
    };

    const rawList = await this.prisma.maintenanceTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
     include: {
        creator: { select: { realName: true } },
        items: { where: { isDeleted: false }, orderBy: { createdAt: 'asc' } }, // 模板→检查项
        operations: { where: { isDeleted: false }, orderBy: { createdAt: 'asc' } }, // 模板→操作项
      },
    });

    return rawList.map(template => ({
      ...template,
      // 解析模板直接关联的操作项
      operations: template.operations.map(op => ({
        ...op,
        options: op.options ? JSON.parse(String(op.options)) : null,
      })),
    }));
  }

  /**
   * 模板详情（关联检查项+操作项）
   */
  async findOne(id: number): Promise<TemplateDetail> {
    const template = await this.prisma.maintenanceTemplate.findUnique({
      where: { id, isDeleted: false },
       include: {
        creator: { select: { adminId: true, realName: true } },
        items: { where: { isDeleted: false }, orderBy: { createdAt: 'asc' } }, // 模板→检查项
        operations: { where: { isDeleted: false }, orderBy: { createdAt: 'asc' } }, // 模板→操作项
      },
    });

    if (!template) {
      throw new NotFoundException(`模板配置项 ID ${id} 不存在或已删除`);
    }

    // 解析操作项的JSON字段
    const parsedTemplate = {
      ...template,
      operations: template.operations.map(op => ({
        ...op,
        options: op.options ? JSON.parse(String(op.options)) : null,
      })),
    } as TemplateDetail;

    return parsedTemplate;
  }

  /**
   * 创建模板（关联创建者ID）
   */
  async create(
    createDto: CreateMaintenanceTemplateDto,
    adminId: number,
  ): Promise<MaintenanceTemplate> {
    const now = getCstTimeForPrisma();
    return this.prisma.maintenanceTemplate.create({
      data: {
        ...createDto,
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
      },
      include: {
        creator: { select: { realName: true } },
      },
    });
  }

  /**
   * 更新模板
   */
  async update(
    id: number,
    updateDto: UpdateMaintenanceTemplateDto,
  ): Promise<MaintenanceTemplate> {
    // 先验证模板存在
    await this.findOne(id);

    const now = getCstTimeForPrisma();
    return this.prisma.maintenanceTemplate.update({
      where: { id },
      data: {
        ...updateDto,
        updatedAt: now,
      },
      include: {
        creator: { select: { realName: true } },
      },
    });
  }

  /**
   * 删除模板（级联删除关联的检查项+操作项）
   */
  async remove(id: number): Promise<void> {
    const template = await this.findOne(id); // 验证模板存在
    const now = getCstTimeForPrisma();

    await this.prisma.$transaction(async (tx) => {
      //级联标记检查项为已删除
      const inspectionItemIds = template.items.map(item => item.id);
      if (inspectionItemIds.length > 0) {
        await tx.inspectionItem.updateMany({
          where: { id: { in: inspectionItemIds }, isDeleted: false },
          data: { isDeleted: true, deletedAt: now, updatedAt: now },
        });
      }

      //级联标记操作项为已删除
      await tx.operationItem.updateMany({
        where: { templateId: id, isDeleted: false }, 
        data: { isDeleted: true, deletedAt: now, updatedAt: now },
      });

      //  标记模板为已删除
      await tx.maintenanceTemplate.update({
        where: { id },
        data: { isDeleted: true, deletedAt: now, updatedAt: now },
      });
    });
  }
}