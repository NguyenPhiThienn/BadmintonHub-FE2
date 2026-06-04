import { sendGet, sendPost } from "./axios";

export interface ICreateReview {
  venueId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface IReplyReview {
  reviewId: string;
  reply: string;
}

export const reviewApi = {
  getReviewsByVenue: (venueId: string) =>
    sendGet(`/reviews/venue/${venueId}`),

  createReview: (data: ICreateReview) =>
    sendPost("/reviews", data),

  toggleLikeReview: (reviewId: string) =>
    sendPost(`/reviews/${reviewId}/like`),

  replyReview: (reviewId: string, reply: string) =>
    sendPost(`/reviews/${reviewId}/reply`, { reply }),
};
