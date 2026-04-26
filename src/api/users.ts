import { IAuthResponse, IProfileResponse, IUser } from "@/interface/auth";
import { sendGet, sendPut, sendPost, sendDelete } from "./axios";

export const usersApi = {
  getUsers: (params: { page: number; limit: number; role?: string; search?: string; status?: string }): Promise<any> => 
    sendGet("/users", params),
  
  getUserById: (id: string): Promise<IProfileResponse> => 
    sendGet(`/users/${id}`),
  
  updateUser: (id: string, data: any): Promise<any> => 
    sendPut(`/users/${id}`, data),
  
  deleteUser: (id: string): Promise<any> => 
    sendDelete(`/users/${id}`),

  createUser: (data: any): Promise<any> =>
    sendPost("/users", data),

  resetPassword: (id: string): Promise<any> =>
    sendPost(`/users/${id}/reset-password`, {}),
};
