export interface IEmployee {
    _id: string;
    employeeCode: string;
    fullName: string;
    dateOfBirth: string;
    hometown: string;
    phoneNumber: string;
    department: string;
    position: string;
    identityCard?: string;
    qualification?: string;
    isActive: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    permissions?: string[];
    digitalSignature?: string;
    avatar?: string;
}

export interface ICreateEmployeeRequest {
    employeeCode: string;
    fullName: string;
    dateOfBirth: string;
    hometown: string;
    phoneNumber: string;
    department: string;
    position: string;
    identityCard?: string;
    qualification?: string;
    digitalSignature?: string;
    password?: string;
    avatar?: string;
}

export interface IUpdateEmployeeRequest {
    fullName?: string;
    phoneNumber?: string;
    department?: string;
    position?: string;
    identityCard?: string;
    qualification?: string;
    isActive?: boolean;
    permissions?: string[];
    digitalSignature?: string;
    password?: string;
    avatar?: string;
}

export interface IEmployeeListResponse {
    success: boolean;
    message: string;
    data: {
        employees: IEmployee[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    statusCode: number;
}

export interface IEmployeeDetailResponse {
    success: boolean;
    message: string;
    data: IEmployee;
    statusCode: number;
}

export interface IEmployeeSearchResponse {
    success: boolean;
    message: string;
    data: IEmployee[];
    statusCode: number;
}
