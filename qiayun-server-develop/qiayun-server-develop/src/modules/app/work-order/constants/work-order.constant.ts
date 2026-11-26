// src/modules/mini-app/work-order/constants/work-order.constant.ts
import { WorkOrderStatus, TechnicianWorkOrderStatus } from '@prisma/client';

/** 工单状态映射（严格匹配最新 Prisma WorkOrderStatus 枚举） */
export const WORK_ORDER_STATUS_MAP = {
  PENDING_REVIEW: '待审核',
  REVIEW_REJECTED: '审核拒绝',
  PENDING_ACCEPTANCE: '待接单',
  ACCEPTED: '已接单',
  IN_PROGRESS: '处理中',
  COMPLETED: '已完成',
  REJECTED: '已拒绝',
  CANCELLED: '已取消',
};

/** 电工执行状态映射（保持不变，细分执行节点） */
export const PROCESSING_STATUS_MAP = {
  NOT_STARTED: '未开始',
  ARRIVAL_NOTIFIED: '已通知预计到达时间',
  DEPARTED: '已出发',
  ARRIVED: '已到达',
  SELF_INSPECTED: '已完成装备自检',
  EXECUTING: '执行巡检任务',
  COMPLETED: '已完成',
  REJECTED: '已拒绝',
};

/** 工单类型映射（保持不变） */
export const WORK_ORDER_TYPE_MAP = {
  INSPECTION: '巡检',
  MAINTENANCE: '保养',
  REPAIR: '维修',
  ELECTRICAL_TEST: '电试（电气试验）',
  TRANSFORMATION: '改造（设备改造）',
  EMERGENCY_REPAIR: '抢修',
  DAILY_PURCHASE: '日常采购',
  TECHNICAL_GUIDANCE: '技术指导',
  OTHER: '其他',
};

/** 优先级映射（保持不变） */
export const PRIORITY_MAP = {
  URGENT: '紧急',
  NORMAL: '一般',
  LOW: '普通',
};

/** 电工状态 → 工单主状态 映射（适配新工单状态） */
export const TECH_STATUS_TO_WORK_ORDER_STATUS: Record<TechnicianWorkOrderStatus, WorkOrderStatus> = {
  [TechnicianWorkOrderStatus.NOT_STARTED]: WorkOrderStatus.ACCEPTED, // 电工未开始 → 工单已接单
  [TechnicianWorkOrderStatus.ARRIVAL_NOTIFIED]: WorkOrderStatus.IN_PROGRESS, // 电工通知到达 → 工单处理中
  [TechnicianWorkOrderStatus.DEPARTED]: WorkOrderStatus.IN_PROGRESS, // 电工已出发 → 工单处理中
  [TechnicianWorkOrderStatus.ARRIVED]: WorkOrderStatus.IN_PROGRESS, // 电工已到达 → 工单处理中
  [TechnicianWorkOrderStatus.SELF_INSPECTED]: WorkOrderStatus.IN_PROGRESS, // 电工自检完成 → 工单处理中
  [TechnicianWorkOrderStatus.EXECUTING]: WorkOrderStatus.IN_PROGRESS, // 电工执行中 → 工单处理中
  [TechnicianWorkOrderStatus.COMPLETED]: WorkOrderStatus.IN_PROGRESS, // 电工完成 → 工单仍处理中（需所有电工完成才改已完成）
  [TechnicianWorkOrderStatus.REJECTED]: WorkOrderStatus.PENDING_ACCEPTANCE, // 电工拒绝 → 工单回到待接单
};