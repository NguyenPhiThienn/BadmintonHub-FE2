import { adminBookingApi, bookingApi, paymentApi, promotionApi } from "@/api/booking";
import {
  IAdminBookingQuery,
  IBookingRequest,
  IManualBookingRequest,
  IUpdateBookingStatusRequest
} from "@/interface/booking";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IBookingRequest) => bookingApi.createBooking(data),
    onSuccess: () => {
      // Trigger auto-refresh for availability and venue data
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["venue"] });
      queryClient.invalidateQueries({ queryKey: ["courts"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
};

export const useBookingDetails = (id: string) => {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingApi.getBookingDetails(id),
    enabled: !!id,
  });
};

export const useMyBookings = (params: { page?: number; limit?: number; status?: string; search?: string; isWeekly?: string | boolean; paymentMethod?: string }) => {
  return useQuery({
    queryKey: ["my-bookings", params],
    queryFn: () => bookingApi.getMyBookings(params),
    refetchInterval: 4000,
  });
};

export const useVenueBookings = (venueId: string, params: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["venue-bookings", venueId, params],
    queryFn: () => bookingApi.getVenueBookings(venueId, params),
    enabled: !!venueId,
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateBookingStatusRequest }) =>
      bookingApi.updateBookingStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      queryClient.invalidateQueries({ queryKey: ["booking-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "charts"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "revenue"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "revenue-chart"] });
      queryClient.invalidateQueries({ queryKey: ["owner", "occupancy"] });
      
      // Only trigger venue/availability refetch when booking is CANCELLED
      if (variables.data.status === 'CANCELLED') {
        queryClient.invalidateQueries({ queryKey: ["availability"] });
        queryClient.invalidateQueries({ queryKey: ["venue"] });
        queryClient.invalidateQueries({ queryKey: ["courts"] });
      }
    },
  });
};

export const useAdminBookings = (params: IAdminBookingQuery) => {
  return useQuery({
    queryKey: ["admin-bookings", params],
    queryFn: () => adminBookingApi.getAllBookings(params),
    refetchInterval: 4000,
  });
};

export const useCheckVoucher = () => {
  return useMutation({
    mutationFn: (params: { code: string; venueId: string }) =>
      promotionApi.checkVoucher(params),
  });
};

export const useCreatePaymentUrl = () => {
  return useMutation({
    mutationFn: (data: { bookingId: string; method: "VNPAY" | "CASH" }) =>
      paymentApi.createPaymentUrl(data),
  });
};

export const useCreateManualBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IManualBookingRequest) => bookingApi.createManualBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-calendar"] });
      // Trigger auto-refetch for availability and venue details
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["venue"] });
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
};

export const useBookingCalendar = (venueId: string, params: { date: string }) => {
  return useQuery({
    queryKey: ["booking-calendar", venueId, params],
    queryFn: () => bookingApi.getBookingCalendar(venueId, params),
    enabled: !!venueId && !!params.date,
  });
};

export const useMyStatistics = () => {
  return useQuery({
    queryKey: ["my-statistics"],
    queryFn: () => bookingApi.getMyStatistics(),
  });
};

export const useRequestRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { bankName: string; accountNumber: string; accountName: string; reason: string } }) =>
      bookingApi.requestRefund(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
};

export const useAvailableCoupons = (venueId: string) => {
  return useQuery({
    queryKey: ["available-coupons", venueId],
    queryFn: () => bookingApi.getAvailableCoupons(venueId),
    enabled: !!venueId,
  });
};

export const useConfirmRefundSuccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentApi.confirmRefundSuccess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    },
  });
};
