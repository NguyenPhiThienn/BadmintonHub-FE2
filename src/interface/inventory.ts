export type InventoryActionType = 'normal' | 'repair_pending' | 'liquidation_pending' | 'lost';
export type InventoryCheckStatus = 'draft' | 'completed';

export interface IInventoryCheckItem {
    equipmentId: string | {
        _id: string;
        equipmentCode: string;
        equipmentName: string;
    };
    actualQuantity: number;
    expectedQuantity: number;
    damagedQuantity: number;
    lostQuantity: number;
    qualityStatus: string;
    actionType: InventoryActionType;
    notes?: string;
}

export interface IInventoryCheck {
    _id: string;
    checkCode: string;
    checkDate: string;
    checkType: string;
    status: InventoryCheckStatus;
    checkerId: string | {
        _id: string;
        fullName: string;
    };
    items: IInventoryCheckItem[];
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateInventoryCheckRequest {
    checkCode: string;
    checkDate: string;
    checkType: string;
    status: InventoryCheckStatus;
    items: Array<{
        equipmentId: string;
        actualQuantity: number;
        expectedQuantity: number;
        damagedQuantity: number;
        lostQuantity: number;
        qualityStatus: string;
        actionType: InventoryActionType;
        notes?: string;
    }>;
    notes?: string;
}
