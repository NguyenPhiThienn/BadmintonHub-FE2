"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/useUserContext";
import { useFirebaseLoginPartner, useLoginPartner } from "@/hooks/useAuth";
import { auth } from '@/lib/firebase';
import { cn } from "@/lib/utils";
import { mdiAccount, mdiKeyboardBackspace, mdiLock, mdiLogin } from "@mdi/js";
import Icon from "@mdi/react";
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Eye, EyeSlash } from "iconsax-reactjs";
import { OTPInput, SlotProps } from "input-otp";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
            <div className="w-px h-8 bg-black/20" />
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

function OtpForm({
    otpValue,
    setOtpValue,
    handleVerifyOtp,
    isVerifyingOtp,
    handleBackToLogin,
    phoneNumber,
    variant = "dark",
}: {
    otpValue: string;
    setOtpValue: (value: string) => void;
    handleVerifyOtp: () => void;
    isVerifyingOtp: boolean;
    handleBackToLogin: () => void;
    phoneNumber: string;
    variant?: "dark" | "light";
}) {
    const isDark = variant === "dark";

    return (
        <div className="space-y-4">
            <div className="text-center space-y-2">
                <p className="text-neutral-400 font-medium">
                    Vui lòng nhập OTP để xác thực quyền truy cập
                </p>
                <p
                    className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-primary" : "text-primary"
                    )}
                >
                    Mã OTP đã gửi đến: {phoneNumber}
                </p>
            </div>

            <div className="flex justify-center flex-col items-center gap-2">
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
                            Xác nhận OTP & Đăng nhập
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

export function LoginDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const router = useRouter();
    const { mutateAsync: login } = useLoginPartner();
    const { mutateAsync: firebaseLoginPartner } = useFirebaseLoginPartner();
    const { loginUser } = useUser();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
        general?: string;
    }>({});

    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1: Nhập User/Pass, 2: Nhập OTP
    const [otpValue, setOtpValue] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [isPending, setIsPending] = useState(false);

    const cleanupRecaptcha = () => {
        if ((window as any).recaptchaVerifier) {
            try {
                (window as any).recaptchaVerifier.clear();
            } catch (e) { }
            (window as any).recaptchaVerifier = null;
        }
    };

    useEffect(() => {
        if (!isOpen) {
            cleanupRecaptcha();
        }
    }, [isOpen]);

    useEffect(() => {
        return () => cleanupRecaptcha();
    }, []);

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
        if (!formData.username) {
            newErrors.username = "Username là bắt buộc";
        }
        if (!formData.password) {
            newErrors.password = "Mật khẩu là bắt buộc";
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- BƯỚC 1: ĐĂNG NHẬP TRỰC TIẾP ---
    const handleLoginCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsPending(true);
        try {
            // Gọi hook login trực tiếp
            const res = await login({
                username: formData.username,
                password: formData.password
            });

            if (res.statusCode === 200 || res.statusCode === 201) {
                localStorage.setItem("accessToken", res.data.accessToken);
                localStorage.setItem("token", res.data.accessToken);
                localStorage.setItem("userProfile", JSON.stringify(res));
                localStorage.setItem("user", JSON.stringify(res.data.user));

                // Lưu thông tin user và token vào context
                loginUser(res.data.user, res.data.accessToken);

                toast.success("Đăng nhập thành công!");
                onClose();
                // Chuyển hướng tới trang dashboard
                router.push('/partner/testing-devices');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Sai tài khoản hoặc mật khẩu";
            toast.error(errorMsg);
        } finally {
            setIsPending(false);
        }
    };

    // --- BƯỚC 2: GỬI OTP QUA FIREBASE ---
    const sendOTP = async (phone: string) => {
        try {
            if (!(window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible'
                });
            }
            const recaptchaVerifier = (window as any).recaptchaVerifier;
            const formattedPhone = phone.startsWith('0') ? `+84${phone.slice(1)}` : phone;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
            setConfirmationResult(confirmation);
            setStep(2); // Chuyển sang màn hình nhập OTP
            toast.success("Mã OTP đã được gửi đến số: " + phone);
        } catch (error: any) {
            const msg = error?.message || "Lỗi không xác định";
            toast.error("Không thể gửi OTP: " + msg);
            cleanupRecaptcha(); // Dọn dẹp reCAPTCHA nếu bị lỗi để lần sau tạo lại
        }
    };

    const handleVerifyOTP = async () => {
        if (otpValue.length !== 6) {
            toast.error("Vui lòng nhập đầy đủ 6 số OTP");
            return;
        }

        if (!confirmationResult) {
            toast.error("Không có phiên xác thực OTP");
            return;
        }

        setIsPending(true);
        try {
            const result = await confirmationResult.confirm(otpValue);
            const idToken = await result.user.getIdToken();
            const res = await firebaseLoginPartner({ idToken });

            if (res.status === 200 || res.status === 201) {
                localStorage.setItem("accessToken", res.data.accessToken);
                localStorage.setItem("token", res.data.accessToken);
                localStorage.setItem("userProfile", JSON.stringify(res));
                localStorage.setItem("user", JSON.stringify(res.data.user));

                loginUser(res.data.user, res.data.accessToken);

                toast.success("Đăng nhập hoàn tất!");
                onClose();
                router.push('/partner/testing-devices'); // Redirect
            }
        } catch (error: any) {
            toast.error("Mã OTP không đúng hoặc đã hết hạn.");
        } finally {
            setIsPending(false);
        }
    };

    const handleBackToLogin = () => {
        setStep(1);
        setOtpValue("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="!max-w-[450px] bg-white">
                {/* Ẩn reCAPTCHA Badge nhưng không dùng display: none để tránh lỗi */}
                <style>{`.grecaptcha-badge { visibility: hidden !important; opacity: 0 !important; }`}</style>
                <div id="recaptcha-container"></div>
                <div className="p-4 py-6 flex flex-col justify-center bg-white rounded-3xl overflow-hidden">
                    <div className="w-full space-y-4 md:space-y-4">
                        {/* Header */}
                        <div className="text-center space-y-2 flex flex-col items-center">
                            <img src="/images/logo.webp" alt="" className="h-28 w-28 rounded-full" draggable={false} />
                            <DialogTitle className="text-2xl font-semibold text-primary uppercase text-center justify-center">
                                Đăng nhập hệ thống
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 text-base text-center">
                                Đăng nhập vào BadmintonHub với quyền quản trị viên
                            </DialogDescription>
                        </div>

                        {step === 2 ? (
                            <OtpForm
                                otpValue={otpValue}
                                setOtpValue={setOtpValue}
                                handleVerifyOtp={handleVerifyOTP}
                                isVerifyingOtp={isPending}
                                handleBackToLogin={handleBackToLogin}
                                phoneNumber={phoneNumber}
                                variant="light"
                            />
                        ) : (
                            /* Form */
                            <form onSubmit={handleLoginCheck}>
                                {errors.general && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                        {errors.general}
                                    </div>
                                )}

                                <div className="space-y-1 mb-3 md:mb-4">
                                    <Label htmlFor="dialog-username" className="text-teal-950 font-semibold">
                                        Username
                                    </Label>
                                    <div className="relative">
                                        <Icon
                                            path={mdiAccount}
                                            size={0.8}
                                            color="#a3a3a3"
                                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                                        />
                                        <Input
                                            id="dialog-username"
                                            name="username"
                                            type="text"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            disabled={isPending}
                                            placeholder="Username"
                                            className="border-0 border-b-2 border-gray-500 bg-gray-100 rounded-none pl-9 pr-0 focus-visible:ring-0 focus-visible:border-[#41C651] text-neutral-600 placeholder:text-gray-500 w-full"
                                        />
                                    </div>
                                    {errors.username && (
                                        <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                                    )}
                                </div>

                                <div className="space-y-1 mb-6">
                                    <Label htmlFor="dialog-password" className="text-teal-950 font-semibold">
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
                                            id="dialog-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            disabled={isPending}
                                            placeholder="Password"
                                            className="border-0 border-b-2 border-gray-500 bg-gray-100 rounded-none pl-9 pr-10 focus-visible:ring-0 focus-visible:border-[#41C651] text-neutral-600 placeholder:text-gray-500 w-full"
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
                                <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/80">
                                    {isPending ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Đang xử lý...
                                        </div>
                                    ) : (
                                        "Đăng nhập"
                                    )}
                                    {!isPending && <Icon path={mdiLogin} size={0.8} className="flex-shrink-0" />}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
