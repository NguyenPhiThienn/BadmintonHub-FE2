export interface IOwnerBookingQuery {
  page?: number;
  limit?: number;
  venueId?: string;
  status?: string;
  search?: string;
}

export interface IOccupancyData {
  date: string;
  occupancyRate: number;
}

export interface ITopCustomer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
  completedBookings: number;
}

export interface ITopCustomersResponse {
  topVIPs: ITopCustomer[];
  topRisks: ITopCustomer[];
}

export interface IOwnerRevenueReport {
  _id: string;
  date: string;
  revenue: number;
  count: number;
}

export interface IOwnerOverviewStats {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  activeVenues: number;
  pendingBookings: number;
}

export interface IPeakHour {
  hour: number;
  count: number;
}

export interface IPredictRevenue {
  predictedRevenue: number;
  confidence: number;
  period: string;
}
