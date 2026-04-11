import { attendanceApi } from "@/api/attendance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Hook: Chấm công (lưu & khóa)
export const useCheckIn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { date: string; items: { employeeId: string; type: string; notes?: string }[] }) =>
            attendanceApi.checkIn(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
            toast.success("Chấm công và lưu thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Chấm công thất bại");
        },
    });
};

// Hook: Nhân viên tự chấm công
export const useSelfCheckIn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { type: string; notes?: string; date?: string; businessTripNotes?: string }) =>
            attendanceApi.selfCheckIn(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
            toast.success("Đã chấm công ngày hôm nay");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Tự chấm công thất bại");
        },
    });
};

// Hook: Lấy danh sách chấm công
export const useAttendance = (params: any) => {
    return useQuery({
        queryKey: ["attendance", params],
        queryFn: () => attendanceApi.getAttendance(params),
    });
};

// Hook: Lấy chấm công 1 nhân viên trong 1 tháng
export const useEmployeeMonthlyAttendance = (employeeId: string, month: number, year: number) => {
    return useQuery({
        queryKey: ["attendance", "employee-monthly", employeeId, month, year],
        queryFn: () => attendanceApi.getEmployeeMonthly(employeeId, { month, year }),
        enabled: !!employeeId && !!month && !!year,
    });
};

// Hook: Lấy bảng tổng hợp chấm công tháng
export const useMonthlySummary = (params: { month: number; year: number; department?: string; search?: string }) => {
    return useQuery({
        queryKey: ["attendance", "monthly-summary", params],
        queryFn: () => attendanceApi.getMonthlySummary(params),
    });
};

// Hook: Ký số bảng chấm công tháng
export const useSignMonthly = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { month: number; year: number }) =>
            attendanceApi.signMonthly(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
            toast.success("Ký số bảng chấm công thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Ký số thất bại");
        },
    });
};

// Hook: Lấy thông tin công dư
export const useSurplus = (employeeId: string, month: number, year: number) => {
    return useQuery({
        queryKey: ["attendance", "surplus", employeeId, month, year],
        queryFn: () => attendanceApi.getSurplus(employeeId, { month, year }),
        enabled: !!employeeId && !!month && !!year,
    });
};

// Hook: Lấy trạng thái chấm công cá nhân hôm nay
export const useMyAttendanceStatus = () => {
    return useQuery({
        queryKey: ["attendance", "my-status"],
        queryFn: () => attendanceApi.getMyStatus(),
    });
};
