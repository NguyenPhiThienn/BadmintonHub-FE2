import { adminApi } from "@/api/admin";
import { useQuery } from "@tanstack/react-query";

export const useSummaryStats = (params?: { year?: number; month?: number }) => {
  return useQuery({
    queryKey: ["admin", "summary", params],
    queryFn: () => adminApi.getSummaryStats(params),
  });
};

export const useChartData = (type: string = "revenue", period: string = "month") => {
  return useQuery({
    queryKey: ["admin", "charts", type, period],
    queryFn: () => adminApi.getChartData({ type, period }),
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useAdminRevenueReport = (params: { page?: number; limit?: number; method?: string; ownerId?: string; venueId?: string; startDate?: string; endDate?: string; search?: string }) => {
  return useQuery({
    queryKey: ["admin", "revenue-report", params],
    queryFn: () => adminApi.getRevenueReport(params),
  });
};

export const useAdminOverview = (params?: any) => {
  return useQuery({
    queryKey: ["admin", "overview", params],
    queryFn: () => adminApi.getOverview(params),
  });
};

export const useAdminPendingActions = () => {
  return useQuery({
    queryKey: ["admin", "pending-actions"],
    queryFn: () => adminApi.getPendingActions(),
    refetchInterval: 60000, // auto refetch every minute
  });
};

export const useAdminChartDataV2 = (params?: any) => {
  return useQuery({
    queryKey: ["admin", "chartDataV2", params],
    queryFn: () => adminApi.getAdminChartData(params),
  });
};

export const useAdminLeaderboards = (params?: any) => {
  return useQuery({
    queryKey: ["admin", "leaderboards", params],
    queryFn: () => adminApi.getLeaderboards(params),
  });
};
