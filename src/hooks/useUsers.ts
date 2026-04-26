import { usersApi } from "@/api/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useUsers = (params: { page: number; limit: number; role?: string; search?: string; status?: string }) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.getUsers(params),
  });
};

export const useUserById = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Cập nhật thông tin người dùng thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Cập nhật thông tin người dùng thất bại");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Xóa người dùng thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xóa người dùng thất bại");
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Thêm người dùng thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Thêm người dùng thất bại");
    },
  });
};

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: (id: string) => usersApi.resetPassword(id),
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu người dùng thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Đặt lại mật khẩu người dùng thất bại");
    },
  });
};
