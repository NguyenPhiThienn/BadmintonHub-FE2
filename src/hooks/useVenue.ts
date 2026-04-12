import { useQuery, useMutation } from "@tanstack/react-query";
import { venueApi } from "@/api/venue";
import { IAIRecommendationRequest } from "@/interface/venue";

export const useVenues = (params?: { keyword?: string; lat?: number; lng?: number; limit?: number }) => {
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
