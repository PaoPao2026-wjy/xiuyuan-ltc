import { Order } from "@/api/interface";
import http from "@/api";

// 配置项分页
export const queryTempListApi = (params: Order.ReqTempParams) => {
  return http.get<Order.ResTempList>(`/api/v1/admin/maintenance-templates`, params, { loading: false });
};

// 配置项详情
export const queryTempDetailApi = (id: string) => {
  return http.get<Order.ResTempDetail>(`/api/v1/admin/maintenance-templates/${id}`, {}, { loading: false });
};

// 创建配置项
export const createTempApi = (params: Order.ReqCreateTemp) => {
  return http.post<Order.ResTemp>(`/api/v1/admin/maintenance-templates`, params, { loading: false });
};

// 编辑配置项
export const updateTempApi = (id: string, params: Order.ReqCreateTemp) => {
  return http.put<Order.ResTemp>(`/api/v1/admin/maintenance-templates/${id}`, params, { loading: false });
};

// 删除配置项
export const deleteTempApi = (id: string) => {
  return http.delete<Order.ResTemp>(`/api/v1/admin/maintenance-templates/${id}`, {}, { loading: false });
};

// 创建检查项
export const createTempItemApi = (tempId: string, name: string) => {
  return http.post<Order.TempItem>(`/api/v1/admin/inspection-items/template/${tempId}`, { name }, { loading: false });
};

// 编辑模版检查项
export const updateTempItemApi = (id: string, name: string) => {
  return http.put<Order.TempItem>(`/api/v1/admin/inspection-items/${id}`, { name }, { loading: false });
};

// 删除模版检查项
export const deleteTempItemApi = (id: string) => {
  return http.delete<Order.TempItem>(`/api/v1/admin/inspection-items/${id}`, {}, { loading: false });
};

// 模版检查项详情
export const queryTempItemDetailApi = (id: number) => {
  return http.get<Order.TempItem>(`/api/v1/admin/inspection-items/${id}`, {}, { loading: false });
};

// 根据模板配置项ID查询操作项列表
export const queryItemOperationsApi = (id: number) => {
  return http.get<Order.itemOperations[]>(`/api/v1/admin/operation-items/template/${id}`, {}, { loading: false });
};

// 创建操作项
export const createOperationItemApi = (inspectionItemId: number, params: Order.ReqItemOperations) => {
  return http.post<Order.itemOperations>(`/api/v1/admin/operation-items/template/${inspectionItemId}`, params, {
    loading: false
  });
};

// 编辑操作项
export const updateOperationItemApi = (id: number, params: Order.ReqItemOperations) => {
  return http.put<Order.itemOperations>(`/api/v1/admin/operation-items/${id}`, params, { loading: false });
};
// 删除操作项
export const deleteOperationItemApi = (id: number) => {
  return http.delete<Order.itemOperations>(`/api/v1/admin/operation-items/${id}`, {}, { loading: false });
};

// 统计工单接口
export const queryOrderStatsApi = () => {
  return http.get<Order.ResOrderStats>(`/api/v1/admin/work-orders/statistics`, {}, { loading: false });
};

// 工单分页
export const queryOrderListApi = (params: Order.ReqOrderParams) => {
  return http.get<Order.ResOrder>(`/api/v1/admin/work-orders`, params, { loading: false });
};

// 删除工单
export const deleteOrderApi = (id: number) => {
  return http.delete<Order.ResOrder>(`/api/v1/admin/work-orders/${id}`, {}, { loading: false });
};

// 创建工单
export const createOrderApi = (params: Order.ReqCreateOrder) => {
  return http.post<Order.ResOrder>(`/api/v1/admin/work-orders`, params, { loading: false });
};

// 更新工单
export const updateOrderApi = (id: number, params: Order.ReqCreateOrder) => {
  return http.put<Order.ResOrder>(`/api/v1/admin/work-orders/${id}`, params, { loading: false });
};

// 工单详情
export const queryOrderDetailApi = (id: number) => {
  return http.get<Order.ResOrderDetail>(`/api/v1/admin/work-orders/detail/${id}`, {}, { loading: false });
};

// 指派工程师工单
export const assignEngineerApi = (id: number, params: Order.ReqAssignEngineer) => {
  return http.post<Order.ResOrder>(`/api/v1/admin/work-orders/${id}/assign-auto-accept`, params, { loading: false });
};

// 新建工单草稿箱
export const createOrderDraftApi = (params: Order.ReqCreateOrder) => {
  return http.post<Order.ResOrder>(`/api/v1/admin/work-order-drafts`, params, { loading: false });
};

// 草稿详情
export const queryOrderDraftDetailApi = (id: number) => {
  return http.get<Order.ResOrderDetail>(`/api/v1/admin/work-order-drafts/${id}`, {}, { loading: false });
};

// 更新草稿
export const updateOrderDraftApi = (id: number, params: Order.ReqCreateOrder) => {
  return http.put<Order.ResOrder>(`/api/v1/admin/work-order-drafts/${id}`, params, { loading: false });
};

// 从草稿生成工单
export const generateOrderFromDraftApi = (id: number) => {
  return http.post<Order.ResOrder>(`/api/v1/admin/work-order-drafts/${id}/generate`, {}, { loading: false });
};

// 模版配置项列表包含检查项和操作项
export const queryTempCascaderApi = (params: Order.ReqTempCascader) => {
  return http.get<Order.ResTempDetail[]>(`/api/v1/admin/maintenance-templates/list`, params, { loading: false });
};

// 草稿箱分页
export const queryOrderDraftListApi = (params: Order.ReqDraftParams) => {
  return http.get<Order.ResOrder>(`/api/v1/admin/work-order-drafts`, params, { loading: false });
};

// 删除草稿箱
export const deleteOrderDraftApi = (id: number) => {
  return http.delete<Order.ResOrder>(`/api/v1/admin/work-order-drafts/${id}`, {}, { loading: false });
};

// 草稿箱作废
export const voidOrderDraftApi = (id: number) => {
  return http.put<Order.ResOrder>(`/api/v1/admin/work-order-drafts/${id}/invalidate`, {}, { loading: false });
};

// 草稿生成工单
export const generateOrderApi = (id: number) => {
  return http.post<Order.ResOrder>(`/api/v1/admin/work-order-drafts/${id}/generate`, {}, { loading: false });
};

// 电工分页
export const queryTechnicianListApi = (params: Order.ReqTechnicianParams) => {
  return http.get<Order.ResTechnician>(`/api/v1/admin/technicians`, params, { loading: false });
};

// 工单模版分页
export const queryTemplatesListApi = (params: Order.ReqTemplatesParams) => {
  return http.get<Order.ResTemplatesList>(`/api/v1/admin/work-order-templates`, params, { loading: false });
};

// 创建工单模版
export const createTemplateApi = (params: Order.ReqTemplates) => {
  return http.post<Order.ResTemplates>(`/api/v1/admin/work-order-templates`, params, { loading: false });
};

// 修改工单模版
export const updateTemplateApi = (id: number, params: Order.ReqTemplates) => {
  return http.put<Order.ResTemplates>(`/api/v1/admin/work-order-templates/${id}`, params, { loading: false });
};

// 删除工单模版
export const deleteTemplateApi = (id: string) => {
  return http.delete<Order.ResTemplates>(`/api/v1/admin/work-order-templates/${id}`, {}, { loading: false });
};

// 工单模版详情
export const queryTemplateDetailApi = (id: number) => {
  return http.get<Order.ResTemplates>(`/api/v1/admin/work-order-templates/${id}`, {}, { loading: false });
};

// 工单模版列表
export const queryTemplateListApi = () => {
  return http.get<Order.ResTemplate[]>(`/api/v1/admin/work-order-templates/list/all`, {}, { loading: false });
};
