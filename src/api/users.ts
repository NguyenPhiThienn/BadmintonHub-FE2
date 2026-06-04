import { IAuthResponse, IProfileResponse, IUser } from "@/interface/auth";
import { sendGet, sendPut, sendPost, sendDelete, sendPatch } from "./axios";

export const usersApi = {
  getUsers: (params: { page: number; limit: number; role?: string; search?: string; status?: string }): Promise<any> => 
    sendGet("/users", params),
  
  getUserById: (id: string): Promise<IProfileResponse> => 
    sendGet(`/users/${id}`),
  
  updateUser: (id: string, data: any): Promise<any> => 
    sendPut(`/users/${id}`, data),
  
  deleteUser: (id: string): Promise<any> => 
    sendDelete(`/users/${id}`),

  blockUser: (id: string, data: { action: 'block' | 'unblock'; blockType?: string; reason?: string; days?: number }): Promise<any> =>
    sendPatch(`/users/${id}/block`, data),

  createUser: (data: any): Promise<any> =>
    sendPost("/users", data),

  resetPassword: (id: string): Promise<any> =>
    sendPost(`/users/${id}/reset-password`, {}),

  getProfile: (): Promise<IProfileResponse> => 
    sendGet("/users/profile"),

  updateProfile: (data: { fullName: string; phone: string; avatarUrl: string }): Promise<any> => 
    sendPut("/users/profile", data),

  toggleFavorite: (venueId: string): Promise<any> => 
    sendPost("/users/favorites/toggle", { venueId }),

  getFavorites: (params?: { page?: number; limit?: number }): Promise<any> => 
    sendGet("/users/favorites", params),
};
