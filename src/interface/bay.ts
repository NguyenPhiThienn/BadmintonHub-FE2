import { IPartner } from "./partner";
import { IVoltageLevel } from "./voltageLevel";

export interface IBay {
    _id: string;
    name: string;
    partnerId: string | IPartner;
    voltageLevelId: string | IVoltageLevel;
    isActive: boolean;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IBaysResponse {
    statusCode: number;
    message: string;
    data: {
        bays: IBay[];
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
