import { IAIRecommendationRequest } from "@/interface/venue";
import { sendDelete, sendGet, sendPatch, sendPost, sendPut } from "./axios";

export const venueApi = {
  getVenues: (params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    search?: string;
    sortBy?: string;
    lat?: number;
    lng?: number;
    minPrice?: number;
    maxPrice?: number;
    ownerId?: string;
  }) =>
    sendGet("/venues", params),
  
  getMyVenues: (params?: { page?: number; limit?: number; search?: string; sortBy?: string }) =>
    sendGet("/venues/my-venues", params),

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

  getAiBookingRecommendation: (venueId: string) =>
    sendGet("/ai/booking-recommendation", { venueId }),

  // Admin specific
  getAdminVenues: (params?: { page?: number; limit?: number; status?: string; search?: string; sortBy?: string }) =>
    sendGet("/admin/venues", {
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      status: params?.status,
      sortBy: params?.sortBy,
    }),

  updateVenueStatus: (id: string, data: { status: string; reason?: string }) =>
    sendPatch(`/admin/venues/${id}/status`, data),

  deleteVenue: (id: string) =>
    sendDelete(`/venues/${id}`),

  createVenue: (data: any) =>
    sendPost("/venues", data),

  updateVenue: (id: string, data: any) =>
    sendPut(`/venues/${id}`, data),

  addVenueImage: (id: string, data: { imageUrl: string; isPrimary: boolean }) =>
    sendPost(`/venues/${id}/images`, data),
};
