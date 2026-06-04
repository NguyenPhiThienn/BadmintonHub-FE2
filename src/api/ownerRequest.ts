import { sendGet, sendPatch, sendPost, sendPut, sendDelete } from "./axios";

export interface ICreateOwnerRequest {
  identityCard: string;
  courtAddress: string;
  courtImages: string[];
  businessLicense: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  taxCode: string;
  isAgreedToTerms: boolean;
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

  updateMyRequest: (data: ICreateOwnerRequest) =>
    sendPut("/owner-requests/my-request", data),

  cancelMyRequest: () =>
    sendDelete("/owner-requests/my-request"),

  getAllRequests: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    sendGet("/owner-requests", params),

  getRequestDetails: (id: string) =>
    sendGet(`/owner-requests/${id}`),

  reviewRequest: (id: string, data: IReviewOwnerRequest) =>
    sendPatch(`/owner-requests/${id}/review`, data),

  // Mail notification
  sendOwnerStatusMail: (data: { email: string; fullName: string; status: 'APPROVED' | 'REJECTED'; rejectReason?: string }) =>
    sendPost("/auth/send-owner-status", data),
};
