export enum CouponDiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export enum CouponStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
}

export interface ICoupon {
    _id: string;
    code: string;
    ownerId: string;
    venueId?: string; // Optional: null means applied to all venues
    discountType: CouponDiscountType;
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    startDate: string | Date;
    endDate: string | Date;
    usageLimit: number;
    usedCount: number;
    status: CouponStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateCouponData {
    code: string;
    venueId?: string;
    discountType: CouponDiscountType;
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    status: CouponStatus;
}

export interface IUpdateCouponData extends Partial<ICreateCouponData> {}
