export interface IBooking {
  _id?: string;
  userId?: string;
  venueId?: string;
  courtId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  totalPrice?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBookingResponse {
  data: IBooking;
  message?: string;
}

export interface IBookingsListResponse {
  data: IBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  bookings: IBooking[];
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface IBookingDetail {
  courtId: string | ICourt;
  bookingDate: string;
  startTime: string;
  endTime: string;
  price?: number;
}

export interface IPaymentInfo {
  method?: string;
  status?: string;
  transactionId?: string;
  refundInfo?: IRefundInfo;
}

export interface IRefundInfo {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  reason?: string;
}

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "LATE_ARRIVAL"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface IBookingRequest {
  venueId: string;
  details: {
    courtId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
  }[];
  note?: string;
  isWeekly?: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  couponId?: string;
}

export interface IManualBookingRequest {
  type?: string;
  venueId: string;
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone?: string;
  note?: string;
}

export interface IUpdateBookingStatusRequest {
  status: string;
  cancelReason?: string;
  paymentStatus?: string;
  cancelBy?: string;
}

export interface IAdminBookingQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  venueId?: string;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface IMyStatistics {
  totalHours: number;
  totalBookings: number;
  totalSpent: number;
}
