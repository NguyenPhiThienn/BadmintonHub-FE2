import { venueApi } from "@/api/venue";
import { IAIRecommendationRequest, IVenueResponse, IVenuesListResponse } from "@/interface/venue";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

export const useVenues = (params?: { 
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
}) => {
  return useQuery<IVenuesListResponse>({
    queryKey: ["venues", params],
    queryFn: () => venueApi.getVenues(params),
  });
};

export const useMyVenues = (params?: { page?: number; limit?: number }, options?: Omit<UseQueryOptions<IVenuesListResponse>, 'queryKey' | 'queryFn'>) => {
  return useQuery<IVenuesListResponse>({
    queryKey: ["my-venues", params],
    queryFn: () => venueApi.getMyVenues(params),
    ...options,
  });
};

export const useVenueDetails = (id: string) => {
  return useQuery<IVenueResponse>({
    queryKey: ["venue", id],
    queryFn: () => venueApi.getVenueById(id),
    enabled: !!id,
  });
};

export const useVenueCourts = (venueId: string) => {
  return useQuery({
    queryKey: ["courts", venueId],
    queryFn: () => venueApi.getCourts(venueId),
    enabled: !!venueId,
  });
};

export const useAvailability = (params: { courtId?: string; venueId?: string; date: string }) => {
  return useQuery({
    queryKey: ["availability", params.courtId, params.venueId, params.date],
    queryFn: () => venueApi.getAvailability({
      courtId: params.courtId,
      venueId: params.venueId,
      date: params.date
    }),
    enabled: (!!params.courtId || !!params.venueId) && !!params.date,
  });
};

export const useDemandAnalytics = (venueId: string) => {
  return useQuery({
    queryKey: ["analytics", venueId],
    queryFn: () => venueApi.getDemandAnalytics({ venueId }),
    enabled: !!venueId,
  });
};

export const useVenuePricing = (venueId: string) => {
  return useQuery({
    queryKey: ["pricing", venueId],
    queryFn: () => venueApi.getPricing(venueId),
    enabled: !!venueId,
  });
};

export const useAiRecommendations = () => {
  return useMutation({
    mutationFn: (data: IAIRecommendationRequest) => venueApi.getAiRecommendations(data),
  });
};

export const useAiBookingRecommendation = (venueId: string) => {
  return useQuery({
    queryKey: ["booking-recommendation", venueId],
    queryFn: () => venueApi.getAiBookingRecommendation(venueId),
    enabled: !!venueId,
  });
};

// Admin specific
export const useAdminVenues = (params?: { page?: number; limit?: number; status?: string; search?: string }, options?: Omit<UseQueryOptions<IVenuesListResponse>, 'queryKey' | 'queryFn'>) => {
  return useQuery<IVenuesListResponse>({
    queryKey: ["admin-venues", params],
    queryFn: () => venueApi.getAdminVenues(params),
    ...options,
  });
};

export const useUpdateVenueStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; reason?: string } }) =>
      venueApi.updateVenueStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => venueApi.deleteVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
  });
};

export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => venueApi.createVenue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["my-venues"] });
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => venueApi.updateVenue(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["my-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venue", id] });
    },
  });
};

export const useAddVenueImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { imageUrl: string; isPrimary: boolean } }) =>
      venueApi.addVenueImage(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["venue", id] });
    },
  });
};
