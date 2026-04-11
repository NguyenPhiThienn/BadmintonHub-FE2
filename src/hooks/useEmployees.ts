import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "@/api/employees";
import { toast } from "react-toastify";

export const useEmployees = (params: any) => {
    return useQuery({
        queryKey: ["employees", params],
        queryFn: () => employeeApi.getEmployees(params),
    });
};

export const useEmployeeDetails = (id: string) => {
    return useQuery({
        queryKey: ["employees", id],
        queryFn: () => employeeApi.getEmployeeDetails(id),
        enabled: !!id,
    });
};

export const useSearchEmployees = (params: any) => {
    return useQuery({
        queryKey: ["employees", "search", params],
        queryFn: () => employeeApi.searchEmployees(params),
        enabled: !!(params.fullName || params.employeeCode || params.phoneNumber),
    });
};

export const useFilterEmployees = (params: any) => {
    return useQuery({
        queryKey: ["employees", "filter", params],
        queryFn: () => employeeApi.filterEmployees(params),
        enabled: !!params,
    });
};

export const useCreateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => employeeApi.createEmployee(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            toast.success("Thêm nhân viên thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thêm nhân viên thất bại");
        },
    });
};

export const useUpdateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            employeeApi.updateEmployee(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            toast.success("Cập nhật nhân viên thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật nhân viên thất bại");
        },
    });
};

export const useDeleteEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => employeeApi.deleteEmployee(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa nhân viên thất bại");
        },
    });
};

export const useEmployeesMetadata = () => {
    return useQuery({
        queryKey: ["employees", "metadata"],
        queryFn: () => employeeApi.getEmployeesMetadata(),
    });
};

export const useResetPasswordBulk = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { employeeIds: string[]; newPassword: string }) =>
            employeeApi.resetPasswordBulk(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            toast.success("Đặt lại mật khẩu hàng loạt thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Đặt lại mật khẩu hàng loạt thất bại");
        },
    });
};
