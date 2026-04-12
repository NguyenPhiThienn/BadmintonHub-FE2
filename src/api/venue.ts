import { sendGet, sendPost } from "./axios";
import { IVenueResponse, IAIRecommendationRequest, IAIRecommendationResponse } from "@/interface/venue";

export const venueApi = {
  getVenues: (params?: { keyword?: string; lat?: number; lng?: number; limit?: number }) =>
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
};
