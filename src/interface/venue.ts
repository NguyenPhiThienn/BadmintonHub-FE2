export interface IVenue {
  _id: string;
  name: string;
  images?: string[];
  price_per_hour?: number;
  address: string;
  description?: string;
  open_time?: string;
  close_time?: string;
  average_rating?: number;
  match_score?: number;
  reason?: string;
  distance?: string;
  rating?: number; // fallback for average_rating
  reviews?: number; // mock
  features?: string[]; // mock
  available?: number; // mock
  location?: {
    lat: number;
    lng: number;
  };
  coordinates?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface IVenueResponse {
  status: number;
  data: IVenue[];
}

export interface IAIRecommendationRequest {
  user_id: string;
  preferences?: Record<string, any>;
}

export interface IAIRecommendationResponse {
  status: number;
  data: {
    venue_id: string;
    match_score: number;
    reason: string;
  }[];
}
