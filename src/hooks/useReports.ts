import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportApi } from "@/api/reports";
import { toast } from "react-toastify";

export const useStatistics = () => {
    return useQuery({
        queryKey: ["reports", "statistics"],
        queryFn: () => reportApi.getStatistics(),
    });
};

export const useNotifications = (params: any) => {
    return useQuery({
        queryKey: ["notifications", params],
        queryFn: () => reportApi.getNotifications(params),
        refetchInterval: 30000, // Auto refresh every 30s
    });
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: () => reportApi.getUnreadCount(),
        refetchInterval: 30000,
    });
};

export const useNotificationDetails = (id: string) => {
    return useQuery({
        queryKey: ["notifications", id],
        queryFn: () => reportApi.getNotificationDetails(id),
        enabled: !!id,
    });
};

export const useMarkRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => reportApi.markRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useMarkReadAll = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => reportApi.markReadAll(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Đã đánh dấu tất cả là đã đọc");
        },
    });
};

// --- SUB-MODULE 6B: REPORTS ---

export const useEquipmentReport = () => {
    return useQuery({
        queryKey: ["reports", "equipment"],
        queryFn: () => reportApi.getEquipmentReport(),
    });
};

export const useTaskReport = () => {
    return useQuery({
        queryKey: ["reports", "tasks"],
        queryFn: () => reportApi.getTaskReport(),
    });
};

export const useBorrowReturnReport = () => {
    return useQuery({
        queryKey: ["reports", "borrow-return"],
        queryFn: () => reportApi.getBorrowReturnReport(),
    });
};

export const useExportReport = () => {
    return useMutation({
        mutationFn: (type: string) => reportApi.exportReport(type),
        onSuccess: (response) => {
            if (response.success && response.data?.exportUrl) {
                window.open(response.data.exportUrl, "_blank");
                toast.success("Xuất báo cáo thành công");
            }
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xuất báo cáo thất bại");
        },
    });
};
