import { sendGet, sendPost, sendPatch } from "./axios";

export interface ICreateOwnerRequest {
  identityCard: string;
  courtAddress: string;
  courtImages: string[];
  businessLicense: string;
}

export interface IReviewOwnerRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectReason?: string;
}

export const ownerRequestApi = {
  createRequest: (data: ICreateOwnerRequest) =>
    sendPost("/owner-requests", data),

  getMyRequest: () =>
    sendGet("/owner-requests/my-request"),

  getAllRequests: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    sendGet("/owner-requests", params),

  getRequestDetails: (id: string) =>
    sendGet(`/owner-requests/${id}`),

  reviewRequest: (id: string, data: IReviewOwnerRequest) =>
    sendPatch(`/owner-requests/${id}/review`, data),

  // Mail notification
  sendOwnerStatusMail: (data: { email: string; fullName: string; status: 'APPROVED' | 'REJECTED'; rejectReason?: string }) =>
    sendPost("/api/auth/send-owner-status", data),
};
