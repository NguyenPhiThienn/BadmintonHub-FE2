export interface ICourt {
  _id?: string;
  name: string;
  type: string;
  status: string;
}

export interface ICoordinates {
  type: string;
  coordinates: [number, number];
}

export interface IVenueImage {
  imageUrl: string;
  isPrimary?: boolean;
}

export interface IVenue {
  _id?: string;
  ownerId?: string;
  name: string;
  address: string;
  coordinates?: ICoordinates;
  description?: string;
  openTime: string;
  closeTime: string;
  averageRating?: number;
  pricePerHour: number;
  status?: string;
  statusReason?: string;
  courts?: ICourt[];
  images?: IVenueImage[];
  venueImages?: string[];
  businessLicense?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IVenueResponse {
  data: IVenue;
  message?: string;
}

export interface IVenuesListResponse {
  data: IVenue[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAIRecommendationResponse {
  recommendations: IVenue[];
}

export interface IAIRecommendationRequest {
  preferences: string;
  location?: { lat: number; lng: number };
  date?: string;
  time?: string;
  budget?: number;
}

export interface ISlot {
  startTime: string;
  endTime: string;
  status: string;
  pricePerHour?: number;
  userId?: string;
}

export interface IAvailability {
  courtId: string;
  courtName?: string;
  slots: ISlot[];
}

export interface IPricing {
  _id?: string;
  venueId?: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  dayOfWeek?: number | null;
  label?: string;
}
