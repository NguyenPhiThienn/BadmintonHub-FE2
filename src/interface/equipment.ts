export interface IEquipment {
    _id: string;
    equipmentCode: string;
    equipmentName: string;
    serialNumber: string;
    manufacturer: string;
    quantity: number;
    availableQuantity: number;
    status: string;
    inspectionSealNumber?: string;
    inspectionDate?: string;
    nextInspectionDate?: string;
    notes?: string;
    operationDate?: string;
    inspectionHistory?: IInspectionHistoryItem[];
    isActive: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateEquipmentRequest {
    equipmentCode: string;
    equipmentName: string;
    serialNumber: string;
    manufacturer: string;
    quantity: number;
    availableQuantity: number;
    status: string;
    inspectionSealNumber?: string;
    inspectionDate?: string;
    nextInspectionDate?: string;
    notes?: string;
}

export interface IUpdateEquipmentRequest {
    equipmentName?: string;
    quantity?: number;
    availableQuantity?: number;
    status?: string;
    inspectionSealNumber?: string;
    inspectionDate?: string;
    nextInspectionDate?: string;
    notes?: string;
}

// Sub-Module 3B Interfaces
export interface IInspectionHistoryItem {
    inspectionDate: string;
    inspectionSealNumber: string;
    nextInspectionDate: string;
    updatedAt: string;
    updatedBy: string;
}

export interface IEquipmentHistory {
    _id: string;
    equipmentId: string;
    equipmentCode: string;
    equipmentName: string;
    serialNumber: string;
    operationDate: string;
    inspectionDate: string;
    inspectionSealNumber: string;
    nextInspectionDate: string;
    inspectionHistory: IInspectionHistoryItem[];
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateEquipmentHistoryRequest {
    operationDate: string;
    inspectionDate: string;
    inspectionSealNumber: string;
    nextInspectionDate: string;
}

// Sub-Module 3C Interfaces
export type BorrowStatus = "borrowed" | "returned" | "overdue" | "partially_returned" | "pending";

export interface IBorrowItem {
    equipmentId: string | {
        _id: string;
        equipmentCode: string;
        equipmentName: string;
        serialNumber: string;
        manufacturer: string;
        quantity: number;
        availableQuantity: number;
        status: string;
        isActive: boolean;
        notes?: string;
    };
    equipmentCode: string;
    equipmentName: string;
    quantity: number;
    borrowCondition?: string;
    borrowImages: string[];
    returnDate?: string | null;
    returnCondition?: string | null;
    returnImages: string[];
    status: BorrowStatus;
}

import { IEmployee } from "./employee";

export interface IBorrowReturn {
    _id: string;
    projectName?: string;
    borrowerId: string | IEmployee;
    borrowerName: string;
    borrowDate: string;
    expectedReturnDate?: string;
    items?: IBorrowItem[];
    // Flat fields from new API structure
    equipmentId?: string | IEquipment;
    equipmentCode?: string;
    equipmentName?: string;
    quantity: number;
    borrowCondition?: string;
    returnDate?: string | null;
    returnCondition?: string | null;
    notes?: string;
    status: BorrowStatus;
    createdBy?: string;
    updatedBy?: string;
    recordCode?: string;
    // Signing fields
    isStorekeeperSigned?: boolean;
    storekeeperSignedAt?: string;
    storekeeperId?: string | IEmployee;
    isUnitHeadSigned?: boolean;
    unitHeadSignedAt?: string;
    unitHeadId?: string | IEmployee;
    isTechnicalStaffSigned?: boolean;
    technicalStaffSignedAt?: string;
    technicalStaffId?: string | IEmployee;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateBorrowRequest {
    projectName?: string;
    borrowerId: string;
    borrowDate: string;
    items: Array<{
        equipmentId: string;
        quantity: number;
        borrowCondition: string;
        borrowImages?: string[];
    }>;
    notes?: string;
}

export interface IUpdateReturnRequest {
    items: Array<{
        equipmentId: string;
        returnDate: string;
        returnCondition: string;
        returnImages?: string[];
    }>;
    notes?: string;
}

export interface IConflictCheckResponse {
    hasConflict: boolean;
    availableQuantity?: number;
    equipment?: {
        equipmentCode: string;
        equipmentName: string;
        totalQuantity: number;
        availableQuantity: number;
        requestedQuantity: number;
    };
    borrowedRecords?: Array<{
        id: string;
        borrowerName: string;
        quantity: number;
        borrowDate: string;
    }>;
}
