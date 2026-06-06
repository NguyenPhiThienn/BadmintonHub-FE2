export interface IProfileResponse {
  statusCode?: number;
  data: IUserProfile;
  message?: string;
}

export interface IUserProfile {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  role?: string;
  avatar?: string;
  avatarUrl?: string;
  status?: string;
  blockedReason?: string;
  permissions?: string[];
  accessToken?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface IAuthResponse {
  statusCode?: number;
  data: {
    user?: IUserProfile;
    accessToken?: string;
    refreshToken?: string;
  };
  message?: string;
}

export interface IRefreshTokenResponse {
  statusCode?: number;
  data: {
    accessToken?: string;
    refreshToken?: string;
  };
  message?: string;
}

export interface IUser {
  _id?: string;
  id?: string;
  fullName?: string;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  role?: string;
  avatar?: string;
  avatarUrl?: string;
  status?: string;
  blockedReason?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  active?: boolean;
  username?: string;
}
