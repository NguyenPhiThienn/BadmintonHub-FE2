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
}, options?: Omit<UseQueryOptions<IVenuesListResponse>, 'queryKey' | 'queryFn'>) => {
  return useQuery<IVenuesListResponse>({
    queryKey: ["venues", params],
    queryFn: () => venueApi.getVenues(params),
    refetchInterval: 10000,
    ...options,
  });
};

export const useMyVenues = (params?: { page?: number; limit?: number; search?: string; sortBy?: string; status?: string }, options?: Omit<UseQueryOptions<IVenuesListResponse>, 'queryKey' | 'queryFn'>) => {
  return useQuery<IVenuesListResponse>({
    queryKey: ["my-venues", params],
    queryFn: () => venueApi.getMyVenues(params),
    refetchInterval: 10000,
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

export const useAvailability = (params: { courtId?: string; venueId?: string; date: string; userId?: string }) => {
  return useQuery({
    queryKey: ["availability", params.courtId, params.venueId, params.date, params.userId],
    queryFn: () => venueApi.getAvailability({
      courtId: params.courtId,
      venueId: params.venueId,
      date: params.date,
      userId: params.userId
    }),
    enabled: (!!params.courtId || !!params.venueId) && !!params.date,
    refetchInterval: 5000, // Auto-refresh availability every 5 seconds to get live locks! Beautiful!
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

export const useCreatePricing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      venueId: string;
      startTime: string;
      endTime: string;
      pricePerHour: number;
      label?: string;
      dayOfWeek?: number;
    }) => venueApi.createPricing(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pricing", variables.venueId] });
    },
  });
};

export const useUpdatePricing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, venueId }: { id: string; venueId: string; data: any }) =>
      venueApi.updatePricing(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pricing", variables.venueId] });
    },
  });
};

export const useDeletePricing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, venueId }: { id: string; venueId: string }) =>
      venueApi.deletePricing(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pricing", variables.venueId] });
    },
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
export const useAdminVenues = (params?: { page?: number; limit?: number; status?: string; search?: string; sortBy?: string }, options?: Omit<UseQueryOptions<IVenuesListResponse>, 'queryKey' | 'queryFn'>) => {
  return useQuery<IVenuesListResponse>({
    queryKey: ["admin-venues", params],
    queryFn: () => venueApi.getAdminVenues(params),
    refetchInterval: 5000,
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
      queryClient.invalidateQueries({ queryKey: ["my-venues"] });
    },
  });
};

export const useApproveVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => venueApi.approveVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      queryClient.invalidateQueries({ queryKey: ["pending-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["my-venues"] });
    },
  });
};

export const useRejectVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      venueApi.rejectVenue(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      queryClient.invalidateQueries({ queryKey: ["pending-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["my-venues"] });
    },
  });
};

export const usePendingVenues = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["pending-venues", params],
    queryFn: () => venueApi.getPendingVenues(params),
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => venueApi.deleteVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["my-venues"] });
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

export const useLockSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { courtId: string; date: string; startTime: string; userId: string }) =>
      venueApi.lockSlot(data),
    onSuccess: (_, variables) => {
      // Trigger auto-refetch for availability status
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      
      // Trigger auto-refetch for venue details
      queryClient.invalidateQueries({ queryKey: ["venue"] });
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
};

export const useUnlockSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { courtId: string; date: string; startTime: string; userId: string }) =>
      venueApi.unlockSlot(data),
    onSuccess: (_, variables) => {
      // Trigger auto-refetch for availability status
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      
      // Trigger auto-refetch for venue details
      queryClient.invalidateQueries({ queryKey: ["venue"] });
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
};

export const useRequestClosure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => venueApi.requestClosure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["my-venues"] });
    },
  });
};

export const useApproveClosure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => venueApi.approveClosure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["my-venues"] });
    },
  });
};

export const useCancelClosure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => venueApi.cancelClosure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["my-venues"] });
    },
  });
};

export const useRequestReopen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => venueApi.requestReopen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["my-venues"] });
    },
  });
};
