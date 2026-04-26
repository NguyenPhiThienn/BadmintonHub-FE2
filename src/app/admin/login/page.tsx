"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/useUserContext";
import { useLogin, useRequestOtp, useVerifyOtp } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { mdiAccount, mdiKeyboardBackspace, mdiLock, mdiLogin } from "@mdi/js";
import Icon from "@mdi/react";
import { Eye, EyeSlash } from "iconsax-reactjs";
import { OTPInput, SlotProps } from "input-otp";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

import { useResponsive } from "@/hooks/use-mobile";

interface LoginPageProps {
  formData: any;
  errors: any;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isPending: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  // OTP props
  showOtpForm: boolean;
  otpValue: string;
  setOtpValue: (value: string) => void;
  handleVerifyOtp: () => void;
  isVerifyingOtp: boolean;
  handleBackToLogin: () => void;
}

// OTP Slot component
function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "relative w-10 h-14 text-[2rem] text-neutral-300",
        "flex items-center justify-center",
        "transition-all duration-300",
        "border-y border-r first:border-l first:rounded-l-md last:rounded-r-md",
        "outline outline-0",
        props.isActive ? "outline-4 outline-primary border-primary" : ""
      )}
      style={{
        borderColor: props.isActive ? undefined : "#233738",
        outlineColor: props.isActive ? undefined : "rgba(35, 55, 56, 0.4)",
      }}
    >
      <div className="group-has-[input[data-input-otp-placeholder-shown]]:opacity-20">
        {props.char ?? props.placeholderChar}
      </div>
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  );
}

function FakeCaret() {
  return (
    <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div className="w-px h-8 bg-white" />
    </div>
  );
}

function FakeDash() {
  return (
    <div className="flex w-10 justify-center items-center">
      <div className="w-3 h-1 rounded-full" style={{ backgroundColor: "#233738" }} />
    </div>
  );
}

// Reusable OTP Form component
function OtpForm({
  otpValue,
  setOtpValue,
  handleVerifyOtp,
  isVerifyingOtp,
  handleBackToLogin,
  employeeCode,
  variant = "dark",
}: {
  otpValue: string;
  setOtpValue: (value: string) => void;
  handleVerifyOtp: () => void;
  isVerifyingOtp: boolean;
  handleBackToLogin: () => void;
  employeeCode: string;
  variant?: "dark" | "light";
}) {
  const isDark = variant === "dark";

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p className="text-neutral-400">
          Vui lòng nhập OTP để xác thực quyền truy cập
        </p>
        <p
          className={cn(
            "text-sm font-semibold",
            isDark ? "text-primary" : "text-primary"
          )}
        >
          Mã nhân viên: {employeeCode}
        </p>
      </div>

      <div className="flex justify-center">
        <OTPInput
          maxLength={6}
          value={otpValue}
          onChange={setOtpValue}
          containerClassName="group flex items-center has-[:disabled]:opacity-30"
          render={({ slots }) => (
            <>
              <div className="flex">
                {slots.slice(0, 3).map((slot, idx) => (
                  <Slot key={idx} {...slot} />
                ))}
              </div>

              <FakeDash />

              <div className="flex">
                {slots.slice(3).map((slot, idx) => (
                  <Slot key={idx} {...slot} />
                ))}
              </div>
            </>
          )}
        />
      </div>

      <div className="space-y-4">
        <Button
          type="button"
          onClick={handleVerifyOtp}
          disabled={isVerifyingOtp || otpValue.length !== 6}
          className="w-full"
        >
          {isVerifyingOtp ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Đang xác thực...
            </div>
          ) : (
            <span className="flex items-center gap-2">
              Xác thực OTP
              <Icon path={mdiLogin} size={0.8} className="flex-shrink-0" />
            </span>
          )}
        </Button>

        <button
          type="button"
          onClick={handleBackToLogin}
          className={cn(
            "w-full text-sm py-2 text-neutral-400 hover:text-primary transition-colors flex items-center justify-center gap-2"
          )}
        >
          <Icon path={mdiKeyboardBackspace} size={0.8} className="flex-shrink-0" />
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();
  const { mutateAsync: loginUser, isPending } = useLogin();
  const { mutateAsync: requestOtp, isPending: isRequestingOtp } = useRequestOtp();
  const { mutateAsync: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp();
  const { loginUser: setUserContext, fetchUserProfile } = useUser();

  const [formData, setFormData] = useState({
    employeeCode: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    employeeCode?: string;
    password?: string;
    general?: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.employeeCode) {
      newErrors.employeeCode = "Mã nhân viên là bắt buộc";
    }
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const loginResponse = await loginUser({
        employeeCode: formData.employeeCode,
        password: formData.password,
      });

      if (
        loginResponse?.statusCode === 200 &&
        loginResponse?.data?.accessToken
      ) {
        const { accessToken, refreshToken, user } = loginResponse.data;
        const role = user.role.toLowerCase();

        localStorage.setItem("token", accessToken);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userProfile", JSON.stringify(loginResponse));
        localStorage.setItem("user", JSON.stringify(user));

        setUserContext(user, accessToken);

        try {
          await fetchUserProfile();
        } catch (err) {
          console.error(err);
        }

        toast.success(loginResponse?.message || "Đăng nhập thành công!");

        let redirectPath = "/admin";
        if (role === "partner") {
          redirectPath = "/partner/testing-devices";
        } else if (role !== "admin") {
          redirectPath = "/admin/profile";
        }
        router.push(redirectPath);
      } else {
        toast.error("Đăng nhập thất bại: Phản hồi từ máy chủ không hợp lệ");
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        "Đăng nhập thất bại";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if this employee code requires OTP
    if (formData.employeeCode === "NV001") {
      try {
        const otpResponse = await requestOtp({
          employeeCode: formData.employeeCode,
        });

        if (otpResponse?.statusCode === 200) {
          toast.success(otpResponse?.message || "Mã OTP đã được gửi!");
          setShowOtpForm(true);
          setOtpValue("");
        } else {
          toast.error("Gửi mã OTP thất bại");
        }
      } catch (error: any) {
        toast.error(error?.message || "Gửi mã OTP thất bại");
      }
    } else {
      await handleLogin();
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    try {
      const verifyResponse = await verifyOtp({
        employeeCode: formData.employeeCode,
        otpCode: otpValue,
      });

      if (verifyResponse?.statusCode === 200) {
        toast.success("Xác thực OTP thành công!");
        // After OTP verification, proceed with login
        await handleLogin();
      } else {
        toast.error("Xác thực OTP thất bại");
      }
    } catch (error: any) {
      toast.error(error?.message || "Xác thực OTP thất bại");
    }
  };

  const handleBackToLogin = () => {
    setShowOtpForm(false);
    setOtpValue("");
  };

  const props = {
    formData,
    errors,
    showPassword,
    setShowPassword,
    isPending: isPending || isRequestingOtp,
    handleInputChange,
    handleSubmit,
    showOtpForm,
    otpValue,
    setOtpValue,
    handleVerifyOtp,
    isVerifyingOtp,
    handleBackToLogin,
  };

  if (isMobile) {
    return <MobileLoginPage {...props} />;
  }

  if (isTablet) {
    return <TabletLoginPage {...props} />;
  }

  return <DesktopLoginPage {...props} />;
}

function MobileLoginPage({
  formData,
  errors,
  showPassword,
  setShowPassword,
  isPending,
  handleInputChange,
  handleSubmit,
  showOtpForm,
  otpValue,
  setOtpValue,
  handleVerifyOtp,
  isVerifyingOtp,
  handleBackToLogin,
}: LoginPageProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/images/login-mobile-bg.webp')" }}
    >
      <div className="absolute inset-0 bg-darkBackgroundV1/60 backdrop-blur-[2px]" />

      <div className="w-full max-w-sm bg-darkBorderV1/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 p-4">
        <div className="max-w-md mx-auto w-full space-y-4">
          {/* Header */}
          <div className="text-center space-y-4 md:space-y-4 flex flex-col items-center">
            <img src="/images/logo.webp" alt="Logo" className="h-24 w-24 rounded-full" draggable={false} />
            <h2 className="text-xl font-semibold text-secondary uppercase">
              Đăng nhập hệ thống
            </h2>
            <p className="text-neutral-400 text-sm text-center">
              Đăng nhập vào BadmintonHub với quyền quản trị viên
            </p>
          </div>

          {showOtpForm ? (
            <OtpForm
              otpValue={otpValue}
              setOtpValue={setOtpValue}
              handleVerifyOtp={handleVerifyOtp}
              isVerifyingOtp={isVerifyingOtp}
              handleBackToLogin={handleBackToLogin}
              employeeCode={formData.employeeCode}
              variant="dark"
            />
          ) : (
            /* Form */
            <form className="space-y-4" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <div className="space-y-1">
                <Label
                  htmlFor="employeeCode-mobile"
                >
                  Mã nhân viên
                </Label>
                <div className="relative">
                  <Icon
                    path={mdiAccount}
                    size={0.8}
                    color="#a3a3a3"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                  />
                  <Input
                    id="employeeCode-mobile"
                    name="employeeCode"
                    type="text"
                    value={formData.employeeCode}
                    onChange={handleInputChange}
                    disabled={isPending}
                    className="border-0 border-b border-neutral-400 !bg-transparent rounded-none pl-9 pr-0 focus-visible:ring-0 focus-visible:border-primary !text-neutral-400 placeholder:text-neutral-400 h-10 transition-colors w-full"
                  />
                </div>
                {errors.employeeCode && (
                  <p className="text-red-400 text-sm mt-1">{errors.employeeCode}</p>
                )}
              </div>


              <div className="space-y-1">
                <Label
                  htmlFor="password-mobile"
                >
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Icon
                    path={mdiLock}
                    size={0.8}
                    color="#a3a3a3"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                  />
                  <Input
                    id="password-mobile"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isPending}
                    className="border-0 border-b border-neutral-400 !bg-transparent rounded-none pl-9 pr-10 focus-visible:ring-0 focus-visible:border-primary !text-neutral-400 placeholder:text-neutral-400 h-10 transition-colors w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary"
                  >
                    {showPassword ? (
                      <EyeSlash size="18" color="#a3a3a3" />
                    ) : (
                      <Eye size="18" color="#a3a3a3" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>
              {/* Login Button */}
              <Button type="submit" disabled={isPending} className="flex-1 w-full">
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-darkBackgroundV1/30 border-t-darkBackgroundV1 rounded-full animate-spin"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  <>
                    Đăng nhập
                    <Icon path={mdiLogin} size={0.8} className="flex-shrink-0" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function TabletLoginPage({
  formData,
  errors,
  showPassword,
  setShowPassword,
  isPending,
  handleInputChange,
  handleSubmit,
  showOtpForm,
  otpValue,
  setOtpValue,
  handleVerifyOtp,
  isVerifyingOtp,
  handleBackToLogin,
}: LoginPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBackgroundV1 p-4 relative overflow-hidden w-full">
      {/* Background decorative shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />

      <div className="w-full max-w-2xl bg-darkCardV1 border border-darkBorderV1 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        <div className="flex flex-col">
          {/* Top Banner for Tablet */}
          <div
            style={{
              backgroundImage: "url('/images/login-bg.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "180px"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-darkBackgroundV1/40 backdrop-blur-[2px]" />
          </div>

          {/* Form Area */}
          <div className="p-10">
            <div className="max-w-md mx-auto w-full space-y-8">
              {/* Header */}
              <div className="text-center space-y-4 md:space-y-4 flex flex-col items-center">
                <img src="/images/logo.webp" alt="Logo" className="h-24 w-24" draggable={false} />
                <h2 className="text-2xl font-semibold text-primary uppercase">
                  Đăng nhập hệ thống
                </h2>
                <p className="text-neutral-400 text-sm">
                  Đăng nhập vào BadmintonHub với quyền quản trị viên
                </p>
              </div>

              {showOtpForm ? (
                <OtpForm
                  otpValue={otpValue}
                  setOtpValue={setOtpValue}
                  handleVerifyOtp={handleVerifyOtp}
                  isVerifyingOtp={isVerifyingOtp}
                  handleBackToLogin={handleBackToLogin}
                  employeeCode={formData.employeeCode}
                  variant="dark"
                />
              ) : (
                /* Form */
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {errors.general && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label
                      htmlFor="employeeCode-tablet"
                      className="text-sm text-neutral-400 normal-case"
                    >
                      Mã nhân viên
                    </Label>
                    <div className="relative">
                      <Icon
                        path={mdiAccount}
                        size={0.8}
                        color="#a3a3a3"
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                      />
                      <Input
                        id="employeeCode-tablet"
                        name="employeeCode"
                        type="text"
                        value={formData.employeeCode}
                        onChange={handleInputChange}
                        disabled={isPending}
                        placeholder="Nhập mã nhân viên hoặc SĐT"
                        className="border-0 border-b border-darkBorderV1 !bg-transparent rounded-none pl-9 focus-visible:ring-0 focus-visible:border-primary !text-neutral-400 placeholder:text-neutral-400 w-full"
                      />
                    </div>
                    {errors.employeeCode && (
                      <p className="text-red-400 text-sm mt-1">{errors.employeeCode}</p>
                    )}
                  </div>


                  <div className="space-y-1">
                    <Label
                      htmlFor="password-tablet"
                      className="text-sm text-neutral-400 normal-case"
                    >
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <Icon
                        path={mdiLock}
                        size={0.8}
                        color="#a3a3a3"
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                      />
                      <Input
                        id="password-tablet"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isPending}
                        className="border-0 border-b border-darkBorderV1 !bg-transparent rounded-none pl-9 pr-10 focus-visible:ring-0 focus-visible:border-primary !text-neutral-400 placeholder:text-neutral-400 w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isPending}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary"
                      >
                        {showPassword ? (
                          <EyeSlash size="20" color="#a3a3a3" />
                        ) : (
                          <Eye size="20" color="#a3a3a3" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={isPending} className="w-full h-12 bg-primary hover:bg-primary/90 text-darkBackgroundV1 font-semibold text-base">
                    {isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-darkBackgroundV1/30 border-t-darkBackgroundV1 rounded-full animate-spin"></div>
                        Đang đăng nhập...
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        Đăng nhập vào hệ thống
                        <Icon path={mdiLogin} size={0.8} className="flex-shrink-0" />
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopLoginPage({
  formData,
  errors,
  showPassword,
  setShowPassword,
  isPending,
  handleInputChange,
  handleSubmit,
  showOtpForm,
  otpValue,
  setOtpValue,
  handleVerifyOtp,
  isVerifyingOtp,
  handleBackToLogin,
}: LoginPageProps) {
  return (
    <div className="min-h-screen flex items-center overflow-y-hidden justify-center bg-[#001110] p-4 relative overflow-hidden w-full">
      {/* Background decorative shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl " />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600 rounded-full blur-3xl opacity-40" />

      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden relative z-10">
        <div className="grid lg:grid-cols-2">
          {/* Left Panel - Welcome Section */}
          <div
            style={{
              backgroundImage: "url('/images/login-bg.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="p-8 relative overflow-hidden"
          >
            <div className="absolute top-20 right-0 w-64 h-64 bg-teal-400 rounded-full opacity-40 blur-2xl" />
          </div>

          {/* Right Form */}
          <div className="p-8 flex flex-col justify-center bg-darkCardV1">
            <div className="max-w-md mx-auto w-full space-y-4 md:space-y-4">
              {/* Header */}
              <div className="text-center space-y-2 flex flex-col items-center">
                <img src="/images/logo.webp" alt="" className="h-28 w-28 rounded-full" draggable={false} />
                <h2 className="text-2xl font-semibold text-secondary uppercase">
                  Đăng nhập hệ thống
                </h2>
                <p className="text-neutral-400 text-base">
                  Đăng nhập vào BadmintonHub với quyền quản trị viên
                </p>
              </div>

              {showOtpForm ? (
                <OtpForm
                  otpValue={otpValue}
                  setOtpValue={setOtpValue}
                  handleVerifyOtp={handleVerifyOtp}
                  isVerifyingOtp={isVerifyingOtp}
                  handleBackToLogin={handleBackToLogin}
                  employeeCode={formData.employeeCode}
                  variant="light"
                />
              ) : (
                /* Form */
                <form className="space-y-4 md:space-y-4" onSubmit={handleSubmit}>
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  <div>
                    <Label
                      htmlFor="employeeCode"
                    >
                      Mã nhân viên
                    </Label>
                    <div className="relative">
                      <Icon
                        path={mdiAccount}
                        size={0.8}
                        color="#a3a3a3"
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                      />
                      <Input
                        id="employeeCode"
                        name="employeeCode"
                        type="text"
                        value={formData.employeeCode}
                        onChange={handleInputChange}
                        disabled={isPending}
                        placeholder="Nhập mã nhân viên hoặc SĐT"
                        className="border-0 border-b-2 border-gray-500 bg-darkBackgroundV1 rounded-none pl-9 pr-0 focus-visible:ring-0 focus-visible:border-[#41C651] text-neutral-400 placeholder:text-gray-500 w-full"
                      />
                    </div>
                    {errors.employeeCode && (
                      <p className="text-red-400 text-sm mt-1">{errors.employeeCode}</p>
                    )}
                  </div>


                  <div>
                    <Label
                      htmlFor="password"
                    >
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <Icon
                        path={mdiLock}
                        size={0.8}
                        color="#a3a3a3"
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                      />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isPending}
                        className="border-0 border-b-2 border-gray-500 bg-darkBackgroundV1 rounded-none pl-9 pr-10 focus-visible:ring-0 focus-visible:border-[#41C651] text-neutral-400 placeholder:text-gray-500 w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isPending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-500"
                      >
                        {showPassword ? (
                          <EyeSlash size="20" color="#a3a3a3" />
                        ) : (
                          <Eye size="20" color="#a3a3a3" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  {/* Login Button */}
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang đăng nhập...
                      </div>
                    ) : (
                      "Đăng nhập vào trang quản trị"
                    )}
                    <Icon path={mdiLogin} size={0.8} className="flex-shrink-0" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
