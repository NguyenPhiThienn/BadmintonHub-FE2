"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiEmailOutline, mdiArrowLeft, mdiSend, mdiLoading } from "@mdi/js";
import { useForgotPassword } from "@/hooks/useAuth";
import Link from "next/link";
import { toast } from "react-toastify";

interface ForgotPasswordFormProps {
  onSwitchLogin?: () => void;
  isDialog?: boolean;
}

export const ForgotPasswordForm = ({ onSwitchLogin, isDialog }: ForgotPasswordFormProps) => {
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      const response = await forgotPassword(data);
      if (response?.status === 200 || response?.statusCode === 200) {
        toast.success(response.message || "Vui lòng kiểm tra email để đặt lại mật khẩu");
      }
    } catch (error: any) {
      toast.error(error?.message || "Gửi yêu cầu thất bại");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Địa chỉ Email</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
            <Icon path={mdiEmailOutline} size={0.8} />
          </div>
          <Input
            id="email"
            type="email"
            {...register("email", { 
              required: "Vui lòng nhập email",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email không hợp lệ"
              }
            })}
            placeholder="example@gmail.com"
            className="pl-10"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm italic">{errors.email.message as string}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Icon path={mdiLoading} size={0.8} className="animate-spin" />
            Đang gửi yêu cầu...
          </>
        ) : (
          <>
            <Icon path={mdiSend} size={0.8} />
            Gửi yêu cầu đặt lại
          </>
        )}
      </Button>

      <div className="text-center">
        {isDialog ? (
          <button 
            type="button"
            onClick={onSwitchLogin}
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-accent transition-colors"
          >
            <Icon path={mdiArrowLeft} size={0.6} />
            Quay lại đăng nhập
          </button>
        ) : (
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-accent transition-colors"
          >
            <Icon path={mdiArrowLeft} size={0.6} />
            Quay lại đăng nhập
          </Link>
        )}
      </div>
    </form>
  );
};
