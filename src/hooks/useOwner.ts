import { bookingApi } from "@/api/booking";
import { ownerApi } from "@/api/owner";
import { IOwnerBookingQuery } from "@/interface/booking";
import { useQuery } from "@tanstack/react-query";

export const useRevenueStats = (params?: {
  venueId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ["owner", "revenue", params],
    queryFn: () => ownerApi.getRevenueStats(params),
    refetchInterval: 4000,
  });
};

export const useRevenueChart = (params?: {
  venueId?: string;
  startDate?: string;
  endDate?: string;
  method?: string;
}) => {
  return useQuery({
    queryKey: ["owner", "revenue-chart", params],
    queryFn: () => ownerApi.getRevenueChart(params),
    refetchInterval: 4000,
  });
};

export const useOccupancyStats = (params?: {
  venueId?: string;
  startDate?: string;
  endDate?: string;
}) => {
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
  search?: string;
}) => {
  return useQuery({
    queryKey: ["owner", "revenue-report", params],
    queryFn: () => ownerApi.getOwnerRevenueReport(params),
    refetchInterval: 4000,
  });
};

export const useOverviewStats = (params?: { venueId?: string }) => {
  return useQuery({
    queryKey: ["owner", "overview", params],
    queryFn: () => ownerApi.getOverview(params),
    refetchInterval: 5000,
  });
};

export const useRecentBookings = (params?: { venueId?: string }) => {
  return useQuery({
    queryKey: ["owner", "recent-bookings", params],
    queryFn: () => ownerApi.getRecentBookings(params),
    refetchInterval: 5000,
  });
};

export const useTopCustomers = (params?: { venueId?: string }) => {
  return useQuery({
    queryKey: ["owner", "top-customers", params],
    queryFn: () => ownerApi.getTopCustomers(params),
    refetchInterval: 10000,
  });
};

export const usePeakHours = (params?: { venueId?: string }) => {
  return useQuery({
    queryKey: ["owner", "peak-hours", params],
    queryFn: () => ownerApi.getPeakHours(params),
  });
};
