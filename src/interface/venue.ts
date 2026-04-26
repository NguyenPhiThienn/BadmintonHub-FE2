export interface IVenue {
  _id: string;
  ownerId: string;
  name: string;
  images?: string[];
  pricePerHour: number;
  address: string;
  description?: string;
  openTime: string;
  closeTime: string;
  averageRating?: number;
  matchScore?: number;
  reason?: string;
  distance?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  available?: number;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  legalDocuments?: string[];
  statusReason?: string;
  createdAt?: string;
  updatedAt?: string;
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
  userId: string;
  preferences?: Record<string, any>;
}

export interface IAIRecommendationResponse {
  status: number;
  data: {
    venueId: string;
    matchScore: number;
    reason: string;
  }[];
}

export interface ICourt {
  _id: string;
  venueId: string;
  name: string;
  type?: string;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'HIDDEN';
}

export interface ISlot {
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "LOCKED" | string;
}

export interface IAvailability {
  courtId: string;
  courtName: string;
  slots: ISlot[];
}

export interface IDemandAnalytics {
  peakHours: string[];
  demandLevel: "low" | "medium" | "high";
  hourlyData?: { time: string; level: number }[]; // for chart
}

export interface IPricing {
  venueId: string;
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  pricePerHour: number;
}
