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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
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

  // OTP States
  const [step, setStep] = useState<"register" | "otp">("register");
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [formData, setFormData] = useState<any>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "PLAYER",
    },
  });

  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const sendOtpEmail = async (email: string, otp: string) => {
    setIsSendingOtp(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) throw new Error("Failed to send OTP");

      toast.info("Mã OTP đã được gửi đến email của bạn");
      setStep("otp");
    } catch (error) {
      toast.error("Không thể gửi mã OTP. Vui lòng thử lại.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (data: any) => {
    const otp = generateOTP();
    setGeneratedOtp(otp);
    setFormData(data);
    await sendOtpEmail(data.email, otp);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === generatedOtp) {
      try {
        const response = await registerUser(formData);
        if (response?.status === 201 || response?.statusCode === 201) {
          toast.success(response.message || "Đăng ký thành công");
          if (onSwitchLogin) {
            onSwitchLogin();
          } else {
            router.push("/login");
          }
        }
      } catch (error: any) {
        toast.error(error?.message || "Đăng ký thất bại");
      }
    } else {
      toast.error("Mã OTP không chính xác");
    }
  };

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-neutral-300">Xác thực Email</h3>
          <p className="text-sm text-neutral-400">
            Chúng tôi đã gửi mã OTP 4 số đến <span className="text-accent font-semibold">{formData?.email}</span>
          </p>
        </div>

        <div className="flex justify-center py-4">
          <InputOTP
            maxLength={4}
            value={otpInput}
            onChange={(value) => setOtpInput(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-14 text-accent text-3xl border-darkBorderV1 focus:border-accent" />
              <InputOTPSlot index={1} className="w-12 h-14 text-accent text-3xl border-darkBorderV1 focus:border-accent" />
              <InputOTPSlot index={2} className="w-12 h-14 text-accent text-3xl border-darkBorderV1 focus:border-accent" />
              <InputOTPSlot index={3} className="w-12 h-14 text-accent text-3xl border-darkBorderV1 focus:border-accent" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full"
            type="submit"
            disabled={isPending || otpInput.length < 4}
          >
            {isPending ? (
              <Icon path={mdiLoading} size={0.8} className="animate-spin" />
            ) : "Xác nhận & Đăng ký"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setStep("register")}
          >
            Quay lại
          </Button>

          <p className="text-center text-xs text-neutral-500">
            Không nhận được mã?{" "}
            <button
              type="button"
              className="text-accent hover:underline"
              onClick={() => sendOtpEmail(formData.email, generatedOtp)}
              disabled={isSendingOtp}
            >
              {isSendingOtp ? "Đang gửi..." : "Gửi lại mã"}
            </button>
          </p>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
      <div className="space-y-1">
        <Label htmlFor="fullName">Họ và Tên</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
            <Icon path={mdiAccountOutline} size={0.8} />
          </div>
          <Input
            id="fullName"
            {...register("fullName", { required: "Vui lòng nhập họ và tên" })}
            placeholder="Nguyễn Văn A"
            className="pl-10"
            autoComplete="off"
          />
        </div>
        {errors.fullName && (
          <p className="text-red-500 text-sm italic">{errors.fullName?.message as string}</p>
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
        <Button type="submit" disabled={isSendingOtp} className="w-full">
          {isSendingOtp ? (
            <>
              <Icon path={mdiLoading} size={0.8} className="animate-spin" />
              Đang xử lý...
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
