export interface ISummaryStats {
  revenue: number;
  bookings: number;
  users: {
    total: number;
    players: number;
    owners: number;
  };
  venues: number;
  occupancyRate: number;
}

export interface IChartItem {
  _id: string;
  value: number;
}

export type IChartData = IChartItem[];

export interface IAdminDashboardResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    apiVersion: string;
  };
}
