import http from "../index.js";

// 注册登录
export async function login(data) {
  return http.post("/api/v1/app/auth/register-login", data);
}

// 个人信息详情
export async function getUserInfo() {
  return http.get("/api/v1/app/technician/detail");
}

// 企业相关信息详情
export async function getCompanyUserInfo() {
  return http.get("/api/v1/app/enterprises/my-wechat");
}

// 更新企业相关信息
export async function updateCompanyUserInfo(data) {
  return http.put("/api/v1/app/enterprises/my-wechat", data);
}


// 更新个人信息
export async function updateUserInfo(data) {
  return http.put("/api/v1/app/technician/update", data);
}

// 查询企业相关信息
export async function getCompanyInfo() {
  return http.get("/api/v1/app/enterprises/my");
}

// 电工录入企业信息
export async function addCompany(data) {
  return http.post("/api/v1/app/enterprises/bind", data);
}

// 更新企业信息
export async function updateCompany(data) {
  return http.put(`/api/v1/app/enterprises/my`, data);
}
