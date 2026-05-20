import { sendGet, sendPost } from "./axios";

export interface ICreateReview {
  venueId: string;
  rating: number;
  comment?: string;
}

export const reviewApi = {
  getReviewsByVenue: (venueId: string) =>
    sendGet(`/reviews/venue/${venueId}`),

  createReview: (data: ICreateReview) =>
    sendPost("/reviews", data),

  toggleLikeReview: (reviewId: string) =>
    sendPost(`/reviews/${reviewId}/like`),
};
