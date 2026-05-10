export interface IVenue {
  _id: string;
  ownerId: string | { _id: string; fullName: string; email: string; phone: string };
  name: string;
  images?: IVenueImage[];
  pricePerHour: number;
  address: string;
  description?: string;
  openTime: string;
  closeTime: string;
  averageRating?: number;
  matchScore?: number;
  reason?: string;
  detailedAnalysis?: string;
  distance?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  available?: number;
  totalCourts?: number;
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
  courts?: ICourt[];
}

export interface IVenueImage {
  _id?: string;
  venueId?: string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface IVenueResponse {
  statusCode: number;
  message: string;
  data: IVenue;
}

export interface IVenuesListResponse {
  statusCode: number;
  message: string;
  data: {
    venues: IVenue[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface IAIRecommendationRequest {
  userId: string;
  preferences?: Record<string, any>;
  lat?: number;
  lng?: number;
}

export interface IAIRecommendationResponse {
  status: number;
  data: IVenue[];
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
