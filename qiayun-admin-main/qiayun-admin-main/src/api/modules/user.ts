import { User } from "@/api/interface";
import http from "@/api";

// 查询用户管理分页
export const queryUserListApi = (params: User.ReqUserParams) => {
  return http.get<User.ResUser>(`/api/v1/admin/users`, params, { loading: false });
};
