// src/modules/mini-app/work-order/services/enterprise-work-order.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EnterpriseWorkOrderListDto } from './dto/enterprise-work-order-list.dto';
import { PublishWorkOrderDto } from './dto/publish-work-order.dto';
import { RepublishWorkOrderDto } from './dto/republish-work-order.dto';
import { WorkOrderStatus, WorkOrderDispatchStatus,RealAuthStatus, WorkOrderType, CreatedSource } from '@prisma/client';
import { WORK_ORDER_STATUS_MAP } from '../work-order/constants/work-order.constant';
import { generateWorkOrderNo } from 'src/common/utils/order-no.util';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';

@Injectable()
export class EnterpriseWorkOrderService {
  constructor(private prisma: PrismaService) {}

  /**
   * 企业查询自身发布的工单列表（分页）
   * @param enterpriseId 企业ID（从token/上下文获取）
   * @param dto 分页+筛选参数
   */
  async getEnterpriseWorkOrders(enterpriseId: number, dto: EnterpriseWorkOrderListDto) {
    const { page, pageSize, status, keyword } = dto;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 构建查询条件：仅查询自身企业、未删除的工单
    const where: any = {
      enterpriseId,
      isDeleted: false,
    };

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 关键词筛选（标题/工单编号）
    if (keyword) {
      where.OR = [
        { title: { contains: keyword} },
        { orderNo: { contains: keyword} },
      ];
    }

    // 分页查询+总数统计
    const [list, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNo: true,
          title: true,
          type: true,
          status: true,
          priority: true,
          estimatedHours: true,
          workAddress: true,
          plannedStartTime: true,
          plannedEndTime: true,
          createdAt: true,
          updatedAt: true,
          rejectReason: true, // 审核失败原因
        },
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    // 格式化返回数据
    const formattedList = list.map((item) => ({
      workOrderId: item.id,
      orderNo: item.orderNo,
      title: item.title,
      type: item.type,
      status: item.status,
      statusText: WORK_ORDER_STATUS_MAP[item.status],
      priority: item.priority,
      estimatedHours: item.estimatedHours,
      workAddress: item.workAddress,
      plannedStartTime: item.plannedStartTime,
      plannedEndTime: item.plannedEndTime,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      rejectReason: item.rejectReason, // 审核失败原因
    }));

    return {
      list: formattedList,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 企业查询工单详情
   * @param enterpriseId 企业ID
   * @param workOrderId 工单ID
   */
  async getEnterpriseWorkOrderDetail(enterpriseId: number, workOrderId: number) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: {
        id: workOrderId,
        enterpriseId,
        isDeleted: false,
      },
      include: {
        workOrderTechnicians: {
          select: {
            technician: {
              select: {
                realName: true,
                phone: true,
              },
            },
            processingStatus: true,
            processingResult: true,
            completeTime: true,
          },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException('工单不存在或无权限查看');
    }

    return {
      workOrderId: workOrder.id,
      orderNo: workOrder.orderNo,
      title: workOrder.title,
      type: workOrder.type,
      status: workOrder.status,
      statusText: WORK_ORDER_STATUS_MAP[workOrder.status],
      priority: workOrder.priority,
      estimatedHours: workOrder.estimatedHours,
      workAddress: workOrder.workAddress,
      contactPhone: workOrder.contactPhone,
      descriptionType: workOrder.descriptionType,
      customDescription: workOrder.customDescription,
      selectedTemplateItems: workOrder.selectedTemplateItems,
      specificRequirements: workOrder.specificRequirements,
      plannedStartTime: workOrder.plannedStartTime,
      plannedEndTime: workOrder.plannedEndTime,
      specialRequirements: workOrder.specialRequirements,
      remarks: workOrder.remarks,
      rejectReason: workOrder.rejectReason, // 审核失败原因
      createdAt: workOrder.createdAt,
      updatedAt: workOrder.updatedAt,
      handlingTechnicians: workOrder.workOrderTechnicians.map((item) => ({
        technicianName: item.technician.realName,
        technicianPhone: item.technician.phone,
        processingStatus: item.processingStatus,
        processingResult: item.processingResult,
        completeTime: item.completeTime,
      })),
    };
  }

  /**
   * 企业发布新工单
   * @param enterpriseId 企业ID
   * @param dto 发布参数
   */
 async publishWorkOrder(enterpriseId: number, dto: PublishWorkOrderDto) {
    // 校验企业合法性
    const enterprise = await this.prisma.enterprise.findUnique({
      where: { id: enterpriseId },
      select: {
        id: true,
        enterpriseRealAuthStatus: true, // 企业实名认证状态
        isDeleted: true, // 企业是否被删除
      },
    });
    const now = getCstTimeForPrisma(); 

    //  企业不存在
    if (!enterprise) {
      throw new NotFoundException('企业不存在');
    }

    // 企业已被删除
    if (enterprise.isDeleted) {
      throw new ForbiddenException('企业已被禁用，无法发布工单');
    }

    //  企业未完成实名认证/认证未通过
    if (enterprise.enterpriseRealAuthStatus !== RealAuthStatus.AUTHORIZED) {
      throw new ForbiddenException('仅实名认证通过的企业可发布工单，请先完成认证');
    }

    // 生成唯一工单编号
    const orderNo = generateWorkOrderNo();

    let workOrderType: WorkOrderType;
    if (!Object.values(WorkOrderType).includes(dto.type as WorkOrderType)) {
      throw new ForbiddenException(`工单类型错误，支持的类型：${Object.values(WorkOrderType).join(', ')}`);
    }
    workOrderType = dto.type as WorkOrderType;

    // 事务创建工单
    const workOrder = await this.prisma.$transaction(async (tx) => {
      return tx.workOrder.create({
        data: {
          orderNo,
          // 关联企业ID
          enterpriseId,
          status: WorkOrderStatus.PENDING_REVIEW, 
          dispatchStatus: WorkOrderDispatchStatus.UNASSIGNED,
          title: dto.title,
          type: workOrderType, 
          priority: dto.priority as any,
          estimatedHours: dto.estimatedHours,
          contactName: dto.contactName,
          contactPhone: dto.contactPhone,
          workAddress: dto.workAddress,
          descriptionType: dto.descriptionType,
          customDescription: dto.customDescription,
          selectedTemplateItems: dto.selectedTemplateItems,
          images: dto.images,
          specificRequirements: dto.specificRequirements,
          plannedStartTime: new Date(dto.plannedStartTime),
          plannedEndTime: new Date(dto.plannedEndTime),
          specialRequirements: dto.specialRequirements,
          remarks: dto.remarks,
          createdAt: now,
          updatedAt: now,

          // 补充 createdBy
          createdBy: null,
          // 补充 createdSource
           createdSource: CreatedSource.ENTERPRISE,
        },
      });
    });

    return {
      workOrderId: workOrder.id,
      orderNo: workOrder.orderNo,
      status: workOrder.status,
      statusText: WORK_ORDER_STATUS_MAP[workOrder.status],
      message: '工单发布成功，等待管理员审核',
    };
  }

  /**
   * 企业重新发布审核失败的工单
   * @param enterpriseId 企业ID
   * @param dto 重发布参数
   */
  async republishWorkOrder(enterpriseId: number, dto: RepublishWorkOrderDto) {
    const { workOrderId, ...updateFields } = dto;

    // 校验工单：必须是当前企业的、审核失败的工单
    const workOrder = await this.prisma.workOrder.findFirst({
      where: {
        id: workOrderId,
        enterpriseId,
        isDeleted: false,
        status: WorkOrderStatus.REVIEW_REJECTED, // 仅审核失败的工单可重发
      },
    });

    if (!workOrder) {
      throw new BadRequestException('仅可重新发布本企业审核失败的工单');
    }

    //  事务更新：重置状态为待审核，更新修改的字段
    const updatedWorkOrder = await this.prisma.$transaction(async (tx) => {
      return tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: WorkOrderStatus.PENDING_REVIEW, // 重置为待审核
          rejectReason: null, // 清空原审核失败原因
          ...updateFields, // 更新企业修改的字段
          updatedAt: new Date(),
          // 重发布后重置派单状态
          dispatchStatus: 'UNASSIGNED',
          reassignmentCount: 0,
        },
      });
    });

    return {
      workOrderId: updatedWorkOrder.id,
      orderNo: updatedWorkOrder.orderNo,
      status: updatedWorkOrder.status,
      statusText: WORK_ORDER_STATUS_MAP[updatedWorkOrder.status],
      message: '工单重新发布成功，等待管理员审核',
    };
  }

  /**
 * 企业统计自身发布的工单状态分布
 * @param enterpriseId 企业ID
 */
async countEnterpriseWorkOrders(enterpriseId: number) {
  const whereBase = { enterpriseId, isDeleted: false };

  const [
    pendingReview,      // 待审核
    reviewRejected,     // 审核拒绝
    pendingAcceptance,  // 待接单
    accepted,           // 已接单
    inProgress,         // 处理中
    completed,          // 已完成
    rejected,           // 已拒绝（所有电工拒绝）
    cancelled,          // 已取消
    total,
  ] = await Promise.all([
    this.prisma.workOrder.count({ where: { ...whereBase, status: WorkOrderStatus.PENDING_REVIEW } }),
    this.prisma.workOrder.count({ where: { ...whereBase, status: WorkOrderStatus.REVIEW_REJECTED } }),
    this.prisma.workOrder.count({ where: { ...whereBase, status: WorkOrderStatus.PENDING_ACCEPTANCE } }),
    this.prisma.workOrder.count({ where: { ...whereBase, status: WorkOrderStatus.ACCEPTED } }),
    this.prisma.workOrder.count({ where: { ...whereBase, status: WorkOrderStatus.IN_PROGRESS } }),
    this.prisma.workOrder.count({ where: { ...whereBase, status: WorkOrderStatus.COMPLETED } }),
    this.prisma.workOrder.count({ where: { ...whereBase, status: WorkOrderStatus.REJECTED } }),
    this.prisma.workOrder.count({ where: { ...whereBase, status: WorkOrderStatus.CANCELLED } }),
    this.prisma.workOrder.count({ where: whereBase }),
  ]);

  return {
    total,
    pendingReview,      // 待审核
    reviewRejected,     // 审核被拒
    pendingAcceptance,  // 待接单
    accepted,           // 已接单（未开始执行）
    inProgress,         // 处理中
    completed,          // 已完成
    rejected,           // 已拒绝
    cancelled,          // 已取消
  };
}
}