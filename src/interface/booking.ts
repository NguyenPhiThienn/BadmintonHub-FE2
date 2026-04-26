export interface IBookingDetail {
  courtId: {
    _id: string;
    name?: string;
  } | string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  price?: number;
}

export interface IBookingUser {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface IBookingVenue {
  _id: string;
  name?: string;
  address?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface IBooking {
  _id: string;
  playerId: IBookingUser | string;
  venueId: IBookingVenue | string;
  details: IBookingDetail[];
  totalPrice: number;
  finalPrice?: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface IBookingRequest {
  playerId?: string;
  venueId: string;
  promotionId?: string;
  details: Omit<IBookingDetail, 'courtId'>[] & { courtId: string }[];
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
  status: BookingStatus;
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

export interface IAdminBookingQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  userId?: string;
  venueId?: string;
}

export interface IUpdateBookingStatusRequest {
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}
