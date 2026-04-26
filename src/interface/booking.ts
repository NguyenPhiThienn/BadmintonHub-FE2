export interface IBookingDetail {
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  price?: number;
}

export interface IBookingRequest {
  playerId?: string;
  venueId: string;
  promotionId?: string;
  details: IBookingDetail[];
  totalPrice?: number;
  finalPrice?: number;
}

export interface IBookingResponse {
  _id: string;
  playerId: string;
  venueId: string;
  venueName?: string;
  totalPrice: number;
  finalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

export interface IVoucherCheckRequest {
  code: string;
  venueId: string;
}

export interface IVoucherCheckResponse {
  isValid: boolean;
  discountAmount: number;
  message: string;
}

export interface IPaymentRequest {
  bookingId: string;
  method: "VNPAY" | "MOMO" | "CASH";
}

export interface IPaymentResponse {
  paymentUrl?: string;
}
