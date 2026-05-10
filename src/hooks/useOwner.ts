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
