import { IAuthResponse, IProfileResponse, IUser } from "@/interface/auth";
import { sendGet, sendPut, sendPost, sendDelete } from "./axios";

export const usersApi = {
  getUsers: (params: { page: number; limit: number; role?: string; search?: string; status?: string }): Promise<any> => 
    sendGet("/users", params),
  
  getUserById: (id: string): Promise<IProfileResponse> => 
    sendGet(`/users/${id}`),
  
  updateUser: (id: string, data: { fullName?: string; role?: string }): Promise<any> => 
    sendPut(`/users/${id}`, data),
  
  deleteUser: (id: string): Promise<any> => 
    sendDelete(`/users/${id}`),

  resetPassword: (id: string): Promise<any> =>
    sendPost(`/users/${id}/reset-password`, {}),
};
