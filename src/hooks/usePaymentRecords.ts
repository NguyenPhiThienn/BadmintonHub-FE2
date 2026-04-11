import { paymentRecordsApi } from "@/api/paymentRecords";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// --- QUERY: Danh sách ---
export const usePaymentRecords = (params: any) => {
    return useQuery({
        queryKey: ["payment-records", params],
        queryFn: () => paymentRecordsApi.getPaymentRecords(params),
    });
};

// --- QUERY: Chi tiết ---
export const usePaymentRecordDetails = (id: string) => {
    return useQuery({
        queryKey: ["payment-records", id],
        queryFn: () => paymentRecordsApi.getPaymentRecordDetails(id),
        enabled: !!id,
    });
};

// --- MUTATION: Tạo mới ---
export const useCreatePaymentRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => paymentRecordsApi.createPaymentRecord(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-records"] });
            toast.success("Tạo hồ sơ thanh toán thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Tạo hồ sơ thất bại");
        },
    });
};

// --- MUTATION: Cập nhật ---
export const useUpdatePaymentRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            paymentRecordsApi.updatePaymentRecord(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-records"] });
            toast.success("Cập nhật hồ sơ thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật thất bại");
        },
    });
};

// --- MUTATION: Ký kế toán ---
export const useAccountantSign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => paymentRecordsApi.accountantSign(id, { notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-records"] });
            toast.success("Kế toán xác nhận ký thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Ký thất bại");
        },
    });
};

// --- MUTATION: Ký người duyệt ---
export const useApproverSign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => paymentRecordsApi.approverSign(id, { notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-records"] });
            toast.success("Người duyệt xác nhận ký thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Ký thất bại");
        },
    });
};

// --- MUTATION: Ký giám đốc ---
export const useDirectorSign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => paymentRecordsApi.directorSign(id, { notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-records"] });
            toast.success("Giám đốc xác nhận ký thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Ký thất bại");
        },
    });
};

// --- MUTATION: Ký kế toán trưởng ---
export const useChiefAccountantSign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => paymentRecordsApi.chiefAccountantSign(id, { notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-records"] });
            toast.success("Kế toán trưởng xác nhận ký thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Ký thất bại");
        },
    });
};

// --- MUTATION: Ký phụ trách bộ phận ---
export const useDepartmentHeadSign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => paymentRecordsApi.departmentHeadSign(id, { notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-records"] });
            toast.success("Phụ trách bộ phận xác nhận ký thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Ký thất bại");
        },
    });
};

// --- MUTATION: Từ chối ---
export const useRejectPaymentRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => paymentRecordsApi.rejectPaymentRecord(id, { notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-records"] });
            toast.success("Đã từ chối hồ sơ thanh toán");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Từ chối thất bại");
        },
    });
};

// --- MUTATION: Xác nhận đã thanh toán ---
export const useConfirmPaid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => paymentRecordsApi.confirmPaid(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-records"] });
            toast.success("Xác nhận đã thanh toán thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xác nhận thất bại");
        },
    });
};

// --- MUTATION: Xuất file ---
export const useExportPaymentRecord = () => {
    return useMutation({
        mutationFn: (id: string) => paymentRecordsApi.exportPaymentRecord(id),
        onSuccess: (data: any) => {
            if (data?.data?.url) {
                window.open(data.data.url, "_blank");
            }
            toast.success("Xuất file thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xuất file thất bại");
        },
    });
};

// --- MUTATION: In ---
export const usePrintPaymentRecord = () => {
    return useMutation({
        mutationFn: (id: string) => paymentRecordsApi.printPaymentRecord(id),
        onSuccess: (data: any) => {
            if (data?.data?.url) {
                window.open(data.data.url, "_blank");
            }
            toast.success("Đang chuẩn bị bản in...");
        },
        onError: (error: any) => {
            toast.error(error?.message || "In thất bại");
        },
    });
};

export const useDeletePaymentRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => paymentRecordsApi.deletePaymentRecord(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-records"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa hồ sơ thất bại");
        },
    });
};
