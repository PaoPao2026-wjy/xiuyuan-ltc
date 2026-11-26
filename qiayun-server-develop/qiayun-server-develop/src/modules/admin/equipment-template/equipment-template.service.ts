// src/modules/admin/equipment-template/equipment-template.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEquipmentTemplateDto } from './dto/create-equipment-template.dto';
import { UpdateEquipmentTemplateDto } from './dto/update-equipment-template.dto';
import { QueryEquipmentTemplateDto } from './dto/query-equipment-template.dto';
import { EquipmentTemplateType, EquipmentType } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';

@Injectable()
export class EquipmentTemplateService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateEquipmentTemplateDto, adminId: number) {
  const { name, type, isDefault } = createDto;

  // if (isDefault) {
  //   // 检查是否已存在默认模板
  //   const existingDefault = await this.prisma.equipmentTemplate.findFirst({
  //     where: { type, isDefault: true, isDeleted: false },
  //   });
  //   if (existingDefault) {
  //     throw new BadRequestException(`类型【${type}】下已存在默认模板【${existingDefault.name}】，无法重复创建,请先取消默认模板`);
  //   }
  // }

  // 用事务确保“取消旧默认 + 创建新模板”的原子性，严格保证同类型只有1个默认模板
  return this.prisma.$transaction(async (tx) => {
    // 若创建默认模板：先强制取消该类型下所有未删除的默认模板
    if (isDefault) {
      // 执行更新（即使没有旧默认模板，此操作也安全）
      const updatedCount = await tx.equipmentTemplate.updateMany({
        where: {
          type,          // 严格匹配当前类型
          isDefault: true, // 只找已标记为默认的
          isDeleted: false // 只处理未删除的模板（与业务逻辑一致）
        },
        data: {
          isDefault: false, // 取消默认状态
          updatedAt: new Date()
        }
      });

      // 可选：打印日志，方便调试（生产环境可删除）
      console.log(`类型【${type}】下已取消 ${updatedCount} 个旧默认模板`);
    }

    const now = getCstTimeForPrisma();

    // 创建新模板（此时同类型已无其他默认模板，可安全创建）
    try {
      return await tx.equipmentTemplate.create({
        data: {
          ...createDto,
          createdBy: adminId,
          createdAt: now,
          updatedAt: now,
          isDeleted: false // 显式标记未删除（与索引约束对齐）
        }
      });
    } catch (error) {
      // 极端情况：若仍触发唯一约束（如并发未被事务完全拦截），给出明确提示
      if (error.code === 'P2002' && error.meta.target.includes('type_is_default_is_deleted')) {
        throw new BadRequestException(`类型【${type}】下已存在默认模板，请刷新后重试`);
      }
      throw error; // 其他错误原样抛出
    }
  });
}

  // 分页查询模板
async findAll(query: QueryEquipmentTemplateDto) {
  const { page, pageSize, type, isDefault } = query;
  const skip = (page - 1) * pageSize;

  // 确保isDefault是布尔值（非布尔值则忽略该条件）
  const whereCondition: any = { isDeleted: false };
  if (type) whereCondition.type = type;
  // 只有当isDefault是布尔值时，才添加该条件
  if (typeof isDefault === 'boolean') {
    whereCondition.isDefault = isDefault;
  }

  const [items, total] = await Promise.all([
    this.prisma.equipmentTemplate.findMany({
      where: whereCondition, // 使用处理后的条件
      skip,
      take: pageSize,
      orderBy: { updatedAt: 'desc' },
      include: { creator: { select: { realName: true } } },
    }),
    this.prisma.equipmentTemplate.count({ where: whereCondition }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

  // 查单个模板
  async findOne(id: number) {
    const template = await this.prisma.equipmentTemplate.findUnique({
      where: { id, isDeleted: false },
    });
    if (!template) throw new NotFoundException('模板不存在');
    return template;
  }

  // 更新模板
  async update(id: number, updateDto: UpdateEquipmentTemplateDto) {
    const now = getCstTimeForPrisma();
    // 使用事务确保“查询当前模板+取消冲突默认模板+更新当前模板”的原子性
  return this.prisma.$transaction(async (tx) => {
    // 先查询当前模板（确保存在且获取当前类型）
    const currentTemplate = await tx.equipmentTemplate.findUnique({
      where: { id, isDeleted: false },
      select: { type: true }, // 只需要当前类型
    });
    if (!currentTemplate) {
      throw new NotFoundException(`设备模板ID【${id}】不存在或已删除`);
    }

    //  确定最终类型（若更新了type则用新类型，否则用旧类型）
    const finalType = updateDto.type ?? currentTemplate.type;


    // 若更新为默认模板，取消“新类型”下其他默认模板（排除当前模板）
    if (updateDto.isDefault) {
      await tx.equipmentTemplate.updateMany({
        where: {
          type: finalType, // 关键：用最终类型（支持类型修改场景）
          isDefault: true,
          id: { not: id }, // 排除当前模板，避免自己取消自己
          isDeleted: false,
        },
        data: { isDefault: false, updatedAt: now },
      });
    }

    // 执行更新
    try {
      return await tx.equipmentTemplate.update({
        where: { id },
        data: {
          ...updateDto,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      // 捕获唯一约束冲突（极端并发场景）
      if (error.code === 'P2002' && error.meta.target.includes('type_is_default_is_deleted')) {
        throw new BadRequestException(`类型【${finalType}】下已存在默认模板，请刷新后重试`);
      }
      throw error;
    }
  });
}

  // 删除模板（逻辑删除）
  async remove(id: number) {
    const template = await this.findOne(id); 

 // 类型映射：将模板类型转换为设备类型
  let equipmentType: EquipmentType;
  switch (template.type) {
    case EquipmentTemplateType.HIGH_VOLTAGE_CABINET:
      equipmentType = EquipmentType.HIGH_VOLTAGE_CABINET;
      break;
    case EquipmentTemplateType.TRANSFORMER:
      equipmentType = EquipmentType.TRANSFORMER;
      break;
    case EquipmentTemplateType.LOW_VOLTAGE_CABINET:
      equipmentType = EquipmentType.LOW_VOLTAGE_CABINET;
      break;
    default:
      throw new BadRequestException(`模板类型【${template.type}】无对应设备类型`);
  }

  // 检查是否有设备使用该类型
  // const equipmentCount = await this.prisma.equipment.count({
  //   where: {
  //     type: { in: [equipmentType] }, // 传入数组格式
  //     isDeleted: false,
  //   },
  // });

    const now = getCstTimeForPrisma();
  // if (equipmentCount > 0) {
  //   throw new BadRequestException(`该模板类型下存在${equipmentCount}个设备，无法删除`);
  // }

    return this.prisma.equipmentTemplate.update({
      where: { id },
      data: { isDeleted: true, deletedAt: now },
    });
  }


  // 根据设备类型查询默认模板
    async getTemplatesListByType(type: EquipmentTemplateType) {
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
      orderBy: { isDefault: 'desc' }, //把默认模板排在前面
    });

    //如果要求至少有一个模板抛异常
    // if (templates.length === 0) {
    //   throw new BadRequestException(`设备类型【${type}】无任何模板，请联系管理员配置`);
    // }

    return templates;
  }
}