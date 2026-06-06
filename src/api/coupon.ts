import { sendDelete, sendGet, sendPost, sendPut } from "./axios";
import { ICreateCouponData, IUpdateCouponData } from "@/types/coupon";

export const couponApi = {
    getCoupons: (params?: { page?: number; limit?: number; status?: string; venueId?: string; search?: string }) =>
        sendGet("/owner/coupons", params),

    getCouponById: (id: string) =>
        sendGet(`/owner/coupons/${id}`),

    createCoupon: (data: ICreateCouponData) =>
        sendPost("/owner/coupons", data),

    updateCoupon: (id: string, data: IUpdateCouponData) =>
        sendPut(`/owner/coupons/${id}`, data),

    deleteCoupon: (id: string) =>
        sendDelete(`/owner/coupons/${id}`),

    applyCoupon: (data: { code: string; venueId: string; totalAmount: number }) =>
        sendPost("/bookings/apply-coupon", data),
};
