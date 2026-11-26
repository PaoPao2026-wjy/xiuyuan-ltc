import { Technician } from "@/api/interface";
import http from "@/api";

// 电工分页
export const queryTechnicianListApi = (params: Technician.ReqTechnicianParams) => {
  return http.get<Technician.ResTechnician>(`/api/v1/admin/technicians`, params, { loading: false });
};

// 电工详情
export const queryTechnicianDetailApi = (id: string) => {
  return http.get<Technician.ResTechnicianItem>(`/api/v1/admin/technicians/${id}`, {}, { loading: false });
};

// 电工积分日志分页接口
export const queryTechnicianPointsLogListApi = (id: string, params: Technician.ReqTechnicianLogParams) => {
  return http.get<Technician.ResTechnicianPoint>(`/api/v1/admin/technicians/${id}/points-logs`, params, { loading: false });
};
