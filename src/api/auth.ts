import { IAuthResponse, IProfileResponse, IRefreshTokenResponse } from "@/interface/auth";
import { sendGet, sendPost, sendPostWithConfig, sendPut } from "./axios";

export const authApi = {
  login: (data: any): Promise<IAuthResponse> => sendPost("/auth/login", data),
  register: (data: any): Promise<any> => sendPost("/auth/register", data),
  forgotPassword: (data: { email: string }): Promise<any> => sendPost("/auth/forgot-password", data),
  logout: () => sendPost("/auth/logout"),
  refreshToken: (data: { refreshToken: string }): Promise<IRefreshTokenResponse> => sendPost("/auth/refresh-token", data),
  getMe: (): Promise<IProfileResponse> => sendGet("/auth/me"),
  updateMe: (data: any): Promise<IProfileResponse> => sendPut("/auth/me", data),
  changePassword: (data: any) => sendPut("/auth/change-password", data),
  requestOtp: (data: { identifier: string }) => sendPost("/auth/request-otp", data),
  verifyOtp: (data: { identifier: string; otpCode: string }) => sendPost("/auth/verify-otp", data),

  // Partner Auth
  loginPartner: (data: any): Promise<IAuthResponse> => sendPost("/auth/partner/login", data),
  loginPartnerCheck: (data: any) => sendPost("/auth/partner/login-check", data),
  firebaseLoginPartner: (data: { idToken: string }) =>
    sendPostWithConfig("/auth/partner/firebase-login", data, { withCredentials: true }),
};
