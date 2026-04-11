import { testingApi } from "@/api/testing";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useDeviceTypes = () => {
    return useQuery({
        queryKey: ["device-types"],
        queryFn: () => testingApi.getDeviceTypes(),
    });
};

export const useDeviceTypeDetails = (id: string) => {
    return useQuery({
        queryKey: ["device-types", id],
        queryFn: () => testingApi.getDeviceTypeDetails(id),
        enabled: !!id,
    });
};

export const useCreateDeviceType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => testingApi.createDeviceType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["device-types"] });
            toast.success("Thêm loại thiết bị thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thêm loại thiết bị thất bại");
        },
    });
};

export const useUpdateDeviceType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            testingApi.updateDeviceType(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["device-types"] });
            toast.success("Cập nhật loại thiết bị thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật loại thiết bị thất bại");
        },
    });
};

export const useDeleteDeviceType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => testingApi.deleteDeviceType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["device-types"] });
            toast.success("Xóa loại thiết bị thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa loại thiết bị thất bại");
        },
    });
};

export const useUploadTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) =>
            testingApi.uploadTemplate(id, file),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["device-types", id] });
            toast.success("Cập nhật file mẫu thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật file mẫu thất bại");
        },
    });
};

export const useTestCategoryTree = (deviceTypeId: string) => {
    return useQuery({
        queryKey: ["test-categories", "tree", deviceTypeId],
        queryFn: () => testingApi.getTestCategoryTree(deviceTypeId),
        enabled: !!deviceTypeId,
    });
};

export const useCreateTestCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => testingApi.createTestCategory(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["test-categories", "tree", variables.deviceTypeId] });
            toast.success("Thêm hạng mục thí nghiệm thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thêm hạng mục thí nghiệm thất bại");
        },
    });
};

export const useUpdateTestCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            testingApi.updateTestCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["test-categories"] });
            toast.success("Cập nhật hạng mục thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật hạng mục thất bại");
        },
    });
};

export const useReorderTestCategories = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: string[]) => testingApi.reorderTestCategories(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["test-categories"] });
            toast.success("Cập nhật thứ tự thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật thứ tự thất bại");
        },
    });
};

export const useDeleteTestCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => testingApi.deleteTestCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["test-categories"] });
            toast.success("Xóa hạng mục thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa hạng mục thất bại");
        },
    });
};

export const useTestingDevices = (params?: any) => {
    return useQuery({
        queryKey: ["testing-devices", params],
        queryFn: () => testingApi.getTestingDevices(params),
    });
};

export const useTestingDeviceDetails = (id: string) => {
    return useQuery({
        queryKey: ["testing-devices", id],
        queryFn: () => testingApi.getTestingDeviceDetails(id),
        enabled: !!id,
    });
};

export const useCreateTestingDevice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => testingApi.createTestingDevice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testing-devices"] });
            toast.success("Thêm thiết bị thí nghiệm thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thêm thiết bị thí nghiệm thất bại");
        },
    });
};

export const useUpdateTestingDevice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            testingApi.updateTestingDevice(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testing-devices"] });
            toast.success("Cập nhật thiết bị thí nghiệm thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật thiết bị thí nghiệm thất bại");
        },
    });
};

export const useDeleteTestingDevice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => testingApi.deleteTestingDevice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testing-devices"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa thiết bị thí nghiệm thất bại");
        },
    });
};

export const useTestingDevicePartners = (params?: any) => {
    return useQuery({
        queryKey: ["testing-devices-partners", params],
        queryFn: () => testingApi.getTestingDevicePartners(params),
    });
};

export const useCreateTestJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => testingApi.createTestJob(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["test-jobs"] });
            toast.success("Thêm công việc thí nghiệm thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thêm công việc thí nghiệm thất bại");
        },
    });
};

export const useTestJobs = (params?: any) => {
    return useQuery({
        queryKey: ["test-jobs", params],
        queryFn: () => testingApi.getTestJobs(params),
    });
};

export const useTestJobDetails = (id: string) => {
    return useQuery({
        queryKey: ["test-jobs", id],
        queryFn: () => testingApi.getTestJobDetails(id),
        enabled: !!id,
    });
};

export const useUpdateTestJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            testingApi.updateTestJob(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["test-jobs"] });
            toast.success("Cập nhật công việc thí nghiệm thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật công việc thí nghiệm thất bại");
        },
    });
};

export const useDeleteTestJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => testingApi.deleteTestJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["test-jobs"] });
            toast.success("Xóa công việc thí nghiệm thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa công việc thí nghiệm thất bại");
        },
    });
};

export const useGroupedTestJobs = (params?: any) => {
    return useQuery({
        queryKey: ["test-jobs", "grouped", params],
        queryFn: () => testingApi.getGroupedTestJobs(params),
    });
};
