import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workScheduleApi } from "@/api/workSchedule";
import { toast } from "react-toastify";
import {
    IWorkScheduleCreate,
    IWorkScheduleUpdate,
    IWorkScheduleSearchParams,
    IWorkScheduleCalendarParams,
} from "@/interface/workSchedule";

export const useWorkSchedules = (params: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ["work-schedules", params],
        queryFn: () => workScheduleApi.getWorkSchedules(params),
    });
};

export const useWorkScheduleDetails = (id: string) => {
    return useQuery({
        queryKey: ["work-schedules", id],
        queryFn: () => workScheduleApi.getWorkScheduleDetails(id),
        enabled: !!id,
    });
};

export const useSearchWorkSchedules = (params: IWorkScheduleSearchParams) => {
    return useQuery({
        queryKey: ["work-schedules", "search", params],
        queryFn: () => workScheduleApi.searchWorkSchedules(params),
        enabled: !!(
            params.employeeId ||
            params.startDate ||
            params.endDate ||
            params.status
        ),
    });
};

export const useWorkSchedulesByEmployee = (employeeId: string) => {
    return useQuery({
        queryKey: ["work-schedules", "employee", employeeId],
        queryFn: () => workScheduleApi.getWorkSchedulesByEmployee(employeeId),
        enabled: !!employeeId,
    });
};

export const useWorkScheduleCalendar = (params: IWorkScheduleCalendarParams) => {
    return useQuery({
        queryKey: ["work-schedules", "calendar", params],
        queryFn: () => workScheduleApi.getWorkScheduleCalendar(params),
        enabled: !!(params.month && params.year),
    });
};

export const useMyWorkScheduleCalendar = (params: { month: number; year: number }) => {
    return useQuery({
        queryKey: ["work-schedules", "me", params],
        queryFn: () => workScheduleApi.getMyWorkScheduleCalendar(params),
        enabled: !!(params.month && params.year),
    });
};

export const useCreateWorkSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IWorkScheduleCreate) =>
            workScheduleApi.createWorkSchedule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["work-schedules"] });
            toast.success("Tạo lịch làm việc thành công");
        },
        onError: (error: any) => {
            const message = error?.message || error?.response?.data?.message;
            toast.error(Array.isArray(message) ? message[0] : (message || "Tạo lịch làm việc thất bại"));
        },
    });
};

export const useUpdateWorkSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: IWorkScheduleUpdate }) =>
            workScheduleApi.updateWorkSchedule(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["work-schedules"] });
            toast.success("Cập nhật lịch làm việc thành công");
        },
        onError: (error: any) => {
            const message = error?.message || error?.response?.data?.message;
            toast.error(Array.isArray(message) ? message[0] : (message || "Cập nhật lịch làm việc thất bại"));
        },
    });
};

export const useDeleteWorkSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => workScheduleApi.deleteWorkSchedule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["work-schedules"] });
        },
        onError: (error: any) => {
            const message = error?.message || error?.response?.data?.message;
            toast.error(Array.isArray(message) ? message[0] : (message || "Xóa lịch làm việc thất bại"));
        },
    });
};
