export interface IUser {
  _id?: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserResponse {
  data: IUser;
  message?: string;
}

export interface IUsersListResponse {
  data: IUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOwner {
  _id?: string;
  userId?: string;
  businessName?: string;
  taxId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOwnerResponse {
  data: IOwner;
  message?: string;
}

export interface IOwnersListResponse {
  data: IOwner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
