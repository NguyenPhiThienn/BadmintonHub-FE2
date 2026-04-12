import { sendGet, sendPost } from "./axios";
import { IVenueResponse, IAIRecommendationRequest, IAIRecommendationResponse } from "@/interface/venue";

export const venueApi = {
  getVenues: (params?: { keyword?: string; lat?: number; lng?: number; limit?: number }) =>
    sendGet("/venues", params),

  getAiRecommendations: (data: IAIRecommendationRequest) =>
    sendPost("/ai/recommendations", data),
};
