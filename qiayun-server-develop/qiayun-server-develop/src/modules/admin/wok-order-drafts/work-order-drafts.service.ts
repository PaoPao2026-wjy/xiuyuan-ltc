import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateWorkOrderDraftDto } from './dto/create-work-order-draft.dto';
import { UpdateWorkOrderDraftDto } from './dto/update-work-order-draft.dto';
import { FindWorkOrderDraftsDto } from './dto/find-work-order-drafts.dto';
import { WorkOrderDraft, WorkOrderDraftStatus, WorkOrder, WorkOrderStatus, Prisma } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';
import { generateWorkOrderNo } from 'src/common/utils/order-no.util';

@Injectable()
export class WorkOrderDraftsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建工单草稿
   * @param createDto 草稿信息
   * @param adminId 创建者ID（管理员）
   */ 
async create(
  createDto: CreateWorkOrderDraftDto,
  adminId: number, // 当前登录管理员ID
): Promise<WorkOrderDraft> {
  const enterprise = await this.prisma.enterprise.findUnique({
    where: { id: createDto.enterpriseId },
  });
  if (!enterprise) {
    throw new BadRequestException(`关联的企业（ID: ${createDto.enterpriseId}）不存在，请检查企业ID`);
  }

  // 解构排除所有关联/冲突字段
  const { 
    enterpriseId, 
    workOrderId, // 创建草稿时无关联工单，排除
    ...restDto 
  } = createDto;
  
  const now = getCstTimeForPrisma();

  // JSON 字段直接传原始值
  const specialRequirements = createDto.specialRequirements || null;
  const images = createDto.images || null;
  const selectedTemplateItems = createDto.selectedTemplateItems || null;

  //  时间字段转换为 Date 类型
  const plannedStartTime = createDto.plannedStartTime
    ? new Date(createDto.plannedStartTime)
    : null;
  const plannedEndTime = createDto.plannedEndTime
    ? new Date(createDto.plannedEndTime)
    : null;

  return this.prisma.workOrderDraft.create({
    data: {
      ...restDto,
      // JSON 字段
      specialRequirements,
      images,
      selectedTemplateItems,
      // 时间字段
      plannedStartTime,
      plannedEndTime,
      // 草稿状态：直接用枚举的字符串值（匹配 Prisma 生成的枚举）
      draftStatus: "PENDING_SUBMIT", 
      // 企业联系人字段
      enterpriseContactName: createDto.enterpriseContactName,
      enterpriseContactPhone: createDto.enterpriseContactPhone,
      // 关联企业（外键自动赋值 enterpriseId）
      enterprise: {
        connect: { id: enterpriseId },
      },
      // 关联创建者（外键 createdBy 由 Prisma 自动赋值为 adminId）
      creator: {
        connect: { adminId: adminId },
      },
      // 时间字段（模型默认值可覆盖，也可依赖默认值）
      createdAt: now,
      updatedAt: now,
    },
    include: {
      enterprise: { select: { id: true, enterpriseName: true } },
      creator: { select: { adminId: true, realName: true } },
    },
  });
}



  /**
   * 草稿分页查询
   */
async findAllWithPagination(
  queryDto: FindWorkOrderDraftsDto,
): Promise<{
  list: WorkOrderDraft[];
  pagination: { total: number; page: number; pageSize: number; pages: number };
}> {
  const { 
    page, pageSize, type, draftStatus, priority,
    keyword, startDate, endDate 
  } = queryDto;
  const skip = (page - 1) * pageSize;

  const where: Prisma.WorkOrderDraftWhereInput = {
    isDeleted: false, // 基础条件：未删除
  };

  // 分步构建查询条件
  //  工单类型筛选
  if (type) {
    where.type = type;
  }
  //  草稿状态筛选
  if (draftStatus) {
    where.draftStatus = draftStatus;
  }
  //  优先级筛选
  if (priority) {
    where.priority = priority;
  }

  //  日期范围过滤（安全处理+空值校验）
  const createdAtConditions: Prisma.DateTimeFilter = {};
  if (startDate) {
    const startDateObj = new Date(startDate);
    // 校验日期是否有效
    if (!isNaN(startDateObj.getTime())) {
      createdAtConditions.gte = startDateObj;
    }
  }
  if (endDate) {
    const endDateObj = new Date(endDate);
    if (!isNaN(endDateObj.getTime())) {
      createdAtConditions.lte = endDateObj;
    }
  }
  // 有有效日期条件时才赋值
  if (Object.keys(createdAtConditions).length > 0) {
    where.createdAt = createdAtConditions;
  }

  //关键词搜索（安全构建OR条件）
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    where.OR = [
      { title: { contains: lowerKeyword } },
      { 
        enterprise: { 
          enterpriseName: { contains: lowerKeyword },
          isDeleted: false 
        } 
      },
    ];
  }

  // 并行查询
  const [list, total] = await Promise.all([
    this.prisma.workOrderDraft.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        enterprise: { select: { id: true, enterpriseName: true } },
        creator: { select: { realName: true } },
      },
    }),
    this.prisma.workOrderDraft.count({ where }),
  ]);

  const parsedList = list.map(draft => {
    // 通用安全解析函数
    const safeParse = (value: unknown) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.warn('JSON解析失败', e);
          return value;
        }
      }
      return value;
    };

    return {
      ...draft,
      specialRequirements: safeParse(draft.specialRequirements),
      images: safeParse(draft.images),
      selectedTemplateItems: safeParse(draft.selectedTemplateItems),
    };
  });

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
   * 获取草稿详情
   */
 async findOne(id: number): Promise<WorkOrderDraft> {
  const draft = await this.prisma.workOrderDraft.findUnique({
    where: { id, isDeleted: false},
    include: {
      enterprise: {
        select: { id: true, enterpriseName: true, enterpriseAddress: true, contactName: true, contactPhone: true },
      },
      creator: { select: { adminId: true, realName: true } },
      workOrder: { select: { id: true, status: true, createdAt: true } }, // 关联已生成的工单
    },
  });

  if (!draft) {
    throw new NotFoundException(`工单草稿 ID ${id} 不存在`);
  }

  // 解析所有JSON字段
  return {
    ...draft,
    // specialRequirements: draft.specialRequirements 
    //   ? JSON.parse(String(draft.specialRequirements))
    //   : null,
    // images: draft.images 
    //   ? JSON.parse(String(draft.images))
    //   : null,
    // selectedTemplateItems: draft.selectedTemplateItems 
    //   ? JSON.parse(String(draft.selectedTemplateItems))
    //   : null,
  };
}

  /**
   * 编辑草稿（仅允许待提交状态）
   */
async update(
  id: number,
  updateDto: UpdateWorkOrderDraftDto,
): Promise<WorkOrderDraft> {
  // 检查草稿是否存在且状态合法
  const draft = await this.prisma.workOrderDraft.findUnique({
    where: { id, isDeleted: false },
    select: { draftStatus: true },
  });

  if (!draft) {
    throw new NotFoundException(`工单草稿 ID ${id} 不存在`);
  }
  if (draft.draftStatus !== WorkOrderDraftStatus.PENDING_SUBMIT) {
    throw new BadRequestException('仅“待提交”状态的草稿可编辑');
  }

  // 补充JSON字段序列化
  // const specialRequirements = updateDto.specialRequirements
  //   ? JSON.stringify(updateDto.specialRequirements)
  //   : undefined;
  // const images = updateDto.images
  //   ? JSON.stringify(updateDto.images)
  //   : undefined;
  // const selectedTemplateItems = updateDto.selectedTemplateItems
  //   ? JSON.stringify(updateDto.selectedTemplateItems)
  //   : undefined;


  // 时间字段转换
  const plannedStartTime = updateDto.plannedStartTime
    ? new Date(updateDto.plannedStartTime)
    : undefined;
  const plannedEndTime = updateDto.plannedEndTime
    ? new Date(updateDto.plannedEndTime)
    : undefined;

  return this.prisma.workOrderDraft.update({
    where: { id },
    data: {
      ...updateDto,
      ...(plannedStartTime && { plannedStartTime }), // 新增：时间转换
      ...(plannedEndTime && { plannedEndTime }), // 新增：时间转换
      updatedAt: getCstTimeForPrisma(),
    },
    include: {
      enterprise: { select: { id: true, enterpriseName: true } },
    },
  });
}

  /**
   * 删除草稿（仅允许待提交状态）
   */
 async remove(id: number): Promise<void> {
    const draft = await this.prisma.workOrderDraft.findUnique({
      where: { id, isDeleted: false }, // 过滤已删除
      select: { draftStatus: true },
    });

    if (!draft) {
      throw new NotFoundException(`工单草稿 ID ${id} 不存在或已删除`);
    }
    if (draft.draftStatus !== WorkOrderDraftStatus.PENDING_SUBMIT) {
      throw new BadRequestException('仅“待提交”状态的草稿可删除');
    }

    const now = getCstTimeForPrisma();
    await this.prisma.workOrderDraft.update({
      where: { id },
      data: {
        isDeleted: true, 
        deletedAt: now,  
        updatedAt: now,
      },
    });
  }

  /**
   * 作废草稿（状态改为INVALID，不可生成工单）
   */
   async invalidate(id: number): Promise<WorkOrderDraft> {
    const draft = await this.prisma.workOrderDraft.findUnique({
      where: { id, isDeleted: false }, // 过滤已删除
      select: { draftStatus: true, workOrderId: true },
    });

    if (!draft) {
      throw new NotFoundException(`工单草稿 ID ${id} 不存在或已删除`);
    }
    if (draft.workOrderId) {
      throw new BadRequestException('已生成工单的草稿不可作废');
    }
    if (draft.draftStatus === WorkOrderDraftStatus.INVALID) {
      throw new BadRequestException('草稿已作废');
    }

    const now = getCstTimeForPrisma();
    return this.prisma.workOrderDraft.update({
      where: { id },
      data: {
        draftStatus: WorkOrderDraftStatus.INVALID,
        updatedAt: now,
      },
    });
  }

  /**
   * 确认生成工单（从草稿创建正式工单）
   */
  async generateWorkOrder(id: number, adminId: number): Promise<{
    draft: WorkOrderDraft;
    workOrder: WorkOrder;
  }> {
    const now = getCstTimeForPrisma();
    const currentDate = new Date();
    // 检查草稿状态
    const draft = await this.prisma.workOrderDraft.findUnique({
      where: { id },
      include: { workOrder: true },
    });

    if (!draft) {
      throw new NotFoundException(`工单草稿 ID ${id} 不存在`);
    }
    if (draft.draftStatus !== WorkOrderDraftStatus.PENDING_SUBMIT) {
      throw new BadRequestException('仅“待提交”状态的草稿可生成工单');
    }
    if (draft.workOrder) {
      throw new BadRequestException('该草稿已生成工单');
    }

     //生成工单号（WO+YYYYMMDD+3位自增序号）
  // const dateStr = currentDate.getFullYear() + 
  //   String(currentDate.getMonth() + 1).padStart(2, '0') + 
  //   String(currentDate.getDate()).padStart(2, '0'); // 格式：YYYYMMDD
  // const prefix = `WO${dateStr}`; 

  // // 查询当天最大工单号（获取最新序号）
  // const maxOrderNo = await this.prisma.workOrder.findFirst({
  //   where: {
  //     orderNo: { startsWith: prefix }, // 匹配当天工单号
  //   },
  //   orderBy: { orderNo: 'desc' }, // 按工单号降序，取最大的
  //   select: { orderNo: true },
  // });

  // // 计算新序号（默认001，最大序号+1）
  // let newSeq = 1;
  // if (maxOrderNo) {
  //   // 提取序号：如 WO20251011001 → 提取 001 → 转为数字 1 → +1 得 2
  //   const seqStr = maxOrderNo.orderNo.slice(prefix.length); // 截取前缀后的部分
  //   newSeq = parseInt(seqStr, 10) + 1;
  // }
  // // 序号补0（确保6位，如 2 → 002）
  // const seqStr = String(newSeq).padStart(6, '0');
  // const orderNo = `${prefix}${seqStr}`; // 最终工单号：WO20251011002

 const orderNo = generateWorkOrderNo();
    // 事务：创建工单 + 更新草稿状态
    return this.prisma.$transaction(async (tx) => {
      // 创建正式工单（复制草稿核心字段）
      const workOrder = await tx.workOrder.create({
        data: {
          orderNo, // 工单号
          title: draft.title,
          type: draft.type,
          estimatedHours: draft.estimatedHours,
          priority: draft.priority,
          enterpriseId: draft.enterpriseId,
          contactPhone: draft.contactPhone,
          workAddress: draft.workAddress,
          descriptionType: draft.descriptionType,
          customDescription: draft.customDescription,
          selectedTemplateItems: draft.selectedTemplateItems,
          specificRequirements: draft.specificRequirements,
          plannedStartTime: draft.plannedStartTime,
          plannedEndTime: draft.plannedEndTime,
          specialRequirements: draft.specialRequirements, // 复用草稿的JSON字段
          images: draft.images,
          remarks: draft.remarks,
          status: WorkOrderStatus.PENDING_ACCEPTANCE, // 工单初始状态为待接单
          createdBy: adminId,
          draftId: id, // 关联草稿ID
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        },
      });

      // 更新草稿状态为“已生成”
      const updatedDraft = await tx.workOrderDraft.update({
        where: { id },
        data: {
          draftStatus: WorkOrderDraftStatus.GENERATED,
          workOrderId: workOrder.id,
          updatedAt: now,
        },
      });

      return { draft: updatedDraft, workOrder };
    });
  }
}