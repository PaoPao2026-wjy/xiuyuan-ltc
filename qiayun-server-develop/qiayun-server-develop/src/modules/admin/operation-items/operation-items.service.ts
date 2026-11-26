// src/modules/admin/operation-items/operation-items.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOperationItemDto } from './dto/create-operation-item.dto';
import { UpdateOperationItemDto } from './dto/update-operation-item.dto';
import { OperationItem, MaintenanceTemplate } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';

// 扩展操作项详情类型：包含关联的模板基础信息
type OperationItemDetail = OperationItem & {
  template: Pick<MaintenanceTemplate, 'id' | 'name'>; // 关联模板信息
};
@Injectable()
export class OperationItemsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 验证模板是否存在且未删除
   */
  private async validateTemplate(templateId: number): Promise<void> {
    const template = await this.prisma.maintenanceTemplate.findUnique({
      where: { id: templateId, isDeleted: false }, // 模板查询条件
    });
    if (!template) {
      throw new NotFoundException(`关联的模板 ID ${templateId} 不存在或已删除`); // 提示信息更新
    }
  }


  /**
   * 模板下的操作项列表
   */
  async findByTemplate(templateId: number): Promise<OperationItemDetail[]> { 
    // 先验证模板存在
    await this.validateTemplate(templateId);

    const items = await this.prisma.operationItem.findMany({
      where: { templateId, isDeleted: false }, 
      orderBy: { createdAt: 'asc' },
      include: {
        template: { select: { id: true, name: true } }, // 关联模板信息
      },
    });

    // 解析JSON字段
    return items.map(item => ({
      ...item,
      options: item.options ? JSON.parse(String(item.options)) : null,
    })) as OperationItemDetail[];
  }

  /**
   * 操作项详情
   */
  async findOne(id: number): Promise<OperationItemDetail> {
    const item = await this.prisma.operationItem.findUnique({
      where: { id, isDeleted: false },
      include: {
        template: { select: { id: true, name: true } }, 
      },
    });

    if (!item) {
      throw new NotFoundException(`操作项 ID ${id} 不存在或已删除`);
    }

    // 解析JSON字段
    return {
      ...item,
      options: item.options ? JSON.parse(String(item.options)) : null,
    } as OperationItemDetail;
  }


  /**
   * 为模板创建操作项（原检查项创建改为模板创建）
   */
  async create(
    templateId: number, // 参数从 inspectionItemId 改为 templateId
    createDto: CreateOperationItemDto,
    adminId: number,
  ): Promise<OperationItemDetail> {
    // 先验证模板存在
    await this.validateTemplate(templateId);

    const now = getCstTimeForPrisma();
    // 处理options：SELECT类型需要序列化JSON
    const options = createDto.type === 'SELECT' && createDto.options 
      ? JSON.stringify(createDto.options) 
      : null;

    const item = await this.prisma.operationItem.create({
      data: {
        name: createDto.name,
        type: createDto.type,
        options,
        templateId,
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
      },
      include: {
        template: { select: { id: true, name: true } }, 
      },
    });

    // 解析JSON字段返回
    return {
      ...item,
      options: item.options ? JSON.parse(String(item.options)) : null,
    } as OperationItemDetail;
  }


  /**
   * 更新操作项
   */
  async update(
    id: number,
    updateDto: UpdateOperationItemDto,
  ): Promise<OperationItemDetail> {
    // 先验证操作项存在
    await this.findOne(id);

    const now = getCstTimeForPrisma();
    // 处理options：SELECT类型需要序列化JSON，其他类型置空
    const options = updateDto.type === 'SELECT' && updateDto.options
      ? JSON.stringify(updateDto.options)
      : (updateDto.type !== undefined ? null : undefined);

    const item = await this.prisma.operationItem.update({
      where: { id },
      data: {
        ...updateDto,
        ...(options !== undefined && { options }),
        updatedAt: now,
      },
      include: {
        template: { select: { id: true, name: true } }, // 原 inspectionItem 改为 template
      },
    });

    // 解析JSON字段返回
    return {
      ...item,
      options: item.options ? JSON.parse(String(item.options)) : null,
    } as OperationItemDetail;
  }


  /**
   * 逻辑删除操作项
   */
  async remove(id: number): Promise<void> {
    // 先验证操作项存在
    await this.findOne(id);

    const now = getCstTimeForPrisma();
    await this.prisma.operationItem.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      },
    });
  }
}