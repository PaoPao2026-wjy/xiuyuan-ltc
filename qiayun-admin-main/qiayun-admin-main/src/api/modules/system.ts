import { System } from "@/api/interface";
import http from "@/api";

// 查询用户管理分页列表
export const queryUserListApi = (params: System.ReqSystemUserParams) => {
  return http.get<System.ResSystemUserList>(`/api/v1/admin/users`, params, { loading: false });
};

// 创建用户
export const createUserApi = (params: System.ReqSystemUserForm) => {
  return http.post<System.ResUserList>(`/api/v1/admin/users`, params, { loading: false });
};

// 更新用户
export const updateUserApi = (params: System.ReqUpdateSystemUserForm) => {
  return http.put<System.ResUserList>(`/api/v1/admin/users/${params.id}`, params, { loading: false });
};

// 删除用户
export const deleteUserApi = (id: number) => {
  return http.delete<System.ResUserList>(`/api/v1/admin/users/${id}`, { loading: false });
};
