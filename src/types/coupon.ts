export interface ICoupon {
  _id?: string;
  code?: string;
  discountType?: string;
  discountValue?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  venueId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICouponResponse {
  data: ICoupon;
  message?: string;
}

export interface ICouponsListResponse {
  data: ICoupon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  coupons: ICoupon[];
}

export enum CouponStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DELETED = "DELETED",
}

export enum CouponDiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

export interface ICreateCouponData {
  code: string;
  venueId?: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  status?: CouponStatus;
}

export interface IUpdateCouponData extends Partial<ICreateCouponData> {
  status?: CouponStatus;
}
