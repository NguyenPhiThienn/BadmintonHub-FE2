import { sendGet, sendPost } from "./axios";
import {
  IBookingRequest,
  IBookingResponse,
  IVoucherCheckRequest,
  IVoucherCheckResponse,
  IPaymentRequest,
  IPaymentResponse
} from "@/interface/booking";

export const bookingApi = {
  createBooking: (data: IBookingRequest) =>
    sendPost("/bookings", data),
  getBookingDetails: (id: string) =>
    sendGet(`/bookings/${id}`),
};

export const promotionApi = {
  checkVoucher: (params: IVoucherCheckRequest) =>
    sendGet("/promotions/valid", params),
};

export const paymentApi = {
  createPaymentUrl: (data: IPaymentRequest) =>
    sendPost("/payments/create-url", data),
};
