import {
  IAdminBookingQuery,
  IBookingRequest,
  IManualBookingRequest,
  IOwnerBookingQuery,
  IUpdateBookingStatusRequest
} from "@/interface/booking";
import { sendGet, sendPost, sendPut } from "./axios";

export const bookingApi = {
  createBooking: (data: IBookingRequest) =>
    sendPost("/bookings", data),
  getBookingDetails: (id: string) =>
    sendGet(`/bookings/${id}`),
  getMyBookings: (params: { page?: number; limit?: number; status?: string; search?: string; isWeekly?: string | boolean; paymentMethod?: string }) =>
    sendGet("/bookings/my-bookings", params),
  getVenueBookings: (venueId: string, params: { page?: number; limit?: number }) =>
    sendGet(`/bookings/venue/${venueId}`, params),
  updateBookingStatus: (id: string, data: IUpdateBookingStatusRequest) =>
    sendPut(`/bookings/${id}/status`, data),
  getOwnerBookings: (params: IOwnerBookingQuery) =>
    sendGet("/bookings/owner/all", params),
  createManualBooking: (data: IManualBookingRequest) =>
    sendPost("/bookings/manual", data),
  getBookingCalendar: (venueId: string, params: { date: string }) =>
    sendGet(`/bookings/calendar/${venueId}`, params),
  getMyStatistics: () =>
    sendGet("/bookings/my-statistics"),
  requestRefund: (id: string, data: { bankName: string; accountNumber: string; accountName: string; reason: string }) =>
    sendPost(`/bookings/${id}/refund-request`, data),
  getAvailableCoupons: (venueId: string) =>
    sendGet(`/bookings/available-coupons/${venueId}`),
};

export const adminBookingApi = {
  getAllBookings: (params: IAdminBookingQuery) =>
    sendGet("/admin/bookings", params),
};

export const promotionApi = {
  checkVoucher: (params: { code: string; venueId: string }) =>
    sendGet("/promotions/valid", params),
};

export const paymentApi = {
  createPaymentUrl: (data: { bookingId: string; method: "VNPAY" | "CASH" }) =>
    sendPost("/payments/create-url", data),
  confirmRefundSuccess: (bookingId: string) =>
    sendPost(`/payments/${bookingId}/refund-success`, {}),
};
