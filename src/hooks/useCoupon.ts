import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponApi } from "@/api/coupon";
import { ICreateCouponData, IUpdateCouponData } from "@/types/coupon";

export const useCoupons = (params?: { page?: number; limit?: number; status?: string; venueId?: string; search?: string }) => {
    return useQuery({
        queryKey: ["coupons", params],
        queryFn: () => couponApi.getCoupons(params),
    });
};

export const useCouponDetails = (id: string) => {
    return useQuery({
        queryKey: ["coupon", id],
        queryFn: () => couponApi.getCouponById(id),
        enabled: !!id,
    });
};

export const useCreateCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ICreateCouponData) => couponApi.createCoupon(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
    });
};

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: IUpdateCouponData }) => couponApi.updateCoupon(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            queryClient.invalidateQueries({ queryKey: ["coupon", id] });
        },
    });
};

export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => couponApi.deleteCoupon(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
    });
};

export const useApplyCoupon = () => {
    return useMutation({
        mutationFn: (data: { code: string; venueId: string; totalAmount: number }) => couponApi.applyCoupon(data),
    });
};
