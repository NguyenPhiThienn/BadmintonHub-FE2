"use client";


import { Footer } from "@/components/Landing/Footer";
import { Header } from "@/components/Landing/Header";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/mdi-icon";
import { useUser } from "@/context/useUserContext";
import { useChangePassword, useUpdateMe, useUpdateProfile } from "@/hooks/useAuth";
import { useMyStatistics } from "@/hooks/useBooking";
import { useUploadImage } from "@/hooks/useUpload";
import {
    mdiAccountOutline,
    mdiCalendarCheckOutline,
    mdiCameraPlusOutline,
    mdiCash,
    mdiCheck,
    mdiClockOutline,
    mdiClose,
    mdiContentSave,
    mdiEmailOutline,
    mdiEye,
    mdiEyeOff,
    mdiHome,
    mdiLoading,
    mdiLockOutline,
    mdiPhoneOutline
} from "@mdi/js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Badge } from "../ui/badge";

interface UserStats {
    totalHours: number;
    totalBookings: number;
    totalSpent: number;
}

export default function ProfilePage() {
    const { user, profile, fetchUserProfile } = useUser();
    const [isPending, setIsPending] = useState(false);
    const { data: statsRes, isLoading: isStatsLoading } = useMyStatistics();
    const stats = statsRes?.data || null;

    // Form states
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    // Mutation hooks
    const uploadImageMutation = useUploadImage();
    const updateMeMutation = useUpdateMe();
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();

    // Change Password states
    const [isPassDialogOpen, setIsPassDialogOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isPassPending, setIsPassPending] = useState(false);

    useEffect(() => {
        if (profile?.data) {
            setFullName(profile.data.fullName || "");
            setPhone(profile.data.phone || "");
            setAvatarUrl(profile.data.avatarUrl || "");
        }
    }, [profile]);



    const handleSave = async () => {
        setIsPending(true);
        try {
            await updateProfileMutation.mutateAsync({ fullName, phone, avatarUrl });
            toast.success("Cập nhật thông tin thành công!");
            fetchUserProfile();
        } catch (error: any) {
            toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setIsPending(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsPending(true);
            const res = await uploadImageMutation.mutateAsync(file);
            if (res.data?.url) {
                const newAvatarUrl = res.data.url;
                setAvatarUrl(newAvatarUrl);

                await updateMeMutation.mutateAsync({
                    fullName,
                    phone,
                    avatarUrl: newAvatarUrl
                });

                fetchUserProfile();
            }
        } catch (error) {
            console.error("Error uploading/updating avatar:", error);
        } finally {
            setIsPending(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        setIsPassPending(true);
        try {
            await changePasswordMutation.mutateAsync({ oldPassword, newPassword });
            setIsPassDialogOpen(false);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            // Already handled by useChangePassword hook
        } finally {
            setIsPassPending(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col bg-darkBackgroundV1">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Icon path={mdiAccountOutline} size={1.5} className="text-neutral-400 opacity-20" />
                    <p className="text-neutral-400 italic">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
                    <Button asChild>
                        <Link href="/">
                            <Icon path={mdiHome} size={0.8} />
                            Quay lại trang chủ
                        </Link>
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-darkBackgroundV1">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-24 pb-8 space-y-4">
                {/* Breadcrumbs */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Trang cá nhân</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left Column: Avatar & Summary */}
                    <div className="lg:col-span-4 space-y-4">
                        <section className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 flex flex-col items-center text-center space-y-4 shadow-xl">
                            <div className="relative group">
                                <Avatar className="h-40 w-40 border-4 border-accent rounded-full shadow-2xl">
                                    <AvatarImage
                                        src={avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${user.fullName}`}
                                        alt={user.fullName}
                                    />
                                </Avatar>
                                <label className="absolute bottom-2 right-2 p-3 bg-accent text-white rounded-full shadow-lg hover:bg-green-600 cursor-pointer">
                                    <Icon path={mdiCameraPlusOutline} size={0.8} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isPending} />
                                </label>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-white">{fullName}</h2>
                                <p className="text-neutral-400 text-base">{user.email}</p>
                            </div>
                            <div className="w-full pt-4 border-t border-darkBorderV1 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <Label>Vai trò</Label>
                                    <Badge variant="green">Khách hàng, người chơi</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Trạng thái</Label>
                                    <Badge variant="green">Đang hoạt động</Badge>
                                </div>
                            </div>
                        </section>

                        {/* Statistics Section */}
                        <section className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4 shadow-lg">
                            <h3 className="text-accent font-semibold flex items-center gap-2">
                                <Icon path={mdiCalendarCheckOutline} size={0.8} />
                                Thống kê cá nhân
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-darkBackgroundV1/50 border border-darkBorderV1 p-4 rounded-xl flex items-center gap-4 transition-all hover:border-blue-500/30">
                                    <div className="p-3 bg-blue-500/10 rounded-lg">
                                        <Icon path={mdiClockOutline} size={0.8} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Tổng giờ chơi</p>
                                        <p className="text-xl font-bold text-white">
                                            {isStatsLoading ? (
                                                <span className="animate-pulse opacity-50">...</span>
                                            ) : (
                                                `${stats?.totalHours || 0}h`
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-darkBackgroundV1/50 border border-darkBorderV1 p-4 rounded-xl flex items-center gap-4 transition-all hover:border-purple-500/30">
                                    <div className="p-3 bg-purple-500/10 rounded-lg">
                                        <Icon path={mdiCalendarCheckOutline} size={0.8} className="text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Lượt đặt sân</p>
                                        <p className="text-xl font-bold text-white">
                                            {isStatsLoading ? (
                                                <span className="animate-pulse opacity-50">...</span>
                                            ) : (
                                                stats?.totalBookings || 0
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-darkBackgroundV1/50 border border-darkBorderV1 p-4 rounded-xl flex items-center gap-4 transition-all hover:border-green-500/30">
                                    <div className="p-3 bg-green-500/10 rounded-lg">
                                        <Icon path={mdiCash} size={0.8} className="text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Tổng chi tiêu</p>
                                        <p className="text-xl font-bold text-white">
                                            {isStatsLoading ? (
                                                <span className="animate-pulse opacity-50">...</span>
                                            ) : (
                                                `${(stats?.totalSpent || 0).toLocaleString("vi-VN")}đ`
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Edit Forms */}
                    <div className="lg:col-span-8 space-y-4">
                        <section className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4 shadow-lg">
                            <h3 className="text-accent font-semibold mb-2 flex items-center gap-2">
                                <Icon path={mdiAccountOutline} size={0.8} />
                                Thông tin tài khoản
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Họ và tên</Label>
                                    <div className="relative">
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Nhập họ và tên"
                                            className="pl-10"
                                        />
                                        <Icon path={mdiAccountOutline} size={0.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <div className="relative">
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Nhập số điện thoại"
                                            className="pl-10"
                                        />
                                        <Icon path={mdiPhoneOutline} size={0.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="email">Địa chỉ Email</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            value={user.email}
                                            disabled
                                            className="pl-10"
                                        />
                                        <Icon path={mdiEmailOutline} size={0.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                                    </div>
                                    <p className="text-sm text-neutral-400 italic">(Email đăng nhập là duy nhất và không thể thay đổi.)</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <Button variant="outline" onClick={() => setIsPassDialogOpen(true)}>
                                    <Icon path={mdiLockOutline} size={0.8} />
                                    Đổi mật khẩu
                                </Button>
                                <Button
                                    variant="accent"
                                    onClick={handleSave}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                                    ) : (
                                        <Icon path={mdiCheck} size={0.8} />
                                    )}
                                    {isPending ? "Đang xử lý..." : "Cập nhật hồ sơ"}
                                </Button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Change Password Dialog */}
            <Dialog open={isPassDialogOpen} onOpenChange={(open) => !open && setIsPassDialogOpen(false)}>
                <DialogContent size="medium">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-accent">
                            <Icon path={mdiLockOutline} size={0.8} />
                            <span>Thay đổi mật khẩu</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                        <div className="space-y-2">
                            <Label>Mật khẩu hiện tại</Label>
                            <div className="relative">
                                <Input
                                    type={showOldPass ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu hiện tại"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPass(!showOldPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-accent transition-colors"
                                >
                                    <Icon path={showOldPass ? mdiEyeOff : mdiEye} size={0.8} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Mật khẩu mới</Label>
                            <div className="relative">
                                <Input
                                    type={showNewPass ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-accent transition-colors"
                                >
                                    <Icon path={showNewPass ? mdiEyeOff : mdiEye} size={0.8} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Xác nhận mật khẩu mới</Label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPass ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Xác nhận lại mật khẩu mới"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-accent transition-colors"
                                >
                                    <Icon path={showConfirmPass ? mdiEyeOff : mdiEye} size={0.8} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPassDialogOpen(false)} disabled={isPassPending}>
                            <Icon path={mdiClose} size={0.8} />
                            Đóng
                        </Button>
                        <Button onClick={handleChangePassword} disabled={isPassPending}>
                            {isPassPending ? <Icon path={mdiLoading} size={0.8} className="animate-spin" /> : <Icon path={mdiContentSave} size={0.8} />}
                            Cập nhật mật khẩu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
