"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/mdi-icon";
import { useUser } from "@/context/useUserContext";
import { useLogin, useRegister } from "@/hooks/useAuth";
import {
  mdiAccountOutline,
  mdiAccountPlus,
  mdiEmailOutline,
  mdiEye,
  mdiEyeOff,
  mdiLoading,
  mdiLockOutline,
  mdiPhoneOutline
} from "@mdi/js";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface RegisterFormProps {
  onSwitchLogin?: () => void;
  isDialog?: boolean;
  onSuccess?: () => void;
}

export const RegisterForm = ({ onSwitchLogin, isDialog, onSuccess }: RegisterFormProps) => {
  const router = useRouter();
  const { loginUser: setUserContext, fetchUserProfile } = useUser();
  const { mutateAsync: registerUser, isPending: isRegistering } = useRegister();
  const { mutateAsync: loginUser, isPending: isLoggingIn } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

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
    setValue,
    watch,
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

  const selectedRole = watch("role");

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
    console.log(`%c[DEV] OTP Code: ${otp}`, 'color: #22c55e; font-size: 20px; font-weight: bold;');
    await sendOtpEmail(data.email, otp);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === generatedOtp) {
      try {
        const response = await registerUser(formData);
        if (response?.status === 201 || response?.statusCode === 201) {
          toast.success(response.message || "Đăng ký thành công");

          // Nếu đăng ký làm chủ sân, tự động đăng nhập rồi chuyển sang trang đăng ký chủ sân
          if (formData?.role === "OWNER") {
            try {
              const loginResponse = await loginUser({
                identifier: formData.email,
                password: formData.password,
              });

              if ((loginResponse?.status === 200 || loginResponse?.statusCode === 200) && loginResponse?.data?.accessToken) {
                const { accessToken, refreshToken, user } = loginResponse.data;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("token", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("user", JSON.stringify(user));

                setUserContext(user, accessToken);
                fetchUserProfile();
              }

              if (onSuccess) onSuccess();
              router.push("/register-owner");
            } catch (loginError) {
              // Nếu đăng nhập thất bại (do chưa có token chẳng hạn), vẫn chuyển hướng
              if (onSuccess) onSuccess();
              router.push("/register-owner");
            }
          } else if (onSwitchLogin) {
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
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-neutral-300">Xác thực Email</h3>
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
            disabled={isRegistering || isLoggingIn || otpInput.length < 4}
          >
            {isRegistering || isLoggingIn ? (
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

          <p className="text-center text-xs text-gray-500">
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
    <div className="space-y-6">
      {/* TABS FOR ROLE SELECTION - ANIMATED UI */}
      <div className="flex relative bg-neutral-900/80 border border-neutral-800 rounded-2xl p-1.5 mb-2 shadow-inner">
        <button
          type="button"
          onClick={() => setValue("role", "PLAYER")}
          className={`relative z-10 flex-1 py-3 text-[13px] uppercase tracking-wider font-bold rounded-xl transition-colors duration-300 ${selectedRole === "PLAYER" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
            }`}
        >
          Khách hàng
        </button>
        <button
          type="button"
          onClick={() => setValue("role", "OWNER")}
          className={`relative z-10 flex-1 py-3 text-[13px] uppercase tracking-wider font-bold rounded-xl transition-colors duration-300 ${selectedRole === "OWNER" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
            }`}
        >
          Chủ sân
        </button>

        {/* Animated Background Pill */}
        <motion.div
          className="absolute inset-y-1.5 w-[calc(50%-0.375rem)] bg-accent rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.25)]"
          initial={false}
          animate={{
            x: selectedRole === "PLAYER" ? 0 : "100%",
            marginLeft: selectedRole === "PLAYER" ? "0px" : "0.375rem"
          }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      </div>

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

        {/* REMOVED OLD RADIO GROUP FOR ROLE */}

        <div className="space-y-4 pt-2">
          <div className="flex items-start space-x-3 bg-darkCardV1/50 p-3.5 rounded-xl border border-darkBorderV1/80 transition-colors hover:border-accent/50">
            <Checkbox
              id="terms"
              checked={isTermsAccepted}
              onCheckedChange={(checked) => setIsTermsAccepted(checked as boolean)}
              className="mt-0.5 border-neutral-500 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-snug text-neutral-200 cursor-pointer"
              >
                Tôi đã đọc và đồng ý với{" "}
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="text-accent hover:underline font-bold"
                >
                  Điều khoản {selectedRole === "OWNER" ? "dành cho Chủ sân" : "sử dụng"}
                </button>{" "}
                của BadmintonHub.
              </label>
              {selectedRole === "PLAYER" && (
                <p className="text-[12px] text-neutral-400 leading-relaxed mt-1">
                  Tôi hiểu rằng đơn đặt sân chỉ được hủy trước ít nhất <strong className="text-white font-semibold">02 giờ</strong> so với giờ bắt đầu chơi. Nếu hủy quá <strong className="text-white font-semibold">02 đơn</strong> trong cùng một tuần, tài khoản của tôi sẽ bị <strong className="text-red-400 font-semibold">khóa quyền đặt sân trong 07 ngày</strong> kể từ lần hủy thứ 3.
                </p>
              )}
              {selectedRole === "OWNER" && (
                <p className="text-[12px] text-neutral-400 leading-relaxed mt-1">
                  Bằng việc chọn Chủ sân, tôi đồng ý để hệ thống thu <strong className="text-white font-semibold">phí dịch vụ 7%</strong> doanh thu thực tế của từng đơn thành công, và cam kết cung cấp thông tin cơ sở chính xác.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSendingOtp || !isTermsAccepted}
            className="w-full h-12 rounded-xl font-bold bg-accent hover:bg-accent/90 text-white disabled:opacity-50"
          >
            {isSendingOtp ? (
              <>
                <Icon path={mdiLoading} size={0.8} className="animate-spin mr-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Icon path={mdiAccountPlus} size={0.8} className="mr-2" />
                Đăng ký tài khoản
              </>
            )}
          </Button>
        </div>

        <TermsDialog isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} role={selectedRole} />

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
    </div>
  );
};

const TermsDialog = ({ isOpen, onClose, role }: { isOpen: boolean; onClose: () => void; role: string }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-[700px] flex flex-col p-0 overflow-hidden border-darkBorderV1 bg-darkBackgroundV1">
        <DialogHeader className="px-6 py-4 border-b border-darkBorderV1 bg-darkCardV1 shrink-0 z-10">
          <DialogTitle className="text-xl font-bold text-accent uppercase tracking-wide">
            Điều khoản {role === "OWNER" ? "dành cho Chủ sân" : "sử dụng"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-8 text-sm text-neutral-300 leading-relaxed custom-scrollbar">
          <p className="text-neutral-400 italic bg-white/5 p-4 rounded-lg border border-white/10">
            {role === "OWNER"
              ? "Khi đăng ký làm chủ sân trên hệ thống BadmintonHub, chủ sân xác nhận đã đọc, hiểu và đồng ý với các điều khoản dưới đây."
              : "Khi đăng ký tài khoản và sử dụng hệ thống BadmintonHub, khách hàng xác nhận đã đọc, hiểu và đồng ý với các điều khoản dưới đây."}
          </p>

          {role === "OWNER" ? (
            <>
              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">1</span>
                  Đăng ký chủ sân
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Chủ sân có thể đăng ký cơ sở để đăng thông tin sân, quản lý lịch sân và nhận đơn đặt sân từ khách hàng thông qua hệ thống.</li>
                  <li>Chủ sân cần cung cấp thông tin chính xác, bao gồm tên cơ sở, địa chỉ, số lượng sân, hình ảnh, khung giờ hoạt động, giá thuê sân, thông tin liên hệ, tài khoản nhận thanh toán và giấy tờ xác minh nếu hệ thống yêu cầu.</li>
                  <li>Hệ thống có quyền xét duyệt, yêu cầu bổ sung thông tin, từ chối hoặc tạm ngưng tài khoản chủ sân nếu thông tin không chính xác, không đầy đủ hoặc có dấu hiệu gian lận.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">2</span>
                  Trách nhiệm của chủ sân
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Chủ sân có trách nhiệm cập nhật đúng lịch trống, giá thuê, thông tin cơ sở và đảm bảo phục vụ khách hàng theo đơn đã xác nhận.</li>
                  <li>Chủ sân không được tự ý tăng giá, thay đổi lịch, hủy đơn không hợp lý, giao dịch ngoài hệ thống hoặc cung cấp thông tin sai lệch.</li>
                  <li>Nếu vi phạm, hệ thống có quyền cảnh báo, giảm hiển thị, tạm khóa cơ sở, tạm giữ đối soát hoặc chấm dứt tài khoản chủ sân.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">3</span>
                  Phí dịch vụ hệ thống
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Với mỗi đơn đặt sân thành công phát sinh qua hệ thống, chủ sân đồng ý trả cho hệ thống phí dịch vụ bằng <strong className="text-white">7% doanh thu thực tế</strong> của từng đơn.</li>
                  <li>Doanh thu thực tế là số tiền khách hàng thanh toán cho đơn đặt sân sau khi đã trừ giảm giá, hoàn tiền hoặc điều chỉnh hợp lệ nếu có.</li>
                  <li>Trường hợp khách thanh toán trực tuyến, hệ thống được quyền khấu trừ trực tiếp phí dịch vụ 7% trước khi chuyển phần còn lại cho chủ sân.</li>
                  <li>Trường hợp khách thanh toán tại sân, chủ sân có trách nhiệm thanh toán lại cho hệ thống khoản phí dịch vụ 7% đối với các đơn thành công phát sinh qua hệ thống.</li>
                  <li className="mt-2 text-white font-medium p-3 bg-darkBackgroundV1 rounded-lg border border-darkBorderV1">
                    Công thức đối soát: <br />
                    Tiền chủ sân nhận = Doanh thu thực tế của đơn - Phí dịch vụ 7% - Các khoản hoàn tiền/điều chỉnh/phí phát sinh nếu có.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">4</span>
                  Hủy đơn và hoàn tiền
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Nếu đơn bị hủy đúng quy định trước khi khách sử dụng sân, phí dịch vụ 7% không được tính cho đơn đó.</li>
                  <li>Nếu khách đã sử dụng sân hoặc đơn vẫn được tính phí theo chính sách của cơ sở, phí dịch vụ 7% được tính trên số tiền thực tế chủ sân được nhận.</li>
                  <li>Nếu phát sinh hoàn tiền một phần, phí dịch vụ 7% chỉ tính trên phần doanh thu còn lại sau hoàn tiền.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">5</span>
                  Đóng hoặc xóa cơ sở
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Chủ sân không thể tự ý xóa cơ sở ngay lập tức trên hệ thống. Khi muốn ngừng hoạt động hoặc xóa cơ sở, chủ sân phải gửi yêu cầu qua chức năng "Thông báo đóng cơ sở".</li>
                  <li>Sau khi gửi yêu cầu:
                    <ul className="list-circle pl-5 mt-1 space-y-1">
                      <li>Cơ sở sẽ bị khóa nhận đơn mới.</li>
                      <li>Cơ sở chuyển sang trạng thái đang chờ duyệt đóng cơ sở.</li>
                      <li>Hệ thống kiểm tra các đơn đặt sân, giao dịch thanh toán và nghĩa vụ hoàn tiền liên quan.</li>
                      <li>Hệ thống thông báo đến các khách hàng có đơn bị ảnh hưởng.</li>
                      <li>Chủ sân cần chờ hệ thống duyệt trong tối đa 03 ngày làm việc.</li>
                    </ul>
                  </li>
                  <li>Trong thời gian chờ duyệt, chủ sân không được tự ý thay đổi thông tin thanh toán, rút tiền đối soát, xóa dữ liệu hoặc thực hiện hành vi né tránh nghĩa vụ với khách hàng và hệ thống.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">6</span>
                  Xử lý đơn khi cơ sở đóng
                </h4>
                <p className="text-neutral-400 mb-2">Các đơn bị ảnh hưởng do cơ sở đóng sẽ được xử lý như sau:</p>
                <div className="rounded-lg overflow-hidden border border-darkBorderV1">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-darkBackgroundV1 text-neutral-300">
                      <tr>
                        <th className="p-3 border-b border-darkBorderV1 font-semibold">Trạng thái đơn</th>
                        <th className="p-3 border-b border-darkBorderV1 font-semibold">Chính sách xử lý</th>
                      </tr>
                    </thead>
                    <tbody className="bg-darkCardV1/50 text-neutral-400">
                      <tr>
                        <td className="p-3 border-b border-darkBorderV1">Đơn chưa thanh toán</td>
                        <td className="p-3 border-b border-darkBorderV1">Khách hàng được bồi hoàn 5% giá trị đơn</td>
                      </tr>
                      <tr>
                        <td className="p-3 border-b border-darkBorderV1">Đơn đã thanh toán</td>
                        <td className="p-3 border-b border-darkBorderV1">Khách hàng được hoàn 105% giá trị đơn</td>
                      </tr>
                      <tr>
                        <td className="p-3 border-b border-darkBorderV1">Đơn đã sử dụng xong</td>
                        <td className="p-3 border-b border-darkBorderV1">Không áp dụng hoàn tiền</td>
                      </tr>
                      <tr>
                        <td className="p-3">Đơn đang tranh chấp</td>
                        <td className="p-3">Tạm giữ xử lý đến khi có kết quả xác minh</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-neutral-400">
                  <li>Khoản hoàn tiền hoặc bồi hoàn được trích từ tài khoản VNPay, số dư đối soát hoặc khoản phải thanh toán cho cơ sở.</li>
                  <li>Nếu số dư không đủ, chủ sân có trách nhiệm nạp bổ sung hoặc thanh toán phần còn thiếu theo yêu cầu của hệ thống.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">7</span>
                  Điều kiện duyệt đóng cơ sở
                </h4>
                <p className="text-neutral-400">Hệ thống chỉ duyệt đóng cơ sở khi:</p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Các đơn bị ảnh hưởng đã được xử lý hoặc có phương án xử lý rõ ràng.</li>
                  <li>Khách hàng liên quan đã được thông báo.</li>
                  <li>Chủ sân đã hoàn tất nghĩa vụ thanh toán, phí dịch vụ, hoàn tiền và bồi hoàn.</li>
                  <li>Không còn tranh chấp nghiêm trọng hoặc dấu hiệu gian lận.</li>
                </ul>
                <p className="text-neutral-400 italic mt-2">Sau khi được duyệt, cơ sở chuyển sang trạng thái đã đóng và không còn hiển thị để khách hàng đặt sân mới.</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">8</span>
                  Cam kết của chủ sân
                </h4>
                <p className="text-neutral-400 bg-darkBackgroundV1 p-4 rounded-lg border border-darkBorderV1 leading-relaxed">
                  Bằng việc đăng ký làm chủ sân, chủ sân xác nhận có quyền quản lý hoặc đại diện hợp pháp cho cơ sở đã đăng ký, cam kết cung cấp thông tin chính xác, đồng ý để hệ thống thu <strong className="text-white">phí dịch vụ 7%</strong> doanh thu thực tế của từng đơn thành công, và chịu trách nhiệm đối với các đơn đặt sân, hoàn tiền, bồi hoàn và nghĩa vụ phát sinh từ cơ sở của mình.
                </p>
              </div>
            </>
          ) : (
            <>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">1</span>
                  Tài khoản khách hàng
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Khách hàng cần cung cấp thông tin chính xác khi đăng ký tài khoản, bao gồm họ tên, số điện thoại, email và các thông tin cần thiết khác.</li>
                  <li>Khách hàng chịu trách nhiệm bảo mật tài khoản của mình. Mọi hoạt động phát sinh từ tài khoản sẽ được xem là do chính khách hàng thực hiện, trừ khi có bằng chứng về lỗi hệ thống hoặc truy cập trái phép.</li>
                  <li>Hệ thống có quyền tạm khóa hoặc chấm dứt tài khoản nếu khách hàng cung cấp thông tin sai lệch, đặt sân ảo, lạm dụng khuyến mãi, gây rối hoặc vi phạm điều khoản sử dụng.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">2</span>
                  Đặt sân
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Khách hàng có thể tìm kiếm sân, chọn ngày, khung giờ, thời lượng chơi và xác nhận đặt sân trên hệ thống.</li>
                  <li>Đơn đặt sân chỉ được xem là hợp lệ khi hệ thống xác nhận đặt sân thành công.</li>
                  <li>Khách hàng cần kiểm tra kỹ thông tin sân, thời gian chơi, giá tiền, chính sách hủy và phương thức thanh toán trước khi xác nhận đặt sân.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">3</span>
                  Hủy đơn đặt sân
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Khách hàng được hủy đơn đặt sân nếu thực hiện hủy <strong className="text-white">trước ít nhất 02 giờ</strong> so với thời gian bắt đầu chơi.</li>
                  <li>Sau thời điểm còn dưới 02 giờ trước giờ bắt đầu chơi, khách hàng không thể hủy đơn trên hệ thống.</li>
                  <li className="italic text-neutral-500">Ví dụ: nếu đơn đặt sân bắt đầu lúc 19:00, khách hàng chỉ có thể hủy trước 17:00.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs">4</span>
                  Giới hạn số lần hủy đơn
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Khách hàng được hủy tối đa 02 đơn đặt sân trong cùng một tuần mà không bị khóa tài khoản, với điều kiện các đơn được hủy đúng thời hạn.</li>
                  <li><strong className="text-red-400">Khi khách hàng hủy thành công đơn thứ 3 trong cùng một tuần, tài khoản sẽ bị khóa quyền đặt sân trong 07 ngày.</strong></li>
                  <li>Tuần được tính từ 00:00 thứ Hai đến 23:59 Chủ Nhật theo giờ Việt Nam.</li>
                  <li>Trong thời gian bị khóa, khách hàng vẫn có thể đăng nhập để xem lịch sử đơn và liên hệ hỗ trợ, nhưng không thể tạo đơn đặt sân mới.</li>
                  <li>Các trường hợp chủ sân hủy đơn, sân gặp sự cố, lỗi hệ thống hoặc sự kiện bất khả kháng sẽ không tính là lỗi hủy của khách hàng nếu được hệ thống xác nhận.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">5</span>
                  Thanh toán
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Khách hàng có thể thanh toán bằng các phương thức được hệ thống hỗ trợ, bao gồm thanh toán trực tuyến, chuyển khoản, ví điện tử, tiền mặt tại sân hoặc phương thức khác tùy từng thời điểm.</li>
                  <li>Khách hàng có trách nhiệm thanh toán đầy đủ chi phí đặt sân và các khoản phí phát sinh, nếu có, trước hoặc sau khi sử dụng sân theo chính sách của từng sân.</li>
                  <li>Hệ thống không chịu trách nhiệm đối với các giao dịch thanh toán được thực hiện ngoài hệ thống nếu giao dịch đó không được xác nhận hợp lệ.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">6</span>
                  Hoàn tiền và hoàn đơn
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Việc hoàn tiền hoặc hoàn cọc được xử lý theo thời điểm hủy đơn và chính sách của từng sân.</li>
                  <li>Nếu khách hàng hủy đơn đúng hạn (trước ít nhất 02 giờ), khách hàng có thể được hoàn tiền, hoàn cọc hoặc hỗ trợ đổi lịch theo chính sách của sân.</li>
                  <li>Nếu khách hàng hủy đơn dưới 02 giờ, không đến sân hoặc tự ý bỏ lịch, khách hàng có thể không được hoàn tiền hoặc hoàn cọc.</li>
                  <li>Nếu chủ sân hủy đơn, sân không thể hoạt động hoặc hệ thống phát sinh lỗi, khách hàng sẽ được hỗ trợ hoàn tiền, hoàn cọc hoặc đổi sang khung giờ phù hợp khác.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">7</span>
                  Đăng ký làm chủ sân
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Khách hàng có thể đăng ký trở thành chủ sân trên hệ thống. Cần cung cấp thông tin sân, bao gồm tên sân, địa chỉ, số lượng sân, hình ảnh sân, khung giờ hoạt động, giá thuê sân, thông tin liên hệ và các giấy tờ xác minh nếu hệ thống yêu cầu.</li>
                  <li>Hệ thống có quyền xét duyệt, yêu cầu bổ sung thông tin, từ chối hoặc tạm dừng tài khoản chủ sân nếu thông tin không chính xác, không đầy đủ hoặc có dấu hiệu gian lận.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">8</span>
                  Trách nhiệm của khách hàng
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Sử dụng hệ thống đúng mục đích, không đặt sân ảo, không tạo nhiều tài khoản để né giới hạn hủy đơn, không lạm dụng khuyến mãi và không gây ảnh hưởng đến người dùng khác.</li>
                  <li>Khi sử dụng sân, tuân thủ nội quy của sân, giữ gìn tài sản, vệ sinh chung và tự bảo quản tài sản cá nhân. Khách hàng chịu trách nhiệm đối với thiệt hại phát sinh do hành vi vi phạm của mình.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">9</span>
                  Xử lý vi phạm
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                  <li>Hệ thống có quyền cảnh báo, giới hạn tính năng, tạm khóa hoặc chấm dứt tài khoản nếu khách hàng vi phạm điều khoản sử dụng.</li>
                  <li>Các hành vi có thể bị xử lý bao gồm: hủy đơn quá số lần cho phép, không đến sân nhiều lần, đặt sân ảo, gian lận thanh toán, lạm dụng khuyến mãi, cung cấp thông tin giả hoặc gây rối trong quá trình sử dụng dịch vụ.</li>
                </ul>
              </div>

            </>
          )}

          <div className="space-y-4 pt-4 border-t border-darkBorderV1">
            <p className="text-xs text-neutral-500">
              Hệ thống có quyền cập nhật Điều khoản sử dụng này khi cần thiết. Việc bạn tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật được hiểu là bạn đồng ý với nội dung thay đổi.
              <br /><br />
              <strong>Liên hệ hỗ trợ:</strong> Email: badmintonhub@gmail.com | Hotline/Zalo: 0969666999
              <br />
              <span className="italic">Điều khoản này có hiệu lực từ ngày 1/2/2026.</span>
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-darkBorderV1 bg-darkCardV1 flex justify-end shrink-0">
          <Button onClick={onClose} className="w-full sm:w-auto bg-accent hover:bg-accent/90 font-bold px-8">Đã hiểu và Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

