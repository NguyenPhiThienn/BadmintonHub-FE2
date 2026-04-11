import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { equipmentApi } from "@/api/equipment";
import { toast } from "react-toastify";

// --- SUB-MODULE 3A: EQUIPMENT ---

export const useEquipment = (params: any) => {
    return useQuery({
        queryKey: ["equipment", params],
        queryFn: () => equipmentApi.getEquipment(params),
    });
};

export const useEquipmentMetadata = () => {
    return useQuery({
        queryKey: ["equipment", "metadata"],
        queryFn: () => equipmentApi.getEquipmentMetadata(),
    });
};

export const useEquipmentDetails = (id: string) => {
    return useQuery({
        queryKey: ["equipment", id],
        queryFn: () => equipmentApi.getEquipmentDetails(id),
        enabled: !!id,
    });
};

export const useSearchEquipment = (params: any) => {
    return useQuery({
        queryKey: ["equipment", "search", params],
        queryFn: () => equipmentApi.searchEquipment(params),
        enabled: !!(params.equipmentName || params.equipmentCode || params.manufacturer),
    });
};

export const useAvailableEquipment = () => {
    return useQuery({
        queryKey: ["equipment", "available"],
        queryFn: () => equipmentApi.getAvailableEquipment(),
    });
};

export const useCreateEquipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => equipmentApi.createEquipment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["equipment"] });
            toast.success("Thêm thiết bị thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thêm thiết bị thất bại");
        },
    });
};

export const useUpdateEquipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            equipmentApi.updateEquipment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["equipment"] });
            toast.success("Cập nhật thiết bị thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật thiết bị thất bại");
        },
    });
};

export const useDeleteEquipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => equipmentApi.deleteEquipment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["equipment"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa thiết bị thất bại");
        },
    });
};

// --- SUB-MODULE 3B: EQUIPMENT HISTORY / INSPECTION ---
export const useEquipmentHistory = (id: string) => {
    return useEquipmentDetails(id);
};

export const useInspectionDue = (days: number = 30) => {
    return useQuery({
        queryKey: ["equipment", "inspection-due", days],
        queryFn: () => equipmentApi.getInspectionDue(days),
    });
};

export const useUpdateInspection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            equipmentApi.updateHistory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["equipment"] });
            toast.success("Cập nhật thông tin kiểm định thành công");
        },
    });
};

export const useDeleteInspectionHistory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, index }: { id: string; index: number }) =>
            equipmentApi.deleteHistoryItem(id, index),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["equipment"] });
        },
    });
};

export const useBorrowRecords = (params: any) => {
    return useQuery({
        queryKey: ["borrow-return", params],
        queryFn: () => equipmentApi.getBorrowRecords(params),
    });
};

export const useBorrowDetails = (id: string) => {
    return useQuery({
        queryKey: ["borrow-return", id],
        queryFn: () => equipmentApi.getBorrowDetails(id),
        enabled: !!id,
    });
};

export const useCheckConflict = (params: any) => {
    return useQuery({
        queryKey: ["borrow-return", "check-conflict", params],
        queryFn: () => equipmentApi.checkConflict(params),
        enabled: !!(params.equipmentId && params.quantity),
    });
};

export const useCurrentlyBorrowed = () => {
    return useQuery({
        queryKey: ["borrow-return", "borrowed"],
        queryFn: () => equipmentApi.getCurrentlyBorrowed(),
    });
};

export const useCreateBorrow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => equipmentApi.createBorrow(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["borrow-return"] });
            queryClient.invalidateQueries({ queryKey: ["equipment"] }); // Update available quantity
            toast.success("Tạo phiếu mượn thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Tạo phiếu mượn thất bại");
        },
    });
};

export const useUpdateReturn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            equipmentApi.updateReturn(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["borrow-return"] });
            queryClient.invalidateQueries({ queryKey: ["equipment"] });
            toast.success("Cập nhật thông tin trả thiết bị thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật thông tin trả thất bại");
        },
    });
};

export const useUploadBorrowImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { imageType: "borrow" | "return"; imageUrl: string } }) =>
            equipmentApi.uploadBorrowImage(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["borrow-return"] });
            toast.success("Tải ảnh lên thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Tải ảnh lên thất bại");
        },
    });
};

export const useExportBorrowRecord = () => {
    return useMutation({
        mutationFn: (id: string) => equipmentApi.exportBorrowRecord(id),
        onSuccess: () => {
            toast.success("Xuất file thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xuất file thất bại");
        },
    });
};

export const usePrintBorrowRecord = () => {
    return useMutation({
        mutationFn: (id: string) => equipmentApi.printBorrowRecord(id),
        onSuccess: () => {
            toast.success("In phiếu thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "In phiếu thất bại");
        },
    });
};

export const useStorekeeperSign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => equipmentApi.storekeeperSign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["borrow-return"] });
            toast.success("Thủ kho xác nhận ký thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thủ kho ký thất bại");
        },
    });
};

export const useUnitHeadSign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => equipmentApi.unitHeadSign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["borrow-return"] });
            toast.success("Thủ trưởng đơn vị xác nhận ký thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thủ trưởng ký thất bại");
        },
    });
};

export const useTechnicalStaffSign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => equipmentApi.technicalStaffSign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["borrow-return"] });
            toast.success("Cán bộ kỹ thuật xác nhận ký thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Kỹ thuật ký thất bại");
        },
    });
};

export const useDeleteBorrowRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => equipmentApi.deleteBorrowRecord(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["borrow-return"] });
            queryClient.invalidateQueries({ queryKey: ["equipment"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa phiếu mượn trả thất bại");
        },
    });
};

export const useInventoryChecks = (params: any) => {
    return useQuery({
        queryKey: ["inventory-check", params],
        queryFn: () => equipmentApi.getInventoryChecks(params),
    });
};

export const useInventoryCheckDetails = (id: string) => {
    return useQuery({
        queryKey: ["inventory-check", id],
        queryFn: () => equipmentApi.getInventoryCheckDetails(id),
        enabled: !!id,
    });
};

export const useCreateInventoryCheck = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => equipmentApi.createInventoryCheck(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory-check"] });
            queryClient.invalidateQueries({ queryKey: ["equipment"] }); // Possible quantity updates
            toast.success("Tạo phiếu kiểm kê thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Tạo phiếu kiểm kê thất bại");
        },
    });
};

export const useDeleteInventoryCheck = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => equipmentApi.deleteInventoryCheck(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory-check"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa phiếu kiểm kê thất bại");
        },
    });
};

export const usePrintInventoryCheck = () => {
    return useMutation({
        mutationFn: (id: string) => equipmentApi.printInventoryCheck(id),
        onSuccess: (data: any) => {
            if (data?.data?.url) {
                window.open(data.data.url, '_blank');
            }
            toast.success("Đang chuẩn bị bản in...");
        },
        onError: (error: any) => {
            toast.error(error?.message || "In phiếu thất bại");
        },
    });
};
