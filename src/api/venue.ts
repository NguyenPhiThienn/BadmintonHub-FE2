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
  
  getMyVenues: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; status?: string }) =>
    sendGet("/venues/my-venues", params),

  getVenueById: (id: string) =>
    sendGet(`/venues/${id}`),

  getCourts: (venueId: string) =>
    sendGet(`/venues/${venueId}/courts`),

  getAvailability: (params: { courtId?: string; venueId?: string; date: string; userId?: string }) =>
    sendGet("/availability", params),

  lockSlot: (data: { courtId: string; date: string; startTime: string; userId: string }) =>
    sendPost("/availability/lock", data),

  unlockSlot: (data: { courtId: string; date: string; startTime: string; userId: string }) =>
    sendPost("/availability/unlock", data),

  getPricing: (venueId: string) =>
    sendGet(`/venues/${venueId}/pricing`),

  createPricing: (data: {
    venueId: string;
    startTime: string;
    endTime: string;
    pricePerHour: number;
    label?: string;
    dayOfWeek?: number;
  }) =>
    sendPost("/pricings", {
      venueId: data.venueId,
      startTime: data.startTime,
      endTime: data.endTime,
      price_per_hour: data.pricePerHour,
      label: data.label,
      day_of_week: data.dayOfWeek,
    }),

  updatePricing: (id: string, data: {
    startTime?: string;
    endTime?: string;
    pricePerHour?: number;
    label?: string;
    dayOfWeek?: number;
  }) =>
    sendPut(`/pricings/${id}`, {
      startTime: data.startTime,
      endTime: data.endTime,
      price_per_hour: data.pricePerHour,
      label: data.label,
      day_of_week: data.dayOfWeek,
    }),

  deletePricing: (id: string) =>
    sendDelete(`/pricings/${id}`),

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

  approveVenue: (id: string) =>
    sendPatch(`/admin/venues/${id}/approve`, {}),

  rejectVenue: (id: string, data: { reason: string }) =>
    sendPatch(`/admin/venues/${id}/reject`, data),

  getPendingVenues: (params?: { page?: number; limit?: number }) =>
    sendGet("/admin/venues/pending", params),

  deleteVenue: (id: string) =>
    sendDelete(`/venues/${id}`),

  createVenue: (data: any) =>
    sendPost("/venues", data),

  updateVenue: (id: string, data: any) =>
    sendPut(`/venues/${id}`, data),

  addVenueImage: (id: string, data: { imageUrl: string; isPrimary: boolean }) =>
    sendPost(`/venues/${id}/images`, data),

  requestClosure: (id: string) =>
    sendPut(`/venues/${id}/request-closure`, {}),

  approveClosure: (id: string) =>
    sendPut(`/venues/${id}/approve-closure`, {}),

  cancelClosure: (id: string) =>
    sendPut(`/venues/${id}/cancel-closure`, {}),

  requestReopen: (id: string) =>
    sendPut(`/venues/${id}/request-reopen`, {}),
};
