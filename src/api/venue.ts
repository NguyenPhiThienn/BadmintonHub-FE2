import { sendGet, sendPost, sendPatch } from "./axios";
import { IVenueResponse, IAIRecommendationRequest, IAIRecommendationResponse } from "@/interface/venue";

export const venueApi = {
  getVenues: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    sendGet("/venues", params),

  getVenueById: (id: string) =>
    sendGet(`/venues/${id}`),

  getCourts: (venueId: string) =>
    sendGet(`/venues/${venueId}/courts`),

  getAvailability: (params: { courtId?: string; venueId?: string; date: string }) =>
    sendGet("/availability", params),

  getPricing: (venueId: string) =>
    sendGet(`/venues/${venueId}/pricing`),

  getAiRecommendations: (data: IAIRecommendationRequest) =>
    sendPost("/ai/recommendations", data),

  getDemandAnalytics: (params: { venueId: string }) =>
    sendGet("/ai/analytics/demand", params),

  // Admin specific
  getPendingVenues: (params?: { page?: number; limit?: number }) =>
    sendGet("/admin/venues/pending", params),

  updateVenueStatus: (id: string, data: { status: string; reason?: string }) =>
    sendPatch(`/admin/venues/${id}/status`, data),
};
