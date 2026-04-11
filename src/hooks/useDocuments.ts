import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "@/api/documents";
import { toast } from "react-toastify";
import { ICreateDocumentRequest, IUpdateDocumentRequest } from "@/interface/document";

export const useDocuments = (params: any) => {
    return useQuery({
        queryKey: ["documents", params],
        queryFn: () => documentApi.getDocuments(params),
    });
};

export const useDocumentDetails = (id: string | null) => {
    return useQuery({
        queryKey: ["documents", id],
        queryFn: () => documentApi.getDocumentDetails(id!),
        enabled: !!id,
    });
};

export const useCreateDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ICreateDocumentRequest) => documentApi.createDocument(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            toast.success("Tạo văn bản thành công");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Tạo văn bản thất bại");
        },
    });
};

export const useUpdateDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: IUpdateDocumentRequest }) =>
            documentApi.updateDocument(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            toast.success("Cập nhật văn bản thành công");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Cập nhật văn bản thất bại");
        },
    });
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => documentApi.deleteDocument(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Xóa văn bản thất bại");
        },
    });
};
