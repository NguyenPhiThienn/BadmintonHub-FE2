import { sendDelete, sendGet, sendPatch, sendPost, sendPut } from "./axios";
import { uploadApi } from "./upload";

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

  createVenue: async (data: any) => {
    // Upload venue images if any
    const venueImages: string[] = [];
    if (data.venueImageFiles && data.venueImageFiles.length > 0) {
      for (const file of data.venueImageFiles) {
        const result = await uploadApi.uploadImage(file);
        if (result?.url) {
          venueImages.push(result.url);
        }
      }
    }

    // Upload business license if any
    let businessLicense = data.businessLicense || "";
    if (data.businessLicenseFile && !data.businessLicense.startsWith('http')) {
      const result = await uploadApi.uploadPdf(data.businessLicenseFile);
      if (result?.url) {
        businessLicense = result.url;
      }
    }

    return sendPost("/venues", {
      ...data,
      venueImages,
      businessLicense,
    });
  },

  updateVenue: async (id: string, data: any) => {
    // Upload new venue images if any
    const venueImages: string[] = data.venueImages || [];
    if (data.venueImageFiles && data.venueImageFiles.length > 0) {
      for (const file of data.venueImageFiles) {
        const result = await uploadApi.uploadImage(file);
        if (result?.url) {
          venueImages.push(result.url);
        }
      }
    }

    // Upload business license if new file provided
    let businessLicense = data.businessLicense || "";
    if (data.businessLicenseFile && !data.businessLicense.startsWith('http')) {
      const result = await uploadApi.uploadPdf(data.businessLicenseFile);
      if (result?.url) {
        businessLicense = result.url;
      }
    }

    return sendPut(`/venues/${id}`, {
      ...data,
      venueImages,
      businessLicense,
    });
  },

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
