import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venueApi } from "@/api/venue";
import { IAIRecommendationRequest } from "@/interface/venue";

export const useVenues = (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
  return useQuery({
    queryKey: ["venues", params],
    queryFn: () => venueApi.getVenues(params),
  });
};

export const useVenueDetails = (id: string) => {
  return useQuery({
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

// Admin specific
export const useAdminVenues = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ["admin-venues", params],
    queryFn: () => venueApi.getAdminVenues(params),
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
