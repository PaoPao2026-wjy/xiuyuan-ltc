import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { WorkOrderListDto } from './dto/work-order-list.dto';
import { WORK_ORDER_STATUS_MAP, PROCESSING_STATUS_MAP, WORK_ORDER_TYPE_MAP, PRIORITY_MAP, TECH_STATUS_TO_WORK_ORDER_STATUS } from './constants/work-order.constant';
import { 
  WorkOrderStatus, 
  TechnicianWorkOrderStatus, 
  WorkOrderDispatchStatus,
  WorkOrderAssignmentStatus,
  PointsChangeType
} from '@prisma/client';
import { CompleteWorkOrderDto } from './dto/complete-work-order.dto';
import { UpdateTechnicianStatusDto } from './dto/update-technician-status.dto';
import { RejectWorkOrderDto } from './dto/reject-work-order.dto';
import { QueryTechWorkOrderDetailDto } from './dto/query-tech-work-order-detail.dto';
import { UpdateWorkOrderProcessingResultDto } from './dto/update-work-order-processing-result.dto';
import { getCstTimeForPrisma } from 'src/common/utils/time.util';

@Injectable()
export class WorkOrderService {
  private readonly logger = new Logger(WorkOrderService.name);
  constructor(private prisma: PrismaService) {}

  /**
   * 我的工单列表（电工已接单的工单）
   */
async getMyWorkOrders(technicianId: number, dto: WorkOrderListDto) {
  const { page, pageSize, status } = dto;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);
  

  const baseWhere = {
    technicianId,
    isDeleted: false,
    workOrder: {
      isDeleted: false,
    },
  };

  const where: any = {
    ...baseWhere,
    NOT: { processingStatus: TechnicianWorkOrderStatus.REJECTED },// 排除已拒绝工单
    ...(status && { processingStatus: status as TechnicianWorkOrderStatus }),
  };

  const [techRecords, total] = await Promise.all([
    this.prisma.workOrderTechnician.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
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
            workAddress: true,
            enterprise: {
              select: { enterpriseName: true, contactPhone: true },
            },
          },
        },
      },
    }),
    this.prisma.workOrderTechnician.count({ where }),
  ]);


  const formattedList = techRecords.map((record) => {
    const order = record.workOrder; // 类型安全，非 null
    return {
      workOrderId: order.id,
      orderNo: order.orderNo,
      title: order.title,
      type: order.type,
      status: order.status,
      statusText: WORK_ORDER_STATUS_MAP[order.status],
      priority: order.priority,
      enterpriseName: order.enterprise.enterpriseName,
      contactPhone: order.enterprise.contactPhone,
      plannedStartTime: order.plannedStartTime,
      workAddress: order.workAddress,

      processingStatus: record.processingStatus,
      processingStatusText: PROCESSING_STATUS_MAP[record.processingStatus] || '',
      startTime: record.startTime,
      estimatedArrivalTime: record.estimatedArrivalTime,
      departureTime: record.departureTime,
      arrivalTime: record.arrivalTime,
      selfInspectionTime: record.selfInspectionTime,
      executionStartTime: record.executionStartTime,
      completeTime: record.completeTime,
    };
  });

  return {
    list: formattedList,
    pagination: {
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize)),
    },
  };
}

  /**
   * 工单详情
   */
  async getWorkOrderDetail(workOrderId: number, technicianId: number) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId, isDeleted: false },
      include: {
        enterprise: {
          select: {
            enterpriseName: true,
            enterpriseAddress: true,
            contactName: true,
            contactPhone: true,
          },
        },
        workOrderTechnicians: {
          where: { technicianId, isDeleted: false, isReassigned: false },
          select: {
            processingStatus: true,
            processingResult: true,
            processingImages: true,
            processingVideos: true,
            startTime: true,
            remark: true,
            completeTime: true,
            // 补充细分状态字段
            estimatedArrivalTime: true,
            departureTime: true,
            arrivalTime: true,
            selfInspectionTime: true,
            executionStartTime: true,
            rejectReason: true,
            rejectTime: true,
            selfInspectionCompleted: true,
            selfInspectionPhotos: true,
          },
          take: 1,
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException('工单不存在或已删除');
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
      enterprise: workOrder.enterprise,
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
      // 电工处理记录
      processingInfo: workOrder.workOrderTechnicians[0] || {},
    };
  }

  /**
   * 统计我的工单（适配新状态：待审核/待接单/已接单/处理中/已完成/已拒绝）
   */
 async countMyWorkOrders(technicianId: number) {
  if (!technicianId) {
    throw new BadRequestException('电工ID无效');
  }

  // 该电工的有效处理记录 + 对应工单未删除
  const baseWhere = {
    technicianId,
    isDeleted: false,
    workOrder: {
      isDeleted: false,
    },
  };

  // 使用 Prisma 的 groupBy 或多个 count 查询
  const [
    total,
    pending,        // NOT_STARTED
    processing,     // ARRIVAL_NOTIFIED ~ EXECUTING
    completed,      // COMPLETED
    rejected,       // REJECTED
  ] = await Promise.all([
    this.prisma.workOrderTechnician.count({ where: baseWhere }),

    this.prisma.workOrderTechnician.count({
      where: { ...baseWhere, processingStatus: TechnicianWorkOrderStatus.NOT_STARTED },
    }),

    this.prisma.workOrderTechnician.count({
      where: {
        ...baseWhere,
        processingStatus: {
          in: [
            TechnicianWorkOrderStatus.ARRIVAL_NOTIFIED,
            TechnicianWorkOrderStatus.DEPARTED,
            TechnicianWorkOrderStatus.ARRIVED,
            TechnicianWorkOrderStatus.SELF_INSPECTED,
            TechnicianWorkOrderStatus.EXECUTING,
          ],
        },
      },
    }),

    this.prisma.workOrderTechnician.count({
      where: { ...baseWhere, processingStatus: TechnicianWorkOrderStatus.COMPLETED },
    }),

    this.prisma.workOrderTechnician.count({
      where: { ...baseWhere, processingStatus: TechnicianWorkOrderStatus.REJECTED },
    }),
  ]);

  return {
    total,
    pending,      // 已接单未开始
    processing,   // 处理中（细分执行阶段）
    completed,    // 自身已完成
    rejected,     // 自身已拒绝
  };
}

  /**
   * 工单广场（可抢单的工单：待接单状态）
   */
  async getWorkOrderPlaza(dto: WorkOrderListDto) {
    const { page, pageSize } = dto;
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    // 筛选条件：待接单、未删除、未被任何电工接单
    const where = {
      status: WorkOrderStatus.PENDING_ACCEPTANCE, // 新状态：待接单
     // dispatchStatus: { in: [WorkOrderDispatchStatus.UNASSIGNED, WorkOrderDispatchStatus.ASSIGNED] },
      isDeleted: false,
      // 排除已被电工接单的工单
      // workOrderTechnicians: {
      //   none: {
      //     isDeleted: false,
      //     processingStatus: { not: TechnicianWorkOrderStatus.REJECTED },
      //   },
      // },
    };

    const [list, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          enterprise: {
            select: { enterpriseName: true, contactPhone: true },
          },
        },
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      list: list.map((order) => ({
        workOrderId: order.id,
        orderNo: order.orderNo,
        title: order.title,
        type: order.type,
        typeText: WORK_ORDER_TYPE_MAP[order.type],
        priority: order.priority,
        priorityText: PRIORITY_MAP[order.priority],
        enterpriseName: order.enterprise?.enterpriseName,
        workAddress: order.workAddress,
        plannedStartTime: order.plannedStartTime,
        specialRequirements: order.specialRequirements,
        estimatedHours: order.estimatedHours,
      })),
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    };
  }

  /**
   * 电工接单（从工单广场抢单，适配新状态）
   */
  async acceptWorkOrder(technicianId: number, workOrderId: number) {
     const now = getCstTimeForPrisma();
    // 检查工单是否存在且可接单：待接单、未删除、未被接单
    const workOrder = await this.prisma.workOrder.findUnique({
      where: {
        id: workOrderId,
        isDeleted: false,
        status: WorkOrderStatus.PENDING_ACCEPTANCE, // 必须是待接单状态
        // workOrderTechnicians: {
        //   none: {
        //     isDeleted: false,
        //     processingStatus: { not: TechnicianWorkOrderStatus.REJECTED },
        //   },
        // },
      },
      include: {
        // 同时查询关联的待处理指派单
        assignments: {
          where: {
            status: WorkOrderAssignmentStatus.PENDING,
            technicianId,
            isDeleted: false,
          },
        },
      },
    });

    if (!workOrder) {
      throw new BadRequestException('工单不存在、已被接单或不可抢单');
    }

    // 事务：创建处理记录 + 更新工单状态 + 更新指派单
    await this.prisma.$transaction(async (tx) => {
    // 创建工单-电工关联记录（初始状态：未开始）
    await tx.workOrderTechnician.upsert({
      where: { workOrderId_technicianId: { workOrderId, technicianId } },
      create: {
        workOrderId,
        technicianId,
        processingStatus: TechnicianWorkOrderStatus.NOT_STARTED,
        startTime: now,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      },
      update: {
       // 更新记录（对应之前拒绝的工单）：清空所有业务字段，恢复初始状态
        isDeleted: false,
        processingStatus: TechnicianWorkOrderStatus.NOT_STARTED,
        startTime: now,
        updatedAt: now,
        
        // 时间类字段清空
        estimatedArrivalTime: null,
        departureTime: null,
        arrivalTime: null,
        selfInspectionTime: null,
        executionStartTime: null,
        completeTime: null,
        rejectTime: null,
        
        // 自检相关字段恢复默认
        selfInspectionCompleted: false,
        selfInspectionPhotos: null,
        
        // 拒绝相关字段清空
        rejectReason: null,
        
        // 各节点备注清空
        notStartedRemark: null,
        arrivalNotifiedRemark: null,
        departedRemark: null,
        arrivedRemark: null,
        selfInspectedRemark: null,
        executingRemark: null,
        completedRemark: null,
        remark: null, // 兼容旧备注字段
        
        // 处理结果/多媒体字段清空
        processingResult: null,
        processingImages: null,
        processingVideos: null,
        
        // 重新分配标识恢复默认
        isReassigned: false,
      },
    });


      //  更新工单状态：待接单 → 已接单
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: WorkOrderStatus.ACCEPTED, // 新状态：已接单
          dispatchStatus: WorkOrderDispatchStatus.ASSIGNED,
          lastAssignedAt: now,
          totalAssignedTechnicians: { increment: 1 },
          updatedAt: now,
        },
      });

      // 更新电工接单次数
      await tx.technician.update({
        where: { technicianId, isDeleted: false },
        data: {
          totalOrders: { increment: 1 }, // 核心：接单即+1
          updatedAt: now
        }
      });

      // // 更新关联的待处理指派单为已接受
      // if (workOrder.assignments.length > 0) {
      //   const assignmentIds = workOrder.assignments.map(ass => ass.id);
      //   await tx.workOrderAssignment.updateMany({
      //     where: { id: { in: assignmentIds } },
      //     data: {
      //       status: WorkOrderAssignmentStatus.ACCEPTED,
      //       handledAt: new Date(),
      //       updatedAt: new Date(),
      //     },
      //   });
      // }
    });

    return { message: '接单成功', workOrderId };
  }

 // 完成工单积分奖励常量（配置化，便于后续调整）
  private readonly POINTS_PER_COMPLETE_ORDER = 200;
/**
   * 电工完成工单（核心更新：处理记录 + 工单状态 + 电工完成数/积分 + 积分日志）
   */
  async completeWorkOrder(technicianId: number, dto: CompleteWorkOrderDto) {
    const {
      workOrderId,
      processingResult,
      processingImages,
      processingVideos,
      remark
    } = dto;
    const now = new Date();

    // 基础校验：工单存在+未删除
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId, isDeleted: false },
      include: {
        workOrderTechnicians: {
          where: { technicianId, isDeleted: false, isReassigned: false }, // 排除重新分配的历史记录
          select: {
            processingStatus: true,
            selfInspectionCompleted: true // 取原有自检状态
          },
          take: 1
        }
      }
    });

    if (!workOrder) {
      throw new NotFoundException('工单不存在或已删除');
    }
    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('该工单已完成，无需重复提交');
    }

    // 校验电工处理记录+可完成状态
    const currentTechnicianRecord = workOrder.workOrderTechnicians[0];
    if (!currentTechnicianRecord) {
      throw new BadRequestException('未找到该工单的有效处理记录，无法提交完成');
    }

    // 允许提交完成的电工执行状态（匹配Prisma枚举）
    const ALLOW_COMPLETE_STATUSES: TechnicianWorkOrderStatus[] = [
      TechnicianWorkOrderStatus.EXECUTING,
      TechnicianWorkOrderStatus.ARRIVED,
      TechnicianWorkOrderStatus.SELF_INSPECTED
    ];
    if (!ALLOW_COMPLETE_STATUSES.includes(currentTechnicianRecord.processingStatus)) {
      throw new BadRequestException(`仅【执行中/已到达/已自检】状态可提交完成，当前状态：${currentTechnicianRecord.processingStatus}`);
    }

    // 事务更新：保证所有操作原子性（失败则回滚）
    const result = await this.prisma.$transaction(async (tx) => {
      // 更新电工处理记录为已完成
      await tx.workOrderTechnician.update({
        where: {
          workOrderId_technicianId: { workOrderId, technicianId },
          isDeleted: false,
          isReassigned: false
        },
        data: {
          processingStatus: TechnicianWorkOrderStatus.COMPLETED,
          processingResult: processingResult ? JSON.parse(processingResult) : null, // 转为JSON存储
          processingImages: processingImages || [],
          processingVideos: processingVideos || [],
          completeTime: now,
          remark: remark || '',
          updatedAt: now
        }
      });

      //更新电工数据：已完成工单数+1 + 积分+200 + 积分更新时间
      const updatedTechnician = await tx.technician.update({
        where: { technicianId, isDeleted: false },
        data: {
          completedOrders: { increment: 1 }, // 已完成工单数累加
          points: { increment: this.POINTS_PER_COMPLETE_ORDER }, // 完成工单奖励200积分
          pointsUpdatedAt: now, // 积分最后更新时间
          updatedAt: now
        },
        select: { points: true, completedOrders: true } // 仅返回需要的字段
      });

      // 写入积分变动日志
      await tx.technicianPointsLog.create({
        data: {
          technicianId,
          pointsChange: this.POINTS_PER_COMPLETE_ORDER, // +200积分
          pointsAfter: updatedTechnician.points, // 变动后总积分
          type: PointsChangeType.COMPLETE_ORDER, // 积分类型：完成工单
          relatedOrderId: workOrderId, // 关联工单ID
          reason: `完成工单${workOrderId}，获得基础积分奖励`, // 变动原因
          operatorId: 0, // 0=系统自动操作
          operatorType: 'system', // 操作类型：系统
          createdAt: now
        }
      });

      //  统计该工单所有有效电工记录（排除删除/重新分配）
      const allValidTechnicians = await tx.workOrderTechnician.findMany({
        where: {
          workOrderId,
          isDeleted: false,
          isReassigned: false
        },
        select: { processingStatus: true }
      });

      //  计算已完成电工数，更新工单主状态
      const completedTechCount = allValidTechnicians.filter(
        t => t.processingStatus === TechnicianWorkOrderStatus.COMPLETED
      ).length;
      const totalValidTechCount = allValidTechnicians.length;

      await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          completedTechnicians: completedTechCount,
          status: completedTechCount === totalValidTechCount 
            ? WorkOrderStatus.COMPLETED 
            : WorkOrderStatus.IN_PROGRESS,
          dispatchStatus: WorkOrderDispatchStatus.ASSIGNED,
          lastAssignedAt: now,
          updatedAt: now
        }
      });

      return {
        updatedTechnician,
        completedTechCount,
        totalValidTechCount
      };
    });

    // 日志记录
    this.logger.log(`电工${technicianId}完成工单${workOrderId}，已完成工单数+1，积分+${this.POINTS_PER_COMPLETE_ORDER}，当前积分：${result.updatedTechnician.points}`);

    // 返回结果
    return {
      workOrderId,
      technicianId,
      completedAt: now,
      selfInspectionCompleted: currentTechnicianRecord.selfInspectionCompleted,
      completedOrders: result.updatedTechnician.completedOrders, // 当前已完成工单数
      currentPoints: result.updatedTechnician.points, // 当前总积分
      message: '工单完成提交成功，已获得200积分奖励'
    };
  }

/**
 * 更新电工执行状态（仅处理：未开始/已通知/已出发/已到达/已自检/执行中）
 */
// async updateTechnicianStatus(technicianId: number, dto: UpdateTechnicianStatusDto) {
//   const {
//     workOrderId,
//     processingStatus,
//     estimatedArrivalTime,
//     departureTime,
//     arrivalTime,
//     selfInspectionCompleted,
//     selfInspectionPhotos,
//     selfInspectionTime,
//     executionStartTime,
//     remark,
//     isReassigned = false
//   } = dto;
//   const now = getCstTimeForPrisma();

//   // 基础校验：工单+电工记录存在
//   const [techRecord, workOrder] = await Promise.all([
//     this.prisma.workOrderTechnician.findUnique({
//       where: {
//         workOrderId_technicianId: { workOrderId, technicianId },
//         isDeleted: false,
//         isReassigned: false // 仅操作当前有效记录
//       }
//     }),
//     this.prisma.workOrder.findUnique({
//       where: { id: workOrderId, isDeleted: false },
//       select: {
//         dispatchStatus: true,
//         reassignmentCount: true,
//         totalAssignedTechnicians: true,
//         completedTechnicians: true,
//         rejectedTechnicians: true,
//         status: true
//       }
//     })
//   ]);

//   if (!techRecord) {
//     throw new BadRequestException('未找到该工单的有效处理记录，无法更新状态');
//   }
//   if (!workOrder) {
//     throw new BadRequestException('工单不存在或已删除');
//   }

//  const STATUS_ORDER: Record<TechnicianWorkOrderStatus, number> = {
//   [TechnicianWorkOrderStatus.NOT_STARTED]: 0,
//   [TechnicianWorkOrderStatus.ARRIVAL_NOTIFIED]: 1,
//   [TechnicianWorkOrderStatus.DEPARTED]: 2,
//   [TechnicianWorkOrderStatus.ARRIVED]: 3,
//   [TechnicianWorkOrderStatus.SELF_INSPECTED]: 4,
//   [TechnicianWorkOrderStatus.EXECUTING]: 5,
//   [TechnicianWorkOrderStatus.COMPLETED]: 6, // 终态，通常单独处理
//   [TechnicianWorkOrderStatus.REJECTED]: 7, // 终态，通常单独处理
// };

// // 在校验终态之后，再校验是否正向推进（仅当新状态不是 REJECTED/COMPLETED 时）
// if (
//   processingStatus !== TechnicianWorkOrderStatus.COMPLETED &&
//   processingStatus !== TechnicianWorkOrderStatus.REJECTED
// ) {
//   const currentOrder = STATUS_ORDER[techRecord.processingStatus];
//   const newOrder = STATUS_ORDER[processingStatus];

//   if (newOrder < currentOrder) {
//     throw new BadRequestException(
//       `状态不能回退：当前为【${techRecord.processingStatus}】，不能更新为【${processingStatus}】`
//     );
//   }
// }

//   // 构造电工记录更新数据
//   const techUpdateData: Record<string, any> = {
//     processingStatus,
//     remark: remark || techRecord.remark,
//     isReassigned: isReassigned, // 标记是否为重新分配记录
//     updatedAt: now
//   };

//   // 按执行状态补全细分字段
//   switch (processingStatus) {
//     case TechnicianWorkOrderStatus.ARRIVAL_NOTIFIED:
//       techUpdateData.estimatedArrivalTime = estimatedArrivalTime ? new Date(estimatedArrivalTime) : now;
//       break;
//     case TechnicianWorkOrderStatus.DEPARTED:
//       techUpdateData.departureTime = departureTime ? new Date(departureTime) : now;
//       break;
//     case TechnicianWorkOrderStatus.ARRIVED:
//       techUpdateData.arrivalTime = arrivalTime ? new Date(arrivalTime) : now;
//       break;
//     case TechnicianWorkOrderStatus.SELF_INSPECTED:
//       techUpdateData.selfInspectionTime = selfInspectionTime ? new Date(selfInspectionTime) : now;
//       techUpdateData.selfInspectionCompleted = selfInspectionCompleted ?? true; // 默认完成自检
//       techUpdateData.selfInspectionPhotos = selfInspectionPhotos || techRecord.selfInspectionPhotos || [];
//       break;
//     case TechnicianWorkOrderStatus.EXECUTING:
//       techUpdateData.executionStartTime = executionStartTime ? new Date(executionStartTime) : now;
//       break;
//     case TechnicianWorkOrderStatus.NOT_STARTED:
//       break; // 未开始状态无需补充字段
//     default:
//       // 若传入完成/拒绝状态，直接抛出不支持
//       throw new BadRequestException(`不支持的执行状态：${processingStatus}，该接口仅支持更新【未开始/已通知/已出发/已到达/已自检/执行中】状态`);
//   }

//   // 事务执行：更新电工记录 + 工单主表
//   const updatedWorkOrder = await this.prisma.$transaction(async (tx) => {
//     // 更新电工处理记录
//     await tx.workOrderTechnician.update({
//       where: { workOrderId_technicianId: { workOrderId, technicianId } },
//       data: techUpdateData
//     });

//     // 统计该工单所有有效电工记录
//     const allValidTechs = await tx.workOrderTechnician.findMany({
//       where: {
//         workOrderId,
//         isDeleted: false,
//         isReassigned: false
//       },
//       select: { processingStatus: true }
//     });

//     // 计算状态统计值
//     const totalTechCount = allValidTechs.length;

//     // 构造工单更新数据
//     const orderUpdateData: Record<string, any> = {
//       updatedAt: now,
//       // lastAssignedAt: now, // 每次状态更新刷新最后指派时间
//       totalAssignedTechnicians: totalTechCount, // 更新总指派电工数
//       status: WorkOrderStatus.IN_PROGRESS, // 非完成/拒绝状态均标记为处理中
//       dispatchStatus: WorkOrderDispatchStatus.ASSIGNED // 派单状态保持已分配
//     };

//     // 更新工单主表
//     return tx.workOrder.update({
//       where: { id: workOrderId },
//       data: orderUpdateData,
//       select: {
//         dispatchStatus: true,
//         lastAssignedAt: true,
//         reassignmentCount: true,
//         totalAssignedTechnicians: true,
//         completedTechnicians: true,
//         rejectedTechnicians: true,
//         status: true
//       }
//     });
//   });

//   // 返回结果
//   return {
//     workOrderId,
//     technicianId,
//     processingStatus,
//     dispatchStatus: updatedWorkOrder.dispatchStatus,
//     lastAssignedAt: updatedWorkOrder.lastAssignedAt,
//     reassignmentCount: updatedWorkOrder.reassignmentCount,
//     totalAssignedTechnicians: updatedWorkOrder.totalAssignedTechnicians,
//     completedTechnicians: updatedWorkOrder.completedTechnicians,
//     rejectedTechnicians: updatedWorkOrder.rejectedTechnicians,
//     currentWorkOrderStatus: updatedWorkOrder.status,
//     isReassigned,
//     message: '状态更新成功'
//   };
// }
/**
 * 更新电工执行状态（仅处理：未开始/已通知/已出发/已到达/已自检/执行中）
 */
async updateTechnicianStatus(technicianId: number, dto: UpdateTechnicianStatusDto) {
  const {
    workOrderId,
    processingStatus,
    estimatedArrivalTime,
    departureTime,
    arrivalTime,
    selfInspectionCompleted,
    selfInspectionPhotos,
    selfInspectionTime,
    executionStartTime,
    // 解构各节点独立备注
    notStartedRemark,
    arrivalNotifiedRemark,
    departedRemark,
    arrivedRemark,
    selfInspectedRemark,
    executingRemark,
    completedRemark,
    isReassigned = false
  } = dto;
  const now = getCstTimeForPrisma();

  // 基础校验：工单+电工记录存在
  const [techRecord, workOrder] = await Promise.all([
    this.prisma.workOrderTechnician.findUnique({
      where: {
        workOrderId_technicianId: { workOrderId, technicianId },
        isDeleted: false,
        isReassigned: false // 仅操作当前有效记录
      }
    }),
    this.prisma.workOrder.findUnique({
      where: { id: workOrderId, isDeleted: false },
      select: {
        dispatchStatus: true,
        reassignmentCount: true,
        totalAssignedTechnicians: true,
        completedTechnicians: true,
        rejectedTechnicians: true,
        status: true
      }
    })
  ]);

  if (!techRecord) {
    throw new BadRequestException('未找到该工单的有效处理记录，无法更新状态');
  }
  if (!workOrder) {
    throw new BadRequestException('工单不存在或已删除');
  }

  const STATUS_ORDER: Record<TechnicianWorkOrderStatus, number> = {
    [TechnicianWorkOrderStatus.NOT_STARTED]: 0,
    [TechnicianWorkOrderStatus.ARRIVAL_NOTIFIED]: 1,
    [TechnicianWorkOrderStatus.DEPARTED]: 2,
    [TechnicianWorkOrderStatus.ARRIVED]: 3,
    [TechnicianWorkOrderStatus.SELF_INSPECTED]: 4,
    [TechnicianWorkOrderStatus.EXECUTING]: 5,
    [TechnicianWorkOrderStatus.COMPLETED]: 6, // 终态，通常单独处理
    [TechnicianWorkOrderStatus.REJECTED]: 7, // 终态，通常单独处理
  };

  // 在校验终态之后，再校验是否正向推进（仅当新状态不是 REJECTED/COMPLETED 时）
  if (
    processingStatus !== TechnicianWorkOrderStatus.COMPLETED &&
    processingStatus !== TechnicianWorkOrderStatus.REJECTED
  ) {
    const currentOrder = STATUS_ORDER[techRecord.processingStatus];
    const newOrder = STATUS_ORDER[processingStatus];

    if (newOrder < currentOrder) {
      throw new BadRequestException(
        `状态不能回退：当前为【${techRecord.processingStatus}】，不能更新为【${processingStatus}】`
      );
    }
  }

  // 构造电工记录更新数据（核心修改：移除通用remark，添加各节点独立备注）
  const techUpdateData: Record<string, any> = {
    processingStatus,
    isReassigned: isReassigned, // 标记是否为重新分配记录
    updatedAt: now
  };

  // 按执行状态补全细分字段 + 对应独立备注
  switch (processingStatus) {
    case TechnicianWorkOrderStatus.NOT_STARTED:
      // 赋值未开始节点备注（优先传参值，无则保留原记录值）
      techUpdateData.notStartedRemark = notStartedRemark ?? techRecord.notStartedRemark;
      break;
    case TechnicianWorkOrderStatus.ARRIVAL_NOTIFIED:
      techUpdateData.estimatedArrivalTime = estimatedArrivalTime ? new Date(estimatedArrivalTime) : now;
      // 赋值已通知节点备注
      techUpdateData.arrivalNotifiedRemark = arrivalNotifiedRemark ?? techRecord.arrivalNotifiedRemark;
      break;
    case TechnicianWorkOrderStatus.DEPARTED:
      techUpdateData.departureTime = departureTime ? new Date(departureTime) : now;
      // 赋值已出发节点备注
      techUpdateData.departedRemark = departedRemark ?? techRecord.departedRemark;
      break;
    case TechnicianWorkOrderStatus.ARRIVED:
      techUpdateData.arrivalTime = arrivalTime ? new Date(arrivalTime) : now;
      // 赋值已到达节点备注
      techUpdateData.arrivedRemark = arrivedRemark ?? techRecord.arrivedRemark;
      break;
    case TechnicianWorkOrderStatus.SELF_INSPECTED:
      techUpdateData.selfInspectionTime = selfInspectionTime ? new Date(selfInspectionTime) : now;
      techUpdateData.selfInspectionCompleted = selfInspectionCompleted ?? true; // 默认完成自检
      techUpdateData.selfInspectionPhotos = selfInspectionPhotos || techRecord.selfInspectionPhotos || [];
      // 赋值已自检节点备注
      techUpdateData.selfInspectedRemark = selfInspectedRemark ?? techRecord.selfInspectedRemark;
      break;
    case TechnicianWorkOrderStatus.EXECUTING:
      techUpdateData.executionStartTime = executionStartTime ? new Date(executionStartTime) : now;
      // 赋值执行中节点备注
      techUpdateData.executingRemark = executingRemark ?? techRecord.executingRemark;
      break;
    default:
      // 若传入完成/拒绝状态，直接抛出不支持
      throw new BadRequestException(`不支持的执行状态：${processingStatus}，该接口仅支持更新【未开始/已通知/已出发/已到达/已自检/执行中】状态`);
  }

  // 事务执行：更新电工记录 + 工单主表
  const updatedWorkOrder = await this.prisma.$transaction(async (tx) => {
    // 更新电工处理记录（自动关联独立备注字段）
    await tx.workOrderTechnician.update({
      where: { workOrderId_technicianId: { workOrderId, technicianId } },
      data: techUpdateData
    });

    // 统计该工单所有有效电工记录
    const allValidTechs = await tx.workOrderTechnician.findMany({
      where: {
        workOrderId,
        isDeleted: false,
        isReassigned: false
      },
      select: { processingStatus: true }
    });

    // 计算状态统计值
    const totalTechCount = allValidTechs.length;

    // 构造工单更新数据
    const orderUpdateData: Record<string, any> = {
      updatedAt: now,
      totalAssignedTechnicians: totalTechCount, // 更新总指派电工数
      status: WorkOrderStatus.IN_PROGRESS, // 非完成/拒绝状态均标记为处理中
      dispatchStatus: WorkOrderDispatchStatus.ASSIGNED // 派单状态保持已分配
    };

    // 更新工单主表
    return tx.workOrder.update({
      where: { id: workOrderId },
      data: orderUpdateData,
      select: {
        dispatchStatus: true,
        lastAssignedAt: true,
        reassignmentCount: true,
        totalAssignedTechnicians: true,
        completedTechnicians: true,
        rejectedTechnicians: true,
        status: true
      }
    });
  });

  // 返回结果
  return {
    workOrderId,
    technicianId,
    processingStatus,
    dispatchStatus: updatedWorkOrder.dispatchStatus,
    lastAssignedAt: updatedWorkOrder.lastAssignedAt,
    reassignmentCount: updatedWorkOrder.reassignmentCount,
    totalAssignedTechnicians: updatedWorkOrder.totalAssignedTechnicians,
    completedTechnicians: updatedWorkOrder.completedTechnicians,
    rejectedTechnicians: updatedWorkOrder.rejectedTechnicians,
    currentWorkOrderStatus: updatedWorkOrder.status,
    isReassigned,
    message: '状态更新成功'
  };
}

/**
 * 电工拒绝工单（专属方法）
 */
async rejectWorkOrder(technicianId: number, dto: RejectWorkOrderDto) {
  const { workOrderId, rejectReason, rejectTime, remark } = dto;
  const now = getCstTimeForPrisma();

  // 基础校验：工单+电工记录存在
  const [techRecord, workOrder] = await Promise.all([
    this.prisma.workOrderTechnician.findUnique({
      where: {
        workOrderId_technicianId: { workOrderId, technicianId },
        isDeleted: false,
        isReassigned: false
      }
    }),
    this.prisma.workOrder.findUnique({
      where: { id: workOrderId, isDeleted: false },
      select: {
        dispatchStatus: true,
        reassignmentCount: true,
        totalAssignedTechnicians: true,
        completedTechnicians: true,
        rejectedTechnicians: true,
        status: true
      }
    })
  ]);

  if (!techRecord) {
    throw new BadRequestException('未找到该工单的有效处理记录，无法拒绝');
  }
  if (!workOrder) {
    throw new BadRequestException('工单不存在或已删除');
  }
  // 额外校验：已拒绝/已完成的工单不允许重复拒绝
  if (techRecord.processingStatus === TechnicianWorkOrderStatus.REJECTED) {
    throw new BadRequestException(`工单${workOrderId}已拒绝，禁止重复操作`);
  }
  if (techRecord.processingStatus === TechnicianWorkOrderStatus.COMPLETED) {
    throw new BadRequestException(`工单${workOrderId}已完成，无法拒绝`);
  }

  //  事务执行：更新电工拒绝记录 + 工单主表
  const updatedWorkOrder = await this.prisma.$transaction(async (tx) => {
    //  更新电工拒绝记录
    await tx.workOrderTechnician.update({
      where: { workOrderId_technicianId: { workOrderId, technicianId } },
      data: {
        processingStatus: TechnicianWorkOrderStatus.REJECTED,
        rejectReason: rejectReason,
        rejectTime: rejectTime ? new Date(rejectTime) : now,
        remark: remark || techRecord.remark,
        updatedAt: now
      }
    });

     // 更新电工拒绝工单数+1
     await tx.technician.update({
      where: { technicianId, isDeleted: false },
      data: {
        rejectedOrders: { increment: 1 }, // 拒绝数+1
        updatedAt: now
      },
      select: {
        totalOrders: true,
        completedOrders: true,
        rejectedOrders: true // 返回更新后的拒绝数
      }
    });

    //统计该工单所有有效电工记录
    const allValidTechs = await tx.workOrderTechnician.findMany({
      where: {
        workOrderId,
        isDeleted: false,
        isReassigned: false
      },
      select: { processingStatus: true }
    });

    const totalTechCount = allValidTechs.length;
    const rejectedTechCount = allValidTechs.filter(t => t.processingStatus === TechnicianWorkOrderStatus.REJECTED).length;
    const allRejected = totalTechCount > 0 && rejectedTechCount === totalTechCount;

    //构造工单更新数据
    const orderUpdateData: Record<string, any> = {
      updatedAt: now,
      lastAssignedAt: now,
      rejectedTechnicians: rejectedTechCount
    };

    if (allRejected) {
      orderUpdateData.status = WorkOrderStatus.PENDING_ACCEPTANCE;
      orderUpdateData.dispatchStatus = WorkOrderDispatchStatus.UNASSIGNED; // 更新为未分配状态
      orderUpdateData.reassignmentCount = workOrder.reassignmentCount + 1;
      orderUpdateData.totalAssignedTechnicians = 0;
      orderUpdateData.completedTechnicians = 0;
    } else {
      orderUpdateData.status = workOrder.status;
    }

    // 更新工单主表
    return tx.workOrder.update({
      where: { id: workOrderId },
      data: orderUpdateData,
      select: {
        dispatchStatus: true,
        lastAssignedAt: true,
        reassignmentCount: true,
        totalAssignedTechnicians: true,
        completedTechnicians: true,
        rejectedTechnicians: true,
        status: true
      }
    });
  });

  // 记录拒绝日志
  this.logger.log(`电工${technicianId}拒绝工单${workOrderId}，原因：${rejectReason}，工单当前状态：${updatedWorkOrder.status}`);

  // 返回结果
  return {
    workOrderId,
    technicianId,
    rejectReason,
    rejectTime: rejectTime ? new Date(rejectTime) : now,
    dispatchStatus: updatedWorkOrder.dispatchStatus,
    reassignmentCount: updatedWorkOrder.reassignmentCount,
    currentWorkOrderStatus: updatedWorkOrder.status,
    message: '工单拒绝成功'
  };
}

/**
 * 查询当前电工指定工单的处理详情
 */
async queryTechWorkOrderDetail(technicianId: number, dto: QueryTechWorkOrderDetailDto) {
  const { workOrderId } = dto;

  // 校验工单+电工记录存在（避免越权查询）
  const techRecord = await this.prisma.workOrderTechnician.findUnique({
    where: {
      workOrderId_technicianId: { workOrderId, technicianId },
      isDeleted: false,
      isReassigned: false
    },
    // 关联查询工单基础信息（按需返回）
    include: {
      workOrder: {
        select: {
          id: true,
          orderNo: true,
          title: true,
          type: true,
          priority: true,
          workAddress: true,
          contactName: true,
          contactPhone: true,
          status: true,
          dispatchStatus: true,
          plannedStartTime: true,
          plannedEndTime: true
        }
      }
    }
  });

  if (!techRecord) {
    throw new BadRequestException(`未找到电工${technicianId}对工单${workOrderId}的有效处理记录`);
  }

  // 格式化返回数据
  return {
    // 电工处理记录核心字段
    technicianId,
    workOrderId: techRecord.workOrderId,
    processingStatus: techRecord.processingStatus,
    estimatedArrivalTime: techRecord.estimatedArrivalTime,
    departureTime: techRecord.departureTime,
    arrivalTime: techRecord.arrivalTime,
    selfInspectionCompleted: techRecord.selfInspectionCompleted,
    selfInspectionPhotos: techRecord.selfInspectionPhotos || [],
    selfInspectionTime: techRecord.selfInspectionTime,
    executionStartTime: techRecord.executionStartTime,
    completeTime: techRecord.completeTime,
    rejectReason: techRecord.rejectReason,
    rejectTime: techRecord.rejectTime,
    processingResult: techRecord.processingResult || {},
    processingImages: techRecord.processingImages || [],
    processingVideos: techRecord.processingVideos || [],
    remark: techRecord.remark,
    isReassigned: techRecord.isReassigned,
    createdAt: techRecord.createdAt,
    updatedAt: techRecord.updatedAt,
    // 关联工单基础信息
    workOrderInfo: techRecord.workOrder
  };
}

/**
 * 更新当前电工指定工单的处理结果（执行中/已到达等状态下补充结果）
 */
async updateWorkOrderProcessingResult(technicianId: number, dto: UpdateWorkOrderProcessingResultDto) {
  const { workOrderId, processingResult, processingImages, processingVideos, remark } = dto;
  const now = getCstTimeForPrisma();

  //  基础校验
  const techRecord = await this.prisma.workOrderTechnician.findUnique({
    where: {
      workOrderId_technicianId: { workOrderId, technicianId },
      isDeleted: false,
      isReassigned: false
    }
  });

  if (!techRecord) {
    throw new BadRequestException(`未找到电工${technicianId}对工单${workOrderId}的有效处理记录`);
  }

   // 校验工单状态（已完成/已拒绝的工单不允许更新处理结果）
  const forbiddenStatus: TechnicianWorkOrderStatus[] = [
    TechnicianWorkOrderStatus.COMPLETED,
    TechnicianWorkOrderStatus.REJECTED
  ];
  if (forbiddenStatus.includes(techRecord.processingStatus)) {
    throw new BadRequestException(`工单${workOrderId}当前状态为【${techRecord.processingStatus}】，禁止更新处理结果`);
  }

  //  事务更新处理结果
  const updatedRecord = await this.prisma.$transaction(async (tx) => {
    return tx.workOrderTechnician.update({
      where: {
        workOrderId_technicianId: { workOrderId, technicianId },
        isDeleted: false,
        isReassigned: false
      },
      data: {
        // 仅更新传入的字段，未传则保留原值
        ...(processingResult && { processingResult }),
        ...(processingImages && { processingImages }),
        ...(processingVideos && { processingVideos }),
        ...(remark && { remark }),
        updatedAt: now
      },
      select: {
        workOrderId: true,
        technicianId: true,
        processingResult: true,
        processingImages: true,
        processingVideos: true,
        remark: true,
        updatedAt: true
      }
    });
  });

  // 记录日志
  this.logger.log(`电工${technicianId}更新工单${workOrderId}处理结果，更新时间：${now}`);

  //  返回结果
  return {
    ...updatedRecord,
    message: '处理结果更新成功'
  };
}
}