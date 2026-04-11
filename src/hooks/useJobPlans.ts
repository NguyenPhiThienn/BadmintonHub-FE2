import { jobPlansApi } from "@/api/jobPlans";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useJobPlans = (params?: any) => {
    return useQuery({
        queryKey: ["job-plans", params],
        queryFn: () => jobPlansApi.getJobPlans(params),
    });
};

export const useJobPlanDetails = (id: string) => {
    return useQuery({
        queryKey: ["job-plans", id],
        queryFn: () => jobPlansApi.getJobPlanDetails(id),
        enabled: !!id,
    });
};

export const useCreateJobPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => jobPlansApi.createJobPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["job-plans"] });
            toast.success("Tạo phương án công việc thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Tạo phương án công việc thất bại");
        },
    });
};

export const useUpdateJobPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            jobPlansApi.updateJobPlan(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["job-plans"] });
            toast.success("Cập nhật phương án công việc thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật phương án công việc thất bại");
        },
    });
};

export const useDeleteJobPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => jobPlansApi.deleteJobPlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["job-plans"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa phương án công việc thất bại");
        },
    });
};

export const useCreateVersion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            jobPlansApi.createVersion(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["job-plans", id] });
            queryClient.invalidateQueries({ queryKey: ["job-plans", id, "versions"] });
            toast.success("Thêm phiên bản mới thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thêm phiên bản mới thất bại");
        },
    });
};

export const useJobPlanVersions = (id: string) => {
    return useQuery({
        queryKey: ["job-plans", id, "versions"],
        queryFn: () => jobPlansApi.getVersionList(id),
        enabled: !!id,
    });
};

export const useUpdateVersion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            jobPlansApi.updateVersion(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["job-plans", id] });
            queryClient.invalidateQueries({ queryKey: ["job-plans", id, "versions"] });
            toast.success("Cập nhật phiên bản thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật phiên bản thất bại");
        },
    });
};

export const useDeleteVersion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ planId, versionId }: { planId: string; versionId: string }) =>
            jobPlansApi.deleteVersion(planId, versionId),
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: ["job-plans", planId] });
            queryClient.invalidateQueries({ queryKey: ["job-plans", planId, "versions"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa phiên bản thất bại");
        },
    });
};

export const useDeleteFileVersion = () => {
    const queryClient = useQueryClient();
    const updateVersionMutation = useUpdateVersion();

    return useMutation({
        mutationFn: async ({ planId, version, fileUrl }: { planId: string; version: any; fileUrl: string }) => {
            const currentFiles = version.files || [];
            const newFiles = currentFiles.filter((file: any) => file.fileUrl !== fileUrl);

            const sanitizedFiles = newFiles.map(({ _id, ...rest }: any) => rest);

            return updateVersionMutation.mutateAsync({
                id: planId,
                data: {
                    name: version.name,
                    notes: version.notes,
                    files: sanitizedFiles
                }
            });
        },
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: ["job-plans", planId] });
            queryClient.invalidateQueries({ queryKey: ["job-plans", planId, "versions"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa tệp thất bại");
        }
    });
};

// Chat / Messaging Hooks
export const useJobPlanMessages = (id: string) => {
    return useQuery({
        queryKey: ["job-plans", id, "messages"],
        queryFn: () => jobPlansApi.getMessages(id),
        enabled: !!id,
        refetchInterval: 3000, // Tự động refresh sau 3s để giả lập realtime
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            jobPlansApi.sendMessage(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["job-plans", id, "messages"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Gửi tin nhắn thất bại");
        },
    });
};
export const useRecallMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, messageId }: { id: string; messageId: string }) =>
            jobPlansApi.recallMessage(id, messageId),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["job-plans", id, "messages"] });
            toast.success("Đã thu hồi tin nhắn");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thu hồi tin nhắn thất bại");
        },
    });
};

export const useDeleteMessageForMe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, messageId }: { id: string; messageId: string }) =>
            jobPlansApi.deleteMessageForMe(id, messageId),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["job-plans", id, "messages"] });
            toast.success("Đã xóa tin nhắn phía bạn");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa tin nhắn thất bại");
        },
    });
};
