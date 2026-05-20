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

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

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
  isWeekly?: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface IBookingRequest {
  playerId?: string;
  venueId: string;
  promotionId?: string;
  details: Omit<IBookingDetail, 'courtId'>[] & { courtId: string }[];
  totalPrice?: number;
  finalPrice?: number;
  isWeekly?: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
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
  method: "VNPAY" | "CASH";
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

export interface IManualBookingRequest {
  type: "BOOKING" | "LOCK";
  venueId: string;
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  customerName?: string;
  customerPhone?: string;
  note?: string;
}

export interface IBookingCalendarEvent {
  type: "BOOKING" | "LOCK";
  startTime: string;
  endTime: string;
  status: string;
  customerName?: string;
  reason?: string;
}

export interface IBookingCalendarResponse {
  courtId: string;
  courtName: string;
  events: IBookingCalendarEvent[];
}

export interface IOwnerBookingQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  venueId?: string;
  search?: string;
}
