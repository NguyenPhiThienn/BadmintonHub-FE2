import { IAdminDashboardResponse, IChartData, ISummaryStats } from "@/types/admin";
import { sendGet } from "./axios";

export const adminApi = {
  getSummaryStats: (params?: { year?: number; month?: number }): Promise<IAdminDashboardResponse<ISummaryStats>> =>
    sendGet("/admin/dashboard/summary", params),
  
  getChartData: (params: { type?: string; period?: string }): Promise<IAdminDashboardResponse<IChartData>> => 
    sendGet("/admin/dashboard/charts", params),

  getRevenueReport: (params: { page?: number; limit?: number; method?: string; ownerId?: string; venueId?: string; startDate?: string; endDate?: string }): Promise<any> =>
    sendGet("/admin/dashboard/revenue-report", params),

  getOverview: (params?: any): Promise<any> => sendGet("/admin/dashboard/overview", params),
  getPendingActions: (): Promise<any> => sendGet("/admin/dashboard/pending-actions"),
  getAdminChartData: (params?: any): Promise<any> => sendGet("/admin/dashboard/chart", params),
  getLeaderboards: (params?: any): Promise<any> => sendGet("/admin/dashboard/leaderboards", params),
};
