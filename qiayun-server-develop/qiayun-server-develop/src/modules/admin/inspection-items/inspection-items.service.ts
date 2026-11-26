// src/modules/admin/inspection-items/inspection-items.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateInspectionItemDto } from './dto/create-inspection-item.dto';
import { UpdateInspectionItemDto } from './dto/update-inspection-item.dto';
import { InspectionItem, OperationItem, MaintenanceTemplate } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';

// 扩展检查项详情类型：包含关联的模板基础信息
type InspectionItemDetail = InspectionItem & {
  template: Pick<MaintenanceTemplate, 'id' | 'name'>; // 仅保留模板关联
};

@Injectable()
export class InspectionItemsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 验证模板是否存在且未删除
   */
  private async validateTemplate(templateId: number): Promise<void> {
    const template = await this.prisma.maintenanceTemplate.findUnique({
      where: { id: templateId, isDeleted: false },
    });
    if (!template) {
      throw new NotFoundException(`关联的模板 ID ${templateId} 不存在或已删除`);
    }
  }

  /**
   * 模板下的检查项列表
   */
  async findByTemplate(templateId: number): Promise<InspectionItemDetail[]> {
    // 先验证模板存在
    await this.validateTemplate(templateId);

    const items = await this.prisma.inspectionItem.findMany({
      where: { templateId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
      include: {
        template: { select: { id: true, name: true } },
      },
    });

    return items as InspectionItemDetail[]; 
  }

  /**
   * 检查项详情
   */
  async findOne(id: number): Promise<InspectionItemDetail> {
    const item = await this.prisma.inspectionItem.findUnique({
      where: { id, isDeleted: false },
      include: {
        template: { select: { id: true, name: true } },
      },
    });

    if (!item) {
      throw new NotFoundException(`检查项 ID ${id} 不存在或已删除`);
    }
   return item as InspectionItemDetail;
  }

  /**
   * 为模板创建检查项
   */
  async create(
    templateId: number,
    createDto: CreateInspectionItemDto,
    adminId: number, 
  ): Promise<InspectionItemDetail> {
    // 先验证模板存在
    await this.validateTemplate(templateId);

    const now = getCstTimeForPrisma();
    const item = await this.prisma.inspectionItem.create({
      data: {
        ...createDto,
        templateId,
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
      },
      include: {
        template: { select: { id: true, name: true } },
      },
    });

     return item as InspectionItemDetail;
  }

  /**
   * 更新检查项
   */
  async update(
    id: number,
    updateDto: UpdateInspectionItemDto,
  ): Promise<InspectionItemDetail> {
    // 先验证检查项存在
    await this.findOne(id);

    const now = getCstTimeForPrisma();
    const item = await this.prisma.inspectionItem.update({
      where: { id },
      data: {
        ...updateDto,
        updatedAt: now,
      },
      include: {
        template: { select: { id: true, name: true } },
      },
    });

    return item as InspectionItemDetail;
  }

  /**
   * 逻辑删除检查项（级联标记操作项）
   */
  async remove(id: number): Promise<void> {
    // 先验证检查项存在
    await this.findOne(id);

    const now = getCstTimeForPrisma();

    // 级联更新操作项
    await this.prisma.inspectionItem.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      },
    });
  }
}