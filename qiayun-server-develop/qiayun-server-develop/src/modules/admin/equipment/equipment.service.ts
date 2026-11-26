// src/modules/admin/equipment/equipment.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';
import { EquipmentTemplateType } from '@prisma/client';

@Injectable()
export class AdminEquipmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建设备
   */
  async create(createDto: CreateEquipmentDto) {
   //  校验【设备编号+设备名称+设备类型】组合唯一性
  const existingEquipment = await this.prisma.equipment.findFirst({
    where: {
      equipmentNo: createDto.equipmentNo, // 匹配设备编号
      name: createDto.name,               // 匹配设备名称
      type: createDto.type,               // 匹配设备类型
      isDeleted: false                    // 排除已删除的记录
    }
  });

  if (existingEquipment) {
    throw new BadRequestException(
      `设备编号【${createDto.equipmentNo}】、名称【${createDto.name}】、类型【${createDto.type}】的组合已存在，请修改后重试`
    );
  }
    //校验企业是否存在
    const enterprise = await this.prisma.enterprise.findUnique({
      where: { id: createDto.enterpriseId, isDeleted: false },
    });
    if (!enterprise) {
      throw new BadRequestException(`企业ID【${createDto.enterpriseId}】不存在`);
    }

    //  校验设备类型对应的模板是否存在（确保参数结构合法）
    // const template = await this.prisma.equipmentTemplate.findFirst({
    //   where: { type: createDto.type, isDeleted: false },
    // });
    // if (!template) {
    //   throw new BadRequestException(`设备类型【${createDto.type}】无对应模板，请先创建模板`);
    // }

     const now = getCstTimeForPrisma();
    // 创建设备
    return this.prisma.equipment.create({
      data: {
        ...createDto,
        manufactureDate: createDto.manufactureDate ? new Date(createDto.manufactureDate) : null,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  /**
   * 分页查询设备
   */
  async findAll(query: QueryEquipmentDto) {
    const { page, pageSize, type, enterpriseId, keyword } = query;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = { isDeleted: false };
    if (type) where.type = type;
    if (enterpriseId) where.enterpriseId = enterpriseId;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword} }, // 模糊匹配名称
        { equipmentNo: { contains: keyword} }, // 模糊匹配编号
      ];
    }

    // 执行查询
    const [items, total] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          enterprise: { select: { id: true, enterpriseName: true } }, // 关联企业信息
        },
      }),
      this.prisma.equipment.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 查询单个设备
   */
  async findOne(id: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id, isDeleted: false },
      include: {
        enterprise: { select: { enterpriseName: true, enterpriseAddress: true } },
      },
    });
    if (!equipment) {
      throw new NotFoundException(`设备ID【${id}】不存在`);
    }
    return equipment;
  }

  /**
   * 更新设备
   */
  async update(id: number, updateDto: UpdateEquipmentDto) {
    // 校验设备是否存在
    await this.findOne(id);

     const now = getCstTimeForPrisma();
    //若更新设备编号，需校验唯一性
    if (updateDto.equipmentNo) {
      const existingNo = await this.prisma.equipment.findFirst({
        where: {
          equipmentNo: updateDto.equipmentNo,
          type: updateDto.type, // 确保类型匹配
          name: updateDto.name, // 确保名称匹配 
          id: { not: id }, // 排除当前设备
          isDeleted: false,
        },
      });
      if (existingNo) {
        throw new BadRequestException(`设备编号【${updateDto.equipmentNo}】已存在`);
      }
    }

    // 若更新企业ID，校验企业存在性
    if (updateDto.enterpriseId) {
      const enterprise = await this.prisma.enterprise.findUnique({
        where: { id: updateDto.enterpriseId, isDeleted: false },
      });
      if (!enterprise) {
        throw new BadRequestException(`企业ID【${updateDto.enterpriseId}】不存在`);
      }
    }

    return this.prisma.equipment.update({
      where: { id },
      data: { ...updateDto, manufactureDate: updateDto.manufactureDate ? new Date(updateDto.manufactureDate) : null,   updatedAt: now },
    });
  }

  /**
   * 删除设备（后台管理员，逻辑删除）
   */
  async remove(id: number) {
    //  校验设备是否存在
    await this.findOne(id);

     const now = getCstTimeForPrisma();
    // 校验是否有未完成的工单关联该设备
    // const workOrderCount = await this.prisma.workOrder.count({
    //   where: {
    //     equipmentId: id,
    //     status: { notIn: ['COMPLETED', 'CANCELLED'] }, // 未完成的工单
    //     isDeleted: false,
    //   },
    // });
    // if (workOrderCount > 0) {
    //   throw new BadRequestException(`设备存在【${workOrderCount}】个未完成工单，无法删除`);
    // }
    return this.prisma.equipment.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      },
    });
  }
}