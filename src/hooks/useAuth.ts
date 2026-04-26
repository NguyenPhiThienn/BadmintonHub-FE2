import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { toast } from "react-toastify";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: any) => authApi.login(data),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: any) => authApi.register(data),
    onSuccess: () => {
      toast.success("Đăng ký thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Đăng ký thất bại");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.forgotPassword(data),
    onSuccess: () => {
      toast.success("Vui lòng kiểm tra email để đặt lại mật khẩu");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gửi yêu cầu thất bại");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.success("Đăng xuất thành công");
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (data: { refreshToken: string }) => authApi.refreshToken(data),
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.getMe(),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: any) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Đổi mật khẩu thất bại");
    },
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => authApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Cập nhật thông tin thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Cập nhật thông tin thất bại");
    },
  });
};

export const useRequestOtp = () => {
  return useMutation({
    mutationFn: (data: { identifier: string }) => authApi.requestOtp(data),
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: { identifier: string; otpCode: string }) => authApi.verifyOtp(data),
  });
};

export const useLoginPartner = () => {
  return useMutation({
    mutationFn: (data: any) => authApi.loginPartner(data),
  });
};

export const useLoginPartnerCheck = () => {
  return useMutation({
    mutationFn: (data: { username: string; password: string }) => authApi.loginPartnerCheck(data),
  });
};

export const useFirebaseLoginPartner = () => {
  return useMutation({
    mutationFn: (data: { idToken: string }) => authApi.firebaseLoginPartner(data),
  });
};
