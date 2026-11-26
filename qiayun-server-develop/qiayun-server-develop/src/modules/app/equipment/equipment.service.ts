// src/modules/app/equipment/equipment.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { UpdateEquipmentDto } from 'src/modules/admin/equipment/dto/update-equipment.dto';
import { EquipmentTemplateType } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';


@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  // 企业创建设备
  async create(createDto: CreateEquipmentDto, enterpriseId: number) {
    const { equipmentNo, type } = createDto;
    const now = getCstTimeForPrisma();

    // 用事务包裹所有操作，确保原子性
    return this.prisma.$transaction(async (tx) => {
      //  唯一性校验：同一企业下设备编号+类型不能重复
      const existNo = await tx.equipment.findFirst({
        where: {
          equipmentNo,
          type,
          enterpriseId, // 新增：限定当前企业
          isDeleted: false,
        },
      });
      if (existNo) {
        throw new BadRequestException(`当前企业下设备编号【${equipmentNo}】已存在，请更换编号后重试`);
      }

      // 校验企业是否存在
      const enterprise = await tx.enterprise.findUnique({
        where: { id: enterpriseId, isDeleted: false },
      });
      if (!enterprise) {
        throw new BadRequestException(`企业ID【${enterpriseId}】不存在或已删除`);
      }

      //  校验设备模板
      // const template = await tx.equipmentTemplate.findFirst({
      //   where: { type, isDefault: true, isDeleted: false },
      // });
      // if (!template) {
      //   throw new BadRequestException(`设备类型【${type}】无默认模板，请联系管理员`);
      // }

      //创建设备
      return tx.equipment.create({
        data: {
          ...createDto,
          enterpriseId, // 关联当前企业
          createdAt: now,
          updatedAt: now,
        },
      });
    });
  }

  // 分页查询当前企业的设备
  async findMyEquipments(query: QueryEquipmentDto, enterpriseId: number) {
    const { page, pageSize, type } = query;
    const skip = (page - 1) * pageSize;

    // 构建查询条件：限定当前企业 + 未删除
    const where = {
      enterpriseId, // 核心：按企业ID查询
      type, // 可选：按设备类型筛选
      isDeleted: false,
    };

    const [items, total] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          enterprise: { select: { enterpriseName: true, enterpriseAddress: true } }, // 关联企业详情
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
  async findOne(id: number, enterpriseId: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id, isDeleted: false },
      include: {
        enterprise: { select: { enterpriseName: true, enterpriseAddress: true } },
      },
    });

    //  校验设备存在
    if (!equipment) {
      throw new NotFoundException(`设备ID【${id}】不存在`);
    }

    // 校验设备归属当前企业
    if (equipment.enterpriseId !== enterpriseId) {
      throw new BadRequestException(`无权限查询设备ID【${id}】（非当前企业设备）`);
    }

    return equipment;
  }

  /**
   * 更新设备
   */
  async update(enterpriseId: number, id: number, updateDto: UpdateEquipmentDto) {
    // 校验设备存在 + 归属当前企业
    const equipment = await this.findOne(id, enterpriseId); 
    const now = getCstTimeForPrisma(); 

    //若更新设备编号，校验当前企业下唯一性
    if (updateDto.equipmentNo) {
      const existingNo = await this.prisma.equipment.findFirst({
        where: {
          equipmentNo: updateDto.equipmentNo,
          type: updateDto.type || equipment.type, 
          enterpriseId, // 限定当前企业
          id: { not: id }, // 排除当前设备
          isDeleted: false,
        },
      });
      if (existingNo) {
        throw new BadRequestException(`当前企业下设备编号【${updateDto.equipmentNo}】已存在`);
      }
    }

    // 更新企业ID（一般不允许），校验目标企业存在
    if (updateDto.enterpriseId && updateDto.enterpriseId !== enterpriseId) {
      const targetEnterprise = await this.prisma.enterprise.findUnique({
        where: { id: updateDto.enterpriseId, isDeleted: false },
      });
      if (!targetEnterprise) {
        throw new BadRequestException(`目标企业ID【${updateDto.enterpriseId}】不存在`);
      }
    }

    //  更新设备
    return this.prisma.equipment.update({
      where: { id },
      data: { ...updateDto, updatedAt: now },
    });
  }

  // 根据设备类型查询默认模板
    async getTemplatesByType(type: EquipmentTemplateType) {
    const templates = await this.prisma.equipmentTemplate.findMany({
      where: {
        type,
        isDeleted: false, // 只查未删除的
      },
      select: {
        id: true,
        name: true,
        type: true,
        isDefault: true,
        defaultStructure: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { isDefault: 'desc' }, // 把默认模板排在前面
    });

    // //如果要求至少有一个模板抛异常
    // if (templates.length === 0) {
    //   throw new BadRequestException(`设备类型【${type}】无任何模板，请联系管理员配置`);
    // }

    return templates;
  }
}