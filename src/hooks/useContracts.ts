import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contractApi } from "@/api/contracts";
import { toast } from "react-toastify";
import { ICreateContractRequest, IUpdateContractRequest } from "@/interface/contract";

export const useContracts = (params: any) => {
    return useQuery({
        queryKey: ["contracts", params],
        queryFn: () => contractApi.getContracts(params),
    });
};

export const useContractDetails = (id: string | null) => {
    return useQuery({
        queryKey: ["contracts", id],
        queryFn: () => contractApi.getContractDetails(id!),
        enabled: !!id,
    });
};

export const useCreateContract = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ICreateContractRequest) => contractApi.createContract(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
            toast.success("Tạo hợp đồng thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Tạo hợp đồng thất bại");
        },
    });
};

export const useUpdateContract = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: IUpdateContractRequest }) =>
            contractApi.updateContract(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
            toast.success("Cập nhật hợp đồng thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Cập nhật hợp đồng thất bại");
        },
    });
};

export const useDeleteContract = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => contractApi.deleteContract(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Xóa hợp đồng thất bại");
        },
    });
};

export const useSearchContracts = (params: any) => {
    return useQuery({
        queryKey: ["contracts", "search", params],
        queryFn: () => contractApi.searchContracts(params),
        enabled: !!params.searchTerm || !!params.contractNumber,
    });
};
