import { useMutation, useQuery } from "@tanstack/react-query";
import { bookingApi, promotionApi, paymentApi } from "@/api/booking";
import { 
  IBookingRequest, 
  IVoucherCheckRequest, 
  IPaymentRequest 
} from "@/interface/booking";

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: (data: IBookingRequest) => bookingApi.createBooking(data),
  });
};

export const useCheckVoucher = () => {
  return useMutation({
    mutationFn: (data: IVoucherCheckRequest) => promotionApi.checkVoucher(data),
  });
};

export const useCreatePaymentUrl = () => {
  return useMutation({
    mutationFn: (data: IPaymentRequest) => paymentApi.createPaymentUrl(data),
  });
};
