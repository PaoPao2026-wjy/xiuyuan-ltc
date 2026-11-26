import { Company } from "@/api/interface";
import http from "@/api";

// 查询企业分页列表
export const queryCompanyListApi = (params: Company.ReqCompanyParams) => {
  return http.get<Company.ResCompanyList>(`/api/v1/admin/enterprises`, params, { loading: false });
};

// 创建企业
export const createCompanyApi = (params: Company.ReqCreateCompanyParams) => {
  return http.post<Company.ResCreateCompany>(`/api/v1/admin/enterprises`, params, { loading: false });
};

// 修改企业
export const updateCompanyApi = (params: Company.ReqUpdateCompanyParams) => {
  return http.put<Company.ResCreateCompany>(`/api/v1/admin/enterprises/${params.id}`, params, { loading: false });
};

// 查询企业详情
export const queryCompanyDetailApi = (id: string) => {
  return http.get<Company.ResCompany>(`/api/v1/admin/enterprises/${id}`, {}, { loading: false });
};

// 删除企业
export const deleteCompanyApi = (id: string) => {
  return http.delete<Company.ResCompany>(`/api/v1/admin/enterprises/${id}`, {}, { loading: false });
};

// 查询所有企业
export const queryAllCompanyApi = () => {
  return http.get<Company.ResCompanyList>(`/api/v1/admin/enterprises/all`, {}, { loading: false });
};
