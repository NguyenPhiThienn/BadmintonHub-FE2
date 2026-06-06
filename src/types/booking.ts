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

// Recurring Booking Types
export type RecurringType = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type RecurringStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED';
export type PaymentScheduleType = 'FULL' | 'MONTHLY';

export interface IRecurringScheduleItem {
  occurrence: number;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface IRecurringBookingPreview {
  schedule: IRecurringScheduleItem[];
  totalAmount: number;
  perOccurrenceAmount: number;
  totalOccurrences: number;
}

export interface IRecurringBooking {
  _id?: string;
  playerId?: string;
  venueId?: string | IVenue;
  courtId?: string | ICourt;
  type?: RecurringType;
  occurrences?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  paymentSchedule?: PaymentScheduleType;
  totalAmount?: number;
  totalPerOccurrence?: number;
  status?: RecurringStatus;
  isActive?: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  bookingIds?: string[];
  bookings?: IBooking[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IRecurringBookingCreateRequest {
  venueId: string;
  courtId: string;
  type: RecurringType;
  occurrences: number;
  startDate: string;
  startTime: string;
  endTime: string;
  paymentSchedule: PaymentScheduleType;
  couponCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface IRecurringBookingResponse {
  recurringBookingId?: string;
  schedule?: IRecurringScheduleItem[];
  totalAmount?: number;
  perOccurrenceAmount?: number;
  paymentSchedule?: PaymentScheduleType;
  bookingIds?: string[];
  bookings?: IBooking[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
