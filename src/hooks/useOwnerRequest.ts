import { ownerRequestApi, ICreateOwnerRequest, IReviewOwnerRequest } from "@/api/ownerRequest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateOwnerRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateOwnerRequest) => ownerRequestApi.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-owner-request"] });
      queryClient.invalidateQueries({ queryKey: ["all-owner-requests"] });
    },
  });
};

export const useMyOwnerRequest = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["my-owner-request"],
    queryFn: () => ownerRequestApi.getMyRequest(),
    enabled,
    refetchInterval: 4000,
  });
};

export const useUpdateMyOwnerRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateOwnerRequest) => ownerRequestApi.updateMyRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-owner-request"] });
    },
  });
};

export const useCancelMyOwnerRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ownerRequestApi.cancelMyRequest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-owner-request"] });
    },
  });
};

export const useAllOwnerRequests = (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
  return useQuery({
    queryKey: ["all-owner-requests", params],
    queryFn: () => ownerRequestApi.getAllRequests(params),
    refetchInterval: 4000,
  });
};

export const useOwnerRequestDetails = (id: string) => {
  return useQuery({
    queryKey: ["owner-request", id],
    queryFn: () => ownerRequestApi.getRequestDetails(id),
    enabled: !!id,
  });
};

export const useReviewOwnerRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IReviewOwnerRequest }) =>
      ownerRequestApi.reviewRequest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["all-owner-requests"] });
      queryClient.invalidateQueries({ queryKey: ["owner-request", id] });
      queryClient.invalidateQueries({ queryKey: ["my-owner-request"] });
    },
  });
};

export const useSendOwnerStatusMail = () => {
  return useMutation({
    mutationFn: (data: { email: string; fullName: string; status: 'APPROVED' | 'REJECTED'; rejectReason?: string }) =>
      ownerRequestApi.sendOwnerStatusMail(data),
  });
};
