import http from "../index.js";

// 获取任务列表
/**
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.pageSize - 每页数量
 * @returns {Promise} - 任务列表
 * @response {Object} - 任务列表响应体
 * @response {Number} response.code - 状态码，200 表示成功
 * @response {String} response.message - 状态描述
 * @response {Object} response.data - 任务列表数据
 * @response {Array} response.data.list - 任务列表
 * @response {Number} response.data.pagination - 列表分页信息
 * @response {Number} response.data.pagination.total - 总任务数
 * @response {Number} response.data.pagination.page - 当前页码
 * @response {Number} response.data.pagination.pageSize - 每页数量
 */
export const getTaskList = (params) => {
  return http.get("/api/v1/app/work-order/plaza", params);
};

export const getEntTaskList = (params) => {
  return http.get("/api/v1/app/enterprise/work-order/list", params);
};

// 企业端工单统计
export const getEntTaskStats = () => {
  return http.get("/api/v1/app/enterprise/work-order/statistics", {});
};

// 企业端查询工单详情
/**
 * @param {String} workOrderId - 工单 ID
 * @returns {Promise} - 工单详情响应体
 * @response {Object} - 工单详情响应体
 * @response {Number} response.code - 状态码，200 表示成功
 * @response {String} response.message - 状态描述
 * @response {Object} response.data - 工单详情数据
 */
export const getEntTaskDetail = (workOrderId) => {
  return http.get(`/api/v1/app/enterprise/work-order/detail/${workOrderId}`);
};

// 企业发布新工单
/**
 * @param {Object} params - 请求参数
 * @param {String} params.title - 工单标题（必填）
 * @param {String} params.priority - 工单优先级（必填），枚举值：URGENT/NORMAL/LOW
 * @param {String} params.type - 工单类型（必填） - INSPECTION/MAINTENANCE/OVERHAUL
 * @param {String} params.estimatedHours - 预估工时（必填），最小1小时
 * @returns {Promise} - 发布工单响应体
 * @response {Object} - 发布工单响应体
 * @response {Number} response.code - 状态码，200 表示成功
 * @response {String} response.message - 状态描述
 * @response {Object} response.data - 工单数据
 * @response {String} response.data.workOrderId - 工单 ID
 */
export const publishTask = (params) => {
  return http.post("/api/v1/app/enterprise/work-order/publish", params);
};

// 接受工单
/**
 * @param {Object} params - 请求参数
 * @param {String} params.workOrderId - 工单 ID
 * @returns {Promise} - 接受工单响应体
 * @response {Object} - 接受工单响应体
 * @response {Number} response.code - 状态码，200 表示成功
 * @response {String} response.message - 状态描述
 * @response {Object} response.data - 空对象
 */
export const acceptTask = (params) => {
  return http.post("/api/v1/app/work-order/accept", params);
};

// 工单详情
/**
 * @param {Object} params - 请求参数
 * @param {String} params.workOrderId - 工单 ID
 * @returns {Promise} - 工单详情响应体
 * @response {Object} - 工单详情响应体
 * @response {Number} response.code - 状态码，200 表示成功
 * @response {String} response.message - 状态描述
 * @response {Object} response.data - 工单详情数据
 */

export const getTaskDetail = (params) => {
  return http.get("/api/v1/app/work-order/detail", params);
};

// 工单统计
/**
 * @param {Object} params - 请求参数
 * @returns {Promise} - 工单统计响应体
 * @response {Object} - 工单统计响应体
 * @response {Number} response.code - 状态码，200 表示成功
 * @response {String} response.message - 状态描述
 * @response {Object} response.data - 工单统计数据
 * @response {Number} response.data.total - 总任务数
 * @response {Number} response.data.processing - 处理中的任务数
 * @response {Number} response.data.pending - 待处理任务数
 * @response {Number} response.data.completed - 已完成任务数
 */

export const getTaskStats = () => {
  return http.get("/api/v1/app/work-order/count", {});
};

// 我的工单分页
/**
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.pageSize - 每页数量
 * @param {String} params.status - 工单状态 - 可选 //ASSIGNED/PROCESSING/COMPLETED
 * @returns {Promise} - 我的工单分页响应体
 * @response {Object} - 我的工单分页响应体
 * @response {Number} response.code - 状态码，200 表示成功
 * @response {String} response.message - 状态描述
 * @response {Object} response.data - 我的工单分页数据
 * @response {Array} response.data.list - 我的工单列表
 * @response {Number} response.data.pagination - 列表分页信息
 * @response {Number} response.data.pagination.total - 总任务数
 * @response {Number} response.data.pagination.page - 当前页码
 * @response {Number} response.data.pagination.pageSize - 每页数量
 */

export const getMyTaskList = (params) => {
  return http.get("/api/v1/app/work-order/my-list", params);
};

// 工程师完成工单
/**
 * @param {Object} params - 请求参数
 * @param {String} params.workOrderId - 工单 ID
 * @returns {Promise} - 完成工单响应体
 * @response {Object} - 完成工单响应体
 * @response {Number} response.code - 状态码，200 表示成功
 * @response {String} response.message - 状态描述
 * @response {Object} response.data - 空对象
 */
export const completeTask = (params) => {
  return http.post("/api/v1/app/work-order/complete", params);
};

// 电工查询当前工单处理详情接口
/**
 * @param {Object} params - 请求参数
 * @param {String} params.workOrderId - 工单 ID
 * @returns {Promise} - 工单处理详情响应体
 * @response {Object} - 工单处理详情响应体
 * @response {Number} response.code - 状态码，200 表示成功
 * @response {String} response.message - 状态描述
 * @response {Object} response.data - 工单处理详情数据
 */
export const getTaskProcessingDetail = (workOrderId) => {
  return http.get(`/api/v1/app/work-order/queryByWorkOrderId/${workOrderId}`);
};

// 电工更新执行状态接口
export const updateTaskExecutionStatus = (params) => {
  return http.post("/api/v1/app/work-order/update-status", params);
};

// 电工更新工单处理结果接口
export const updateTaskProcessingResult = (params) => {
  return http.post("/api/v1/app/work-order/update-result", params);
};

// 电工拒绝工单
export const rejectTask = (params) => {
  return http.post("/api/v1/app/work-order/reject", params);
};