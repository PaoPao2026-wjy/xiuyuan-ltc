import http from "@/api";
import { Equipment } from "@/api/interface";

// 设备模版分页查询
export const queryEquipmentTemListApi = (params: Equipment.ReqEquipmentParams) => {
  return http.get<Equipment.ResEquipmentList>(`/api/v1/admin/equipment-templates`, params, { loading: false });
};

// 删除设备模版
export const deleteEquipmentTemApi = (id: string) => {
  return http.delete<Equipment.ResEquipment>(`/api/v1/admin/equipment-templates/${id}`, {}, { loading: false });
};

// 创建设备模版
export const createEquipmentTemApi = (params: Equipment.ReqCreateEquipmentTem) => {
  return http.post<Equipment.ResEquipment>(`/api/v1/admin/equipment-templates`, params, { loading: false });
};

// 更新设备模版
export const updateEquipmentTemApi = (id: string, params: Equipment.ReqCreateEquipmentTem) => {
  return http.put<Equipment.ResEquipment>(`/api/v1/admin/equipment-templates/${id}`, params, { loading: false });
};

// 设备模版详情
export const queryEquipmentTemDetailApi = (id: string) => {
  return http.get<Equipment.ResEquipment>(`/api/v1/admin/equipment-templates/${id}`, {}, { loading: false });
};

// 根据设备类型查询设备模版列表
export const queryEquipmentTemListByTypeApi = (type: string) => {
  return http.get<Equipment.ResEquipmentTem[]>(`/api/v1/admin/equipments/default/template`, { type }, { loading: false });
};

// 设备信息分页查询
export const queryEquipmentListApi = (params: Equipment.ReqEquipmentListParams) => {
  return http.get<Equipment.ResEquipmentList>(`/api/v1/admin/equipments`, params, { loading: false });
};

// 删除设备信息
export const deleteEquipmentApi = (id: string) => {
  return http.delete<Equipment.ResEquipment>(`/api/v1/admin/equipments/${id}`, {}, { loading: false });
};

// 新增设备信息
export const createEquipmentApi = (params: Equipment.ReqCreateEquipment) => {
  return http.post<Equipment.ResEquipment>(`/api/v1/admin/equipments`, params, { loading: false });
};

// 更新设备信息
export const updateEquipmentApi = (id: string, params: Equipment.ReqCreateEquipment) => {
  return http.put<Equipment.ResEquipment>(`/api/v1/admin/equipments/${id}`, params, { loading: false });
};

// 设备信息详情
export const queryEquipmentDetailApi = (id: string) => {
  return http.get<Equipment.ResEquipment>(`/api/v1/admin/equipments/${id}`, {}, { loading: false });
};
