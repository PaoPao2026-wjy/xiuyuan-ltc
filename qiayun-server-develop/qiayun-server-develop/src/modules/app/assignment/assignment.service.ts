// src/modules/mini-app/assignment/assignment.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { HandleAssignmentDto } from './dto/handle-assignment.dto';
import { WorkOrderAssignmentStatus, WorkOrderStatus, TechnicianWorkOrderStatus } from '@prisma/client';
import { WORK_ORDER_STATUS_MAP } from '../work-order/constants/work-order.constant';
import { AssignmentListDto } from './dto/assignment-list.dto';

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * 我的指派单列表
   * @param technicianId 电工ID
   */
 async getMyAssignments(technicianId: number, dto: AssignmentListDto) {
  const { page, pageSize } = dto;
  const skip = (Number(page) - 1) * Number(pageSize); // 计算跳过的条数
  const take = Number(pageSize); // 每页查询条数

  // 分页查询指派单列表
  const assignments = await this.prisma.workOrderAssignment.findMany({
    where: {
      technicianId,
      isDeleted: false,
    },
    skip, // 分页：跳过前N条
    take, // 分页：查询当前页条数
    orderBy: { createdAt: 'desc' }, // 按创建时间倒序（最新的在前）
    include: {
      workOrder: {
        select: {
          id: true,
          orderNo: true,
          title: true,
          type: true,
          status: true,
          priority: true,
          plannedStartTime: true,
        },
      },
      assigner: {
        select: { realName: true, username: true },
      },
    },
  });

  // 查询符合条件的总条数（用于计算总页数）
  const total = await this.prisma.workOrderAssignment.count({
    where: {
      technicianId,
      isDeleted: false,
    },
  });

  // 格式化列表数据
  const list = assignments.map((item) => ({
    assignmentId: item.id,
    workOrder: {
      workOrderId: item.workOrder.id,
      orderNo: item.workOrder.orderNo,
      title: item.workOrder.title,
      type: item.workOrder.type,
      status: item.workOrder.status,
      statusText: WORK_ORDER_STATUS_MAP[item.workOrder.status],
      priority: item.workOrder.priority,
      plannedStartTime: item.workOrder.plannedStartTime,
    },
    status: item.status,
   // statusText: ASSIGNMENT_STATUS_MAP[item.status],
    assignedBy: item.assigner.realName || item.assigner.username,
    remark: item.remark,
    assignedAt: item.createdAt,
    handledAt: item.handledAt,
  }));

  // 返回分页数据（列表 + 分页元信息）
  return {
    list,
    pagination: {
      total, // 总条数
      page: Number(page), // 当前页码
      pageSize: Number(pageSize), // 每页条数
      totalPages: Math.ceil(total / Number(pageSize)), // 总页数
    },
  };
}

  /**
   * 接收指派单
   * @param technicianId 电工ID
   * @param dto 指派单ID
   */
 async acceptAssignment(technicianId: number, dto: HandleAssignmentDto) {
  const { assignmentId } = dto;

  //查询指派单（关联工单及其处理记录，验证归属、状态和工单是否已被接单）
  const assignment = await this.prisma.workOrderAssignment.findUnique({
    where: {
      id: assignmentId,
      technicianId,
      status: WorkOrderAssignmentStatus.PENDING, // 必须是待处理状态
      isDeleted: false,
    },
    include: {
      workOrder: {
        // 查询工单是否已有其他电工接单（有效记录）
        include: {
          workOrderTechnicians: {
            where: { isDeleted: false }, // 排除已删除的处理记录
            take: 1, 
          },
        },
      },
    },
  });

  if (!assignment) {
    throw new NotFoundException('指派单不存在或已处理');
  }

  // 检查工单是否已被接单（存在有效的处理记录）
  const hasAcceptedTechnician = assignment.workOrder.workOrderTechnicians.length > 0;
  if (hasAcceptedTechnician) {
    throw new BadRequestException('该工单已被其他电工接单，无法接受指派');
  }

  // 事务：更新指派单状态 + 创建工单-电工关联记录 + 更新工单状态
  await this.prisma.$transaction(async (tx) => {
    // 更新指派单为已接受
    await tx.workOrderAssignment.update({
      where: { id: assignmentId },
      data: {
        status: WorkOrderAssignmentStatus.ACCEPTED,
        handledAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 创建工单-电工关联记录（标记为处理中）
    await tx.workOrderTechnician.create({
      data: {
        workOrderId: assignment.workOrderId,
        technicianId,
        processingStatus: TechnicianWorkOrderStatus.NOT_STARTED, // 电工工单未开始
        startTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 更新工单状态为处理中
    await tx.workOrder.update({
      where: { id: assignment.workOrderId },
      data: {
        status: WorkOrderStatus.IN_PROGRESS,
        updatedAt: new Date(),
      },
    });
  });

  return { message: '已接受指派单' };
}

  /**
   * 拒绝指派单
   * @param technicianId 电工ID
   * @param dto 指派单ID
   */
  async rejectAssignment(technicianId: number, dto: HandleAssignmentDto) {
    const { assignmentId } = dto;

    // 查询指派单（验证归属和状态）
    const assignment = await this.prisma.workOrderAssignment.findUnique({
      where: {
        id: assignmentId,
        technicianId,
        status: WorkOrderAssignmentStatus.PENDING,
        isDeleted: false,
      },
    });

    if (!assignment) {
      throw new NotFoundException('指派单不存在或已处理');
    }

    // 更新指派单为已拒绝
    await this.prisma.workOrderAssignment.update({
      where: { id: assignmentId },
      data: {
        status: WorkOrderAssignmentStatus.REJECTED,
        handledAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { message: '已拒绝指派单' };
  }
}