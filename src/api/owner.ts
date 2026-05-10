import { sendGet } from "./axios";

export const ownerApi = {
  getRevenueStats: (params?: { venueId?: string }) =>
    sendGet("/dashboard/revenue", params),

  getOccupancyStats: (params?: { venueId?: string }) =>
    sendGet("/dashboard/bookings", params),

  getPredictRevenue: (params?: { venueId?: string }) =>
    sendGet("/dashboard/predict-revenue", params),
};
