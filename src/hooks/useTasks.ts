import { taskApi } from "@/api/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// --- SUB-MODULE 4A: TASK ASSIGNMENT ---

export const useTasks = (params: any) => {
    return useQuery({
        queryKey: ["tasks", params],
        queryFn: () => taskApi.getTasks(params),
    });
};

export const useOverdueTasks = () => {
    return useQuery({
        queryKey: ["tasks", "overdue"],
        queryFn: () => taskApi.getOverdueTasks(),
    });
};

export const useTaskStatistics = () => {
    return useQuery({
        queryKey: ["tasks", "statistics"],
        queryFn: () => taskApi.getTaskStatistics(),
    });
};

export const useTaskDetails = (id: string) => {
    return useQuery({
        queryKey: ["tasks", id],
        queryFn: () => taskApi.getTaskDetails(id),
        enabled: !!id,
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => taskApi.createTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Tạo công việc thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Tạo công việc thất bại");
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            taskApi.updateTask(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => taskApi.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
};

export const useConstructionLogs = (params: any) => {
    return useQuery({
        queryKey: ["construction-logs", params],
        queryFn: () => taskApi.getLogs(params),
    });
};

export const useLogAutocomplete = () => {
    return useQuery({
        queryKey: ["construction-logs", "autocomplete"],
        queryFn: () => taskApi.getAutocomplete(),
    });
};

export const useLogDetails = (id: string) => {
    return useQuery({
        queryKey: ["construction-logs", id],
        queryFn: () => taskApi.getLogDetails(id),
        enabled: !!id,
    });
};

export const useCreateLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => taskApi.createLog(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-logs"] });
        },
    });
};

export const useStartNewDay = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { newDate: string; projectName: string; constructionName: string }) =>
            taskApi.startNewDay(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-logs"] });
        },
    });
};

export const useEndShiftByLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { endTime: string; shiftSummary: string } }) =>
            taskApi.endShift(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-logs"] });
        },
    });
};

export const useUpdateLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            taskApi.updateLog(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-logs"] });
        },
    });
};

export const useDeleteLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => taskApi.deleteLog(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-logs"] });
        },
    });
};
