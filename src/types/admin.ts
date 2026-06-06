export interface ISummaryStats {
  totalUsers: number;
  totalOwners: number;
  totalVenues: number;
  totalBookings: number;
  totalRevenue: number;
  pendingVenues: number;
  activeUsers: number;
  blockedUsers: number;
}

export interface IChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface IChartData {
  revenue: IChartDataPoint[];
  bookings: IChartDataPoint[];
  users: IChartDataPoint[];
}

export interface IAdminDashboardResponse<T> {
  statusCode?: number;
  data: T;
  message?: string;
}

export interface IAdminSummaryStats extends ISummaryStats {
  growth?: {
    users: number;
    bookings: number;
    revenue: number;
  };
}

export interface IRevenueReportItem {
  date: string;
  revenue: number;
  count: number;
  method?: string;
  venueName?: string;
}

export interface ILeaderboardItem {
  _id: string;
  name: string;
  value: number;
  type: string;
}
