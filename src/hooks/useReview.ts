import { ICreateReview, reviewApi } from "@/api/review";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useReviews = (venueId: string) => {
  return useQuery({
    queryKey: ["reviews", venueId],
    queryFn: () => reviewApi.getReviewsByVenue(venueId),
    enabled: !!venueId,
  });
};

export const useCreateReview = (venueId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateReview) => reviewApi.createReview(data),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reviews", venueId] }),
        queryClient.invalidateQueries({ queryKey: ["venue", venueId] })
      ]);
    },
  });
};

export const useToggleLikeReview = (venueId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => reviewApi.toggleLikeReview(reviewId),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["reviews", venueId] });
    },
  });
};
