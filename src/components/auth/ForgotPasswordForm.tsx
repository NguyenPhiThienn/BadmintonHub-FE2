"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiEmailOutline, mdiArrowLeft, mdiSend, mdiLoading, mdiLockOutline, mdiEye, mdiEyeOff } from "@mdi/js";
import { useForgotPassword } from "@/hooks/useAuth";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface ForgotPasswordFormProps {
  onSwitchLogin?: () => void;
  isDialog?: boolean;
}

type Step = "email" | "otp" | "reset";

export const ForgotPasswordForm = ({ onSwitchLogin, isDialog }: ForgotPasswordFormProps) => {
  const { mutateAsync: forgotPassword, isPending: isSendingRequest } = useForgotPassword();

  const [step, setStep] = useState<Step>("email");
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm({ defaultValues: { email: "" } });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch,
    formState: { errors: resetErrors },
  } = useForm({ defaultValues: { password: "", confirmPassword: "" } });

  const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

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
    } catch {
      toast.error("Không thể gửi mã OTP. Vui lòng thử lại.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onEmailSubmit = async (data: { email: string }) => {
    const otp = generateOTP();
    setGeneratedOtp(otp);
    setSubmittedEmail(data.email);
    await sendOtpEmail(data.email, otp);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === generatedOtp) {
      setStep("reset");
    } else {
      toast.error("Mã OTP không chính xác");
    }
  };

  const onResetSubmit = async (data: { password: string; confirmPassword: string }) => {
    try {
      const response = await forgotPassword({ email: submittedEmail, newPassword: data.password } as any);
      if (response?.status === 200 || response?.statusCode === 200) {
        toast.success(response.message || "Đặt lại mật khẩu thành công!");
        if (onSwitchLogin) {
          onSwitchLogin();
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Đặt lại mật khẩu thất bại");
    }
  };

  const BackLink = () => (
    <div className="text-center">
      {isDialog ? (
        <button
          type="button"
          onClick={onSwitchLogin}
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-accent transition-colors"
        >
          <Icon path={mdiArrowLeft} size={0.6} />
          <span className="font-semibold text-sm">Quay lại đăng nhập</span>
        </button>
      ) : (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-accent transition-colors"
        >
          <Icon path={mdiArrowLeft} size={0.6} />
          <span className="font-semibold text-sm">Quay lại đăng nhập</span>
        </Link>
      )}
    </div>
  );

  // Step 1: Nhập email
  if (step === "email") {
    return (
      <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Địa chỉ Email</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
              <Icon path={mdiEmailOutline} size={0.8} />
            </div>
            <Input
              id="email"
              type="email"
              {...registerEmail("email", {
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
          {emailErrors.email && (
            <p className="text-red-500 text-sm italic">{emailErrors.email.message as string}</p>
          )}
        </div>

        <Button type="submit" disabled={isSendingOtp} className="w-full">
          {isSendingOtp ? (
            <>
              <Icon path={mdiLoading} size={0.8} className="animate-spin" />
              Đang gửi mã OTP...
            </>
          ) : (
            <>
              <Icon path={mdiSend} size={0.8} />
              Gửi mã xác nhận
            </>
          )}
        </Button>

        <BackLink />
      </form>
    );
  }

  // Step 2: Nhập OTP
  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-neutral-300">Xác thực Email</h3>
          <p className="text-sm text-neutral-400">
            Chúng tôi đã gửi mã OTP 4 số đến <span className="text-accent font-semibold">{submittedEmail}</span>
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
            disabled={otpInput.length < 4}
          >
            Xác nhận mã OTP
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setStep("email")}
          >
            Quay lại
          </Button>

          <p className="text-center text-xs text-neutral-500">
            Không nhận được mã?{" "}
            <button
              type="button"
              className="text-accent hover:underline"
              onClick={() => sendOtpEmail(submittedEmail, generatedOtp)}
              disabled={isSendingOtp}
            >
              {isSendingOtp ? "Đang gửi..." : "Gửi lại mã"}
            </button>
          </p>
        </div>
      </form>
    );
  }

  // Step 3: Nhập mật khẩu mới
  return (
    <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-neutral-300">Đặt lại mật khẩu</h3>
        <p className="text-sm text-neutral-400">Nhập mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu mới</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
            <Icon path={mdiLockOutline} size={0.8} />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...registerReset("password", {
              required: "Vui lòng nhập mật khẩu mới",
              minLength: { value: 6, message: "Mật khẩu phải ít nhất 6 ký tự" }
            })}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-accent transition-colors"
          >
            <Icon path={showPassword ? mdiEyeOff : mdiEye} size={0.8} className="flex-shrink-0" />
          </button>
        </div>
        {resetErrors.password && (
          <p className="text-red-500 text-sm italic">{resetErrors.password.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
            <Icon path={mdiLockOutline} size={0.8} />
          </div>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            {...registerReset("confirmPassword", {
              required: "Vui lòng xác nhận mật khẩu",
              validate: (value) => value === watch("password") || "Mật khẩu không khớp"
            })}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-accent transition-colors"
          >
            <Icon path={showConfirmPassword ? mdiEyeOff : mdiEye} size={0.8} className="flex-shrink-0" />
          </button>
        </div>
        {resetErrors.confirmPassword && (
          <p className="text-red-500 text-sm italic">{resetErrors.confirmPassword.message as string}</p>
        )}
      </div>

      <Button type="submit" disabled={isSendingRequest} className="w-full">
        {isSendingRequest ? (
          <>
            <Icon path={mdiLoading} size={0.8} className="animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <Icon path={mdiSend} size={0.8} />
            Đặt lại mật khẩu
          </>
        )}
      </Button>

      <BackLink />
    </form>
  );
};
