import { useQuery, useMutation } from "@tanstack/react-query";
import { venueApi } from "@/api/venue";
import { IAIRecommendationRequest } from "@/interface/venue";

export const useVenues = (params?: { keyword?: string; lat?: number; lng?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["venues", params],
    queryFn: () => venueApi.getVenues(params),
  });
};

export const useAiRecommendations = () => {
  return useMutation({
    mutationFn: (data: IAIRecommendationRequest) => venueApi.getAiRecommendations(data),
  });
};
