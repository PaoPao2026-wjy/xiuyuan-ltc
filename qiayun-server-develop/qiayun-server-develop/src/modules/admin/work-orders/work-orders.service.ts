import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { FindWorkOrdersDto } from './dto/find-work-orders.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { WorkOrder, WorkOrderAssignment, WorkOrderAssignmentStatus, WorkOrderStatus, WorkOrderTechnician, WorkOrderDispatchStatus, CreatedSource, Prisma, TechnicianWorkOrderStatus } from '@prisma/client';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';
import { v4 as uuidv4 } from 'uuid'
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { generateWorkOrderNo } from 'src/common/utils/order-no.util';

type SimplifiedWorkOrder = {
  id: number;
  orderNo: string;
  status: WorkOrderStatus;
};

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 工单分页查询
   */
  async findAllWithPagination(
    queryDto: FindWorkOrdersDto,
  ): Promise<{
    list: WorkOrder[];
    pagination: { total: number; page: number; pageSize: number; pages: number };
  }> {
    const { 
      page, pageSize, type, status, priority, 
      enterpriseId, keyword, orderNo, startDate, endDate, dispatchStatus, createdSource
    } = queryDto;
    const skip = (page - 1) * pageSize;

    // 构建查询条件（类型安全）
    const where: Prisma.WorkOrderWhereInput = {
      isDeleted: false,
    };

    // 分步构建条件，避免Spread错误
    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (enterpriseId) where.enterpriseId = enterpriseId;
    if (dispatchStatus) where.dispatchStatus = dispatchStatus;
    if (createdSource) where.createdSource = createdSource;

    // 工单号搜索（不区分大小写）
    if (orderNo) {
      where.orderNo = { contains: orderNo};
    }

    // 日期范围过滤（安全处理）
    const createdAtConditions: Prisma.DateTimeFilter = {};
    if (startDate) {
      const startDateObj = new Date(startDate);
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
    if (Object.keys(createdAtConditions).length > 0) {
      where.createdAt = createdAtConditions;
    }

    // 关键词搜索（标题/企业名）
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
      this.prisma.workOrder.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          enterprise: { select: { id: true, enterpriseName: true } },
          creator: { select: { realName: true } },
          draft: { select: { id: true, draftStatus: true }, where: { isDeleted: false } },
        },
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    // 解析JSON字段（Prisma Json类型直接返回原始值）
    const parsedList = list.map(order => ({
      ...order,
      specialRequirements: order.specialRequirements || null,
      images: order.images || null,
      selectedTemplateItems: order.selectedTemplateItems || null,
    }));

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
   * 获取工单详情
   */
  async findOne(id: number): Promise<WorkOrder & {
    assignments?: WorkOrderAssignment[];
  }> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id, isDeleted: false },
      include: {
        enterprise: {
          select: { id: true, enterpriseName: true, enterpriseAddress: true },
        },
        creator: { select: { adminId: true, realName: true } },
        draft: { select: { id: true, draftStatus: true, title: true } },
        assignments: {
          include: {
            technician: { select: { technicianId: true, realName: true, phone: true } },
            assigner: { select: { realName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        workOrderTechnicians: {
          include: {
            technician: { 
              select: { 
                technicianId: true, 
                realName: true, 
                phone: true,
              } 
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException(`工单 ID ${id} 不存在`);
    }

    // 解析JSON字段（直接返回原始值）
    return {
      ...workOrder,
      specialRequirements: workOrder.specialRequirements || null,
      images: workOrder.images || null,
      selectedTemplateItems: workOrder.selectedTemplateItems || null,
    };
  }

  /**
   * 编辑工单
   */
  async update(
    id: number,
    updateDto: UpdateWorkOrderDto,
  ): Promise<WorkOrder> {
    // 检查工单是否存在
    await this.findOne(id);

    // Prisma Json类型直接传数组，无需序列化
    const updateData: Prisma.WorkOrderUpdateInput = {
      ...updateDto,
      updatedAt: getCstTimeForPrisma(),
    };

    // 处理日期字段转换
    if (updateDto.plannedStartTime) {
      updateData.plannedStartTime = new Date(updateDto.plannedStartTime);
    }
    if (updateDto.plannedEndTime) {
      updateData.plannedEndTime = new Date(updateDto.plannedEndTime);
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        enterprise: { select: { id: true, enterpriseName: true } },
      },
    });
  }

  /**
   * 指派工程师（创建指派记录）
   */
  async assignTechnician(
    id: number,
    assignDto: AssignTechnicianDto,
    adminId: number,
  ): Promise<WorkOrderAssignment> {
    const now = getCstTimeForPrisma();
    // 检查工单和电工是否存在
    const [workOrder, technician] = await Promise.all([
      this.prisma.workOrder.findUnique({ where: { id, isDeleted: false } }),
      this.prisma.technician.findUnique({ where: { technicianId: assignDto.technicianId, isDeleted: false } }),
    ]);

    if (!workOrder) {
      throw new NotFoundException(`工单 ID ${id} 不存在`);
    }
    if (!technician) {
      throw new NotFoundException(`电工 ID ${assignDto.technicianId} 不存在`);
    }

    // 创建指派记录
    return this.prisma.workOrderAssignment.create({
      data: {
        workOrderId: id,
        technicianId: assignDto.technicianId,
        status: WorkOrderAssignmentStatus.PENDING,
        assignedBy: adminId,
        remark: assignDto.remark,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      },
      include: {
        technician: { select: { technicianId: true, realName: true, phone: true, workStatus: true } },
        assigner: { select: { realName: true } },
      },
    });
  }

  /**
   * 工单逻辑删除
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    const now = getCstTimeForPrisma();

    await this.prisma.workOrder.update({
      where: { id }, 
      data: {
        isDeleted: true, 
        deletedAt: now,  
        updatedAt: now, 
        assignments: {
          updateMany: {
            where: { isDeleted: false },
            data: {
              isDeleted: true,
              deletedAt: now,
              updatedAt: now,
            },
          },
        },
      },
    });
  }

  /**
   * 按状态统计工单数量
   */
  async countWorkOrdersByStatus() {
    // 统计总工单数
    const total = await this.prisma.workOrder.count({
      where: { isDeleted: false },
    });

    // 匹配Prisma模型的状态枚举
    const pendingReview = await this.prisma.workOrder.count({
      where: { status: WorkOrderStatus.PENDING_REVIEW, isDeleted: false },
    });
    const reviewRejected = await this.prisma.workOrder.count({
      where: { status: WorkOrderStatus.REVIEW_REJECTED, isDeleted: false },
    });
    const pendingAcceptance = await this.prisma.workOrder.count({
      where: { status: WorkOrderStatus.PENDING_ACCEPTANCE, isDeleted: false },
    });
    const inProgress = await this.prisma.workOrder.count({
      where: { status: WorkOrderStatus.IN_PROGRESS, isDeleted: false },
    });
    const completed = await this.prisma.workOrder.count({
      where: { status: WorkOrderStatus.COMPLETED, isDeleted: false },
    });
    const rejected = await this.prisma.workOrder.count({
      where: { status: WorkOrderStatus.REJECTED, isDeleted: false },
    });
    const cancelled = await this.prisma.workOrder.count({
      where: { status: WorkOrderStatus.CANCELLED, isDeleted: false },
    });

    return {
      total,
      pendingReview,      // 待审核
      reviewRejected,     // 审核拒绝
      pendingAcceptance,  // 待接单
      inProgress,         // 处理中
      completed,          // 已完成
      rejected,           // 已拒绝
      cancelled           // 已取消
    };
  }

  /**
   * 新增工单
   */
  async create(
    createDto: CreateWorkOrderDto,
    adminId: number,
  ): Promise<WorkOrder> {
    const now = getCstTimeForPrisma();
    // 校验关联企业
    const enterprise = await this.prisma.enterprise.findUnique({
      where: { id: createDto.enterpriseId, isDeleted: false },
    });
    if (!enterprise) {
      throw new NotFoundException(`关联企业 ID ${createDto.enterpriseId} 不存在或已删除`);
    }

    // 校验草稿
    let draftCheck = null;
    if (createDto.draftId) {
      draftCheck = await this.prisma.workOrderDraft.findUnique({
        where: { id: createDto.draftId, isDeleted: false },
      });
      if (!draftCheck) {
        throw new NotFoundException(`关联草稿 ID ${createDto.draftId} 不存在或已删除`);
      }
    }

    // 生成工单号
    const orderNo = generateWorkOrderNo();

    // 构建创建数据（匹配Prisma模型）
    const workOrderData: Prisma.WorkOrderCreateInput = {
      title: createDto.title,
      type: createDto.type,
      priority: createDto.priority || 'NORMAL',
      estimatedHours: createDto.estimatedHours,
      contactPhone: createDto.contactPhone,
      contactName: createDto.contactName,
      workAddress: createDto.workAddress,
      descriptionType: createDto.descriptionType,
      customDescription: createDto.customDescription,
      specificRequirements: createDto.specificRequirements,
      specialRequirements: createDto.specialRequirements || null,
      remarks: createDto.remarks,
      selectedTemplateItems: createDto.selectedTemplateItems || null,
      images: createDto.images || null,
      // 关联字段
      enterprise: { connect: { id: createDto.enterpriseId } },
      creator: { connect: { adminId } },
      ...(createDto.draftId && { draft: { connect: { id: createDto.draftId } } }),
      // 核心：匹配Prisma模型的状态枚举
      orderNo,
      status: WorkOrderStatus.PENDING_ACCEPTANCE,
      dispatchStatus: WorkOrderDispatchStatus.UNASSIGNED,
      createdSource: CreatedSource.ADMIN,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      // 日期字段转换
      ...(createDto.plannedStartTime && {
        plannedStartTime: new Date(createDto.plannedStartTime),
      }),
      ...(createDto.plannedEndTime && {
        plannedEndTime: new Date(createDto.plannedEndTime),
      }),
    };

    return this.prisma.workOrder.create({
      data: workOrderData,
      include: {
        enterprise: { select: { id: true, enterpriseName: true } },
        creator: { select: { adminId: true, realName: true } },
        ...(createDto.draftId && {
          draft: { select: { id: true, draftStatus: true } },
        }),
      },
    });
  }

  /**
   * 指派工程师并自动接单
   */
  async assignTechnicianAutoAccept(
    id: number,
    assignDto: AssignTechnicianDto,
    adminId: number,
  ): Promise<{
    assignment: WorkOrderAssignment;
    workOrder: SimplifiedWorkOrder;
    technicianRecord: WorkOrderTechnician;
  }> {
    const now = getCstTimeForPrisma();

    return this.prisma.$transaction(async (tx) => {
      // 校验工单、电工
      const [workOrder, technician] = await Promise.all([
        tx.workOrder.findUnique({ where: { id, isDeleted: false } }),
        tx.technician.findUnique({ 
          where: { technicianId: assignDto.technicianId, isDeleted: false } 
        }),
      ]);

      if (!workOrder) {
        throw new NotFoundException(`工单 ID ${id} 不存在`);
      }
      if (!technician) {
        throw new NotFoundException(`电工 ID ${assignDto.technicianId} 不存在`);
      }

      // 校验工单状态
      const invalidStatuses: WorkOrderStatus[] = [
        WorkOrderStatus.CANCELLED, 
        WorkOrderStatus.COMPLETED,
        WorkOrderStatus.REVIEW_REJECTED
      ];
      if (invalidStatuses.includes(workOrder.status)) {
        throw new BadRequestException(`当前工单状态【${workOrder.status}】不允许指派`);
      }

      // 创建指派记录
      const assignment = await tx.workOrderAssignment.create({
        data: {
          workOrderId: id,
          technicianId: assignDto.technicianId,
          status: WorkOrderAssignmentStatus.ACCEPTED,
          assignedBy: adminId,
          remark: assignDto.remark,
          handledAt: now,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        },
        include: {
          technician: { select: { technicianId: true, realName: true, phone: true, workStatus: true } },
          assigner: { select: { realName: true } },
        },
      });

      // 创建电工处理记录
      const technicianRecord = await tx.workOrderTechnician.create({
        data: {
          workOrderId: id,
          technicianId: assignDto.technicianId,
          processingStatus: TechnicianWorkOrderStatus.NOT_STARTED, // 电工工单未开始
          startTime: now,
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
          processingResult: null,
          processingImages: null,
          processingVideos: null
        },
        include: {
          technician: { select: { realName: true, phone: true } }
        }
      });

       // 更新电工表的 totalOrders 字段（自增1）
     await tx.technician.update({
        where: { technicianId: assignDto.technicianId }, // 按电工ID更新
        data: {
          totalOrders: { increment: 1 }, // 工单总数自增1
          updatedAt: now, // 更新电工信息的最后修改时间
        },
      });
      // 更新工单状态
      const updatedWorkOrder = await tx.workOrder.update({
        where: { id },
        data: {
          status: WorkOrderStatus.IN_PROGRESS,
          dispatchStatus: WorkOrderDispatchStatus.ASSIGNED,
          lastAssignedAt: now,
          totalAssignedTechnicians: { increment: 1 },
          updatedAt: now,
        },
        select: { id: true, status: true, orderNo: true },
      });

      return { assignment, workOrder: updatedWorkOrder, technicianRecord };
    });
  }
}