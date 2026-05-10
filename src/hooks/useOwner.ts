import { ownerApi } from "@/api/owner";
import { useQuery } from "@tanstack/react-query";

export const useRevenueStats = (params?: { venueId?: string }) => {
  return useQuery({
    queryKey: ["owner", "revenue", params],
    queryFn: () => ownerApi.getRevenueStats(params),
  });
};

export const useOccupancyStats = (params?: { venueId?: string }) => {
  return useQuery({
    queryKey: ["owner", "occupancy", params],
    queryFn: () => ownerApi.getOccupancyStats(params),
  });
};
