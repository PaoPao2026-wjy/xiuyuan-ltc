import http from "../index.js";

// 电工设备列表
export async function getEquipmentList(data) {
  return http.get("/api/v1/app/equipments", data);
}

// 电工新增设备信息
export async function addEquipment(data) {
  return http.post("/api/v1/app/equipments", data);
}

// 设备信息详情
export async function getEquipment(id) {
  return http.get("/api/v1/app/equipments/" + id);
}

// 更新设备信息
export async function updateEquipment(id, data) {
  return http.put("/api/v1/app/equipments/" + id, data);
}

// 根据设备模版类型查询默认模版
export async function getDefaultTemplate(data) {
  return http.get("/api/v1/app/equipments/default/template", data);
}
