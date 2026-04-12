"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/mdi-icon";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  mdiAccountOutline,
  mdiEmailOutline,
  mdiPhoneOutline,
  mdiLockOutline,
  mdiEye,
  mdiEyeOff,
  mdiAccountPlus,
  mdiLoading
} from "@mdi/js";
import { useRegister } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface RegisterFormProps {
  onSwitchLogin?: () => void;
  isDialog?: boolean;
}

export const RegisterForm = ({ onSwitchLogin, isDialog }: RegisterFormProps) => {
  const router = useRouter();
  const { mutateAsync: registerUser, isPending } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      role: "PLAYER",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await registerUser(data);
      if (response?.status === 201 || response?.statusCode === 201) {
        toast.success(response.message || "Đăng ký thành công");
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(error?.message || "Đăng ký thất bại");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
      <div className="space-y-1">
        <Label htmlFor="full_name">Họ và Tên</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
            <Icon path={mdiAccountOutline} size={0.8} />
          </div>
          <Input
            id="full_name"
            {...register("full_name", { required: "Vui lòng nhập họ và tên" })}
            placeholder="Nguyễn Văn A"
            className="pl-10"
            autoComplete="off"
          />
        </div>
        {errors.full_name && (
          <p className="text-red-500 text-sm italic">{errors.full_name?.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
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
              autoComplete="off"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm italic">{errors.email.message as string}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone">Số điện thoại</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
              <Icon path={mdiPhoneOutline} size={0.8} />
            </div>
            <Input
              id="phone"
              {...register("phone", { required: "Vui lòng nhập số điện thoại" })}
              placeholder="0912345678"
              className="pl-10"
              autoComplete="off"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm italic">{errors.phone.message as string}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
            <Icon path={mdiLockOutline} size={0.8} />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password", {
              required: "Vui lòng nhập mật khẩu",
              minLength: { value: 6, message: "Mật khẩu phải ít nhất 6 ký tự" }
            })}
            placeholder="••••••••"
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

      <div className="space-y-2">
        <Label>Bạn đăng ký với tư cách là</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex gap-4 mt-1"
            >
              <div className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="PLAYER" id="player" />
                <Label htmlFor="player" className="cursor-pointer font-normal text-neutral-300">Người chơi</Label>
              </div>
              <div className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="COURT_OWNER" id="owner" />
                <Label htmlFor="owner" className="cursor-pointer font-normal text-neutral-300">Chủ sân</Label>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Icon path={mdiLoading} size={0.8} className="animate-spin" />
              Đang đăng ký...
            </>
          ) : (
            <>
              <Icon path={mdiAccountPlus} size={0.8} />
              Đăng ký tài khoản
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-sm text-neutral-400">
        Đã có tài khoản?{" "}
        {isDialog ? (
          <button
            type="button"
            onClick={onSwitchLogin}
            className="text-accent font-semibold hover:underline"
          >
            Đăng nhập ngay
          </button>
        ) : (
          <Link href="/login" className="text-accent font-semibold hover:underline">
            Đăng nhập ngay
          </Link>
        )}
      </p>
    </form>
  );
};
