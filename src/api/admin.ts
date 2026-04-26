import { IAdminDashboardResponse, IChartData, ISummaryStats } from "@/interface/admin";
import { sendGet } from "./axios";

export const adminApi = {
  getSummaryStats: (): Promise<IAdminDashboardResponse<ISummaryStats>> => 
    sendGet("/admin/dashboard/summary"),
  
  getChartData: (params: { type?: string; period?: string }): Promise<IAdminDashboardResponse<IChartData>> => 
    sendGet("/admin/dashboard/charts", params),
};
