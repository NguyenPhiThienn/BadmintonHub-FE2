import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { voltageLevelApi } from "@/api/voltageLevels";
import { toast } from "react-toastify";

export const useVoltageLevels = (params: any) => {
    return useQuery({
        queryKey: ["voltage-levels", params],
        queryFn: () => voltageLevelApi.getVoltageLevels(params),
    });
};

export const useVoltageLevelsByPartner = (partnerId: string) => {
    return useQuery({
        queryKey: ["voltage-levels", "partner", partnerId],
        queryFn: () => voltageLevelApi.getVoltageLevelsByPartner(partnerId),
        enabled: !!partnerId,
    });
};

export const useVoltageLevelDetails = (id: string) => {
    return useQuery({
        queryKey: ["voltage-levels", id],
        queryFn: () => voltageLevelApi.getVoltageLevelDetails(id),
        enabled: !!id,
    });
};

export const useCreateVoltageLevel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => voltageLevelApi.createVoltageLevel(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["voltage-levels"] });
            toast.success("Thêm cấp điện áp thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thêm cấp điện áp thất bại");
        },
    });
};

export const useUpdateVoltageLevel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            voltageLevelApi.updateVoltageLevel(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["voltage-levels"] });
            toast.success("Cập nhật cấp điện áp thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật cấp điện áp thất bại");
        },
    });
};

export const useDeleteVoltageLevel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => voltageLevelApi.deleteVoltageLevel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["voltage-levels"] });
            toast.success("Xóa cấp điện áp thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa cấp điện áp thất bại");
        },
    });
};
