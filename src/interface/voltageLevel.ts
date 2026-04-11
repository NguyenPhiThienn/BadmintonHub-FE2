import { IPartner } from "./partner";

export interface IVoltageLevel {
    _id: string;
    name: string;
    partnerId: string | IPartner;
    isActive: boolean;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IVoltageLevelsResponse {
    statusCode: number;
    message: string;
    data: {
        voltageLevels: IVoltageLevel[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    meta: {
        timestamp: string;
        apiVersion: string;
    };
}
