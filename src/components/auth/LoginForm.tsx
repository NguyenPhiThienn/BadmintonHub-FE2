"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiEmailOutline, mdiLockOutline, mdiEye, mdiEyeOff, mdiLogin, mdiLoading } from "@mdi/js";
import { useLogin } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser } from "@/context/useUserContext";

interface LoginFormProps {
  onSwitchRegister?: () => void;
  onSwitchForgot?: () => void;
  isDialog?: boolean;
  onSuccess?: () => void;
}

export const LoginForm = ({ onSwitchRegister, onSwitchForgot, isDialog, onSuccess }: LoginFormProps) => {
  const router = useRouter();
  const { mutateAsync: login, isPending } = useLogin();
  const { loginUser: setUserContext, fetchUserProfile } = useUser();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await login(data);
      if ((response?.status === 200 || response?.statusCode === 200) && response?.data?.accessToken) {
        const { accessToken, refreshToken, user } = response.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        setUserContext(user, accessToken);
        await fetchUserProfile();

        toast.success(response.message || "Đăng nhập thành công");
        router.push("/");
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      toast.error(error?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
      <div className="space-y-1">
        <Label htmlFor="identifier">Email hoặc Số điện thoại</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
            <Icon path={mdiEmailOutline} size={0.8} />
          </div>
          <Input
            id="identifier"
            {...register("identifier", { required: "Vui lòng nhập email hoặc số điện thoại" })}
            placeholder="Ví dụ: example@gmail.com"
            className="pl-10"
            autoComplete="off"
          />
        </div>
        {errors.identifier && (
          <p className="text-red-500 text-sm italic">{errors.identifier.message as string}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Mật khẩu</Label>
          {isDialog ? (
            <button
              type="button"
              onClick={onSwitchForgot}
              className="text-accent font-semibold hover:underline text-sm"
            >
              Quên mật khẩu?
            </button>
          ) : (
            <Link
              href="/forgot-password"
              className="text-accent font-semibold hover:underline text-sm"
            >
              Quên mật khẩu?
            </Link>
          )}
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
            <Icon path={mdiLockOutline} size={0.8} />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password", { required: "Vui lòng nhập mật khẩu" })}
            className="pl-10 pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-accent transition-colors"
          >
            <Icon path={showPassword ? mdiEyeOff : mdiEye} size={0.8} className="flex-shrink-0" />
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm italic">{errors.password.message as string}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Icon path={mdiLoading} size={0.8} className="animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <Icon path={mdiLogin} size={0.8} />
            Đăng nhập
          </>
        )}
      </Button>

      <p className="text-center text-sm text-neutral-400">
        Chưa có tài khoản?{" "}
        {isDialog ? (
          <button
            type="button"
            onClick={onSwitchRegister}
            className="text-accent font-semibold hover:underline"
          >
            Đăng ký ngay
          </button>
        ) : (
          <Link href="/register" className="text-accent font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        )}
      </p>
    </form>
  );
};
