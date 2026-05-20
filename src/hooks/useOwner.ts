import { bookingApi } from "@/api/booking";
import { ownerApi } from "@/api/owner";
import { IOwnerBookingQuery } from "@/interface/booking";
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

export const useOwnerBookings = (params: IOwnerBookingQuery) => {
  return useQuery({
    queryKey: ["owner-bookings", params],
    queryFn: () => bookingApi.getOwnerBookings(params),
    refetchInterval: 4000,
  });
};

export const usePredictRevenue = (params?: { venueId?: string }) => {
  return useQuery({
    queryKey: ["owner", "predict-revenue", params],
    queryFn: () => ownerApi.getPredictRevenue(params),
    enabled: false, // Don't fetch automatically
  });
};

export const useOwnerRevenueReport = (params?: {
  page?: number;
  limit?: number;
  venueId?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  ownerId?: string;

}) => {
  return useQuery({
    queryKey: ["owner", "revenue-report", params],
    queryFn: () => ownerApi.getOwnerRevenueReport(params),
  });
};
