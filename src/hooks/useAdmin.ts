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
