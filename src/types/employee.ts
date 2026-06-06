export interface IEmployee {
  _id?: string;
  userId?: string;
  employeeCode?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  role?: string;
  permissions?: string[];
  status?: string;
  isActive?: boolean;
  avatar?: string;
  department?: string;
  position?: string;
  dateOfBirth?: string;
  hometown?: string;
  identityCard?: string;
  qualification?: string;
  digitalSignature?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IEmployeeResponse {
  data: IEmployee;
  employee?: IEmployee;
  message?: string;
}

export interface IEmployeesListResponse {
  data: IEmployee[];
  employees: IEmployee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
  metadata?: {
    departments: string[];
    positions: string[];
  };
}
