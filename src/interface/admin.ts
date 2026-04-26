export interface IStatCardData {
  value: number;
  currency?: string;
  unit?: string;
  growth: number;
  trend: "up" | "down";
  sparkline: number[];
}

export interface ISummaryStats {
  totalRevenue: IStatCardData;
  totalBookings: IStatCardData;
  newUsers: IStatCardData;
  occupancyRate: IStatCardData;
}

export interface IChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderDash?: number[];
}

export interface IChartData {
  labels: string[];
  datasets: IChartDataset[];
}

export interface IAdminDashboardResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    apiVersion: string;
  };
}
