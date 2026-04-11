import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bayApi } from "@/api/bays";
import { toast } from "react-toastify";

export const useBays = (params: any) => {
    return useQuery({
        queryKey: ["bays", params],
        queryFn: () => bayApi.getBays(params),
    });
};

export const useBaysByVoltageLevel = (voltageLevelId: string) => {
    return useQuery({
        queryKey: ["bays", "voltage-level", voltageLevelId],
        queryFn: () => bayApi.getBaysByVoltageLevel(voltageLevelId),
        enabled: !!voltageLevelId,
    });
};

export const useBayDetails = (id: string) => {
    return useQuery({
        queryKey: ["bays", id],
        queryFn: () => bayApi.getBayDetails(id),
        enabled: !!id,
    });
};

export const useCreateBay = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => bayApi.createBay(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bays"] });
            toast.success("Thêm ngăn lộ thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thêm ngăn lộ thất bại");
        },
    });
};

export const useUpdateBay = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            bayApi.updateBay(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bays"] });
            toast.success("Cập nhật ngăn lộ thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật ngăn lộ thất bại");
        },
    });
};

export const useDeleteBay = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => bayApi.deleteBay(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bays"] });
            toast.success("Xóa ngăn lộ thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa ngăn lộ thất bại");
        },
    });
};
