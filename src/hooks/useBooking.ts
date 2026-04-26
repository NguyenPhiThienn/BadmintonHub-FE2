import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingApi, adminBookingApi, promotionApi, paymentApi } from "@/api/booking";
import {
  IBookingRequest,
  IAdminBookingQuery,
  IUpdateBookingStatusRequest,
} from "@/interface/booking";

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: (data: IBookingRequest) => bookingApi.createBooking(data),
  });
};

export const useBookingDetails = (id: string) => {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingApi.getBookingDetails(id),
    enabled: !!id,
  });
};

export const useMyBookings = (params: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["my-bookings", params],
    queryFn: () => bookingApi.getMyBookings(params),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    },
  });
};

export const useAdminBookings = (params: IAdminBookingQuery) => {
  return useQuery({
    queryKey: ["admin-bookings", params],
    queryFn: () => adminBookingApi.getAllBookings(params),
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
    mutationFn: (data: { bookingId: string; method: "VNPAY" | "MOMO" | "CASH" }) =>
      paymentApi.createPaymentUrl(data),
  });
};
