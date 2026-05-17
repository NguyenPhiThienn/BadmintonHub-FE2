import { adminApi } from "@/api/admin";
import { useQuery } from "@tanstack/react-query";

export const useSummaryStats = () => {
  return useQuery({
    queryKey: ["admin", "summary"],
    queryFn: () => adminApi.getSummaryStats(),
  });
};

export const useChartData = (type: string = "revenue", period: string = "month") => {
  return useQuery({
    queryKey: ["admin", "charts", type, period],
    queryFn: () => adminApi.getChartData({ type, period }),
  });
};

export const useAdminRevenueReport = (params: { page?: number; limit?: number; method?: string; ownerId?: string; venueId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ["admin", "revenue-report", params],
    queryFn: () => adminApi.getRevenueReport(params),
  });
};
