import { sendGet } from "./axios";

export const ownerApi = {
  getRevenueStats: (params?: { venueId?: string }) =>
    sendGet("/dashboard/revenue", params),

  getOccupancyStats: (params?: { venueId?: string }) =>
    sendGet("/dashboard/occupancy-rate", params),

  getRevenueChart: (params?: {
    venueId?: string;
    startDate?: string;
    endDate?: string;
    method?: string;
  }) => sendGet("/dashboard/revenue-chart", params),

  getPredictRevenue: (params?: { venueId?: string }) =>
    sendGet("/dashboard/predict-revenue", params),

  getOwnerRevenueReport: (params?: {
    page?: number;
    limit?: number;
    venueId?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    ownerId?: string;
    search?: string;
  }) =>
    sendGet("/dashboard/revenue-report", params),

  getOverview: (params?: { venueId?: string }) =>
    sendGet("/dashboard/overview", params),

  getRecentBookings: (params?: { venueId?: string }) =>
    sendGet("/dashboard/recent-bookings", params),

  getTopCustomers: (params?: { venueId?: string }) =>
    sendGet("/dashboard/top-customers", params),

  getPeakHours: (params?: { venueId?: string }) =>
    sendGet("/dashboard/peak-hours", params),
};
