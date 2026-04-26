import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { useUserById, useUpdateUser } from "@/hooks/useUsers";
import { IUser } from "@/interface/auth";
import {
    mdiAccount,
    mdiPhone,
    mdiEmail,
    mdiCheckCircleOutline,
    mdiClose,
    mdiFaceManProfile,
    mdiCalendarClock,
    mdiAccountEditOutline,
    mdiContentSaveOutline,
    mdiClipboardAccount,
    mdiBarcode,
    mdiCalendar,
    mdiChevronRight,
    mdiEye,
    mdiEyeOff,
    mdiLoading
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { formatDateWithTime, formatDateOnly } from "@/lib/format";

interface UserDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: IUser | null;
}

export const UserDetailsDialog = ({
    isOpen,
    onClose,
    user,
}: UserDetailsDialogProps) => {
    const userId = user?._id || user?.id || "";
    const { data: userDetailsResponse, isLoading: isDetailsLoading } = useUserById(userId);
    const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

    const userData = userDetailsResponse?.data || user;

    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: ""
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                fullName: userData.fullName || userData.full_name || "",
                email: userData.email || "",
                phone: userData.phone || "",
                password: "",
                role: userData.role?.toString() || ""
            });
        }
    }, [userData, isOpen]);

    const handleSave = () => {
        const payload: any = {
            fullName: formData.fullName,
            role: formData.role,
            email: formData.email,
            phone: formData.phone
        };

        if (formData.password.trim()) {
            payload.password = formData.password.trim();
        }

        updateUser({
            id: userId,
            data: payload
        }, {
            onSuccess: () => {
                setIsEditing(false);
            }
        });
    };

    const fullName = userData?.fullName || userData?.full_name || "Người dùng";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiClipboardAccount} size={0.8} className="flex-shrink-0" />
                        <span>
                            {isEditing
                                ? `Cập nhật thông tin: ${fullName}`
                                : `Chi tiết thông tin: ${fullName}`}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {!isEditing ? (
                        <div className="space-y-4 md:space-y-4">
                            {isDetailsLoading ? (
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-12 w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 md:gap-4 mb-2">
                                        <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
                                        <div className="flex-1 border-b border-dashed border-accent  mr-1" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-4 mb-2">
                                        <Card className="flex-1 p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                            <Table>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                            <div className="flex items-center gap-2">
                                                                <Icon path={mdiAccount} size={0.6} className="flex-shrink-0" />
                                                                <span className="text-nowrap">Họ và tên</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="neutral">
                                                                {fullName}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                            <div className="flex items-center gap-2">
                                                                <Icon path={mdiEmail} size={0.6} className="flex-shrink-0" />
                                                                <span className="text-nowrap">Email liên hệ</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="neutral">
                                                                {userData?.email}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                            <div className="flex items-center gap-2">
                                                                <Icon path={mdiPhone} size={0.6} className="flex-shrink-0" />
                                                                <span className="text-nowrap">Số điện thoại</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="neutral">
                                                                {userData?.phone || "Chưa thiết lập số điện thoại"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                            <div className="flex items-center gap-2">
                                                                <Icon path={mdiCalendar} size={0.6} className="flex-shrink-0" />
                                                                <span className="text-nowrap">Ngày tham gia</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="neutral">
                                                                {userData?.createdAt ? formatDateOnly(userData.createdAt) : "-"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                            <div className="flex items-center gap-2">
                                                                <Icon path={mdiCalendarClock} size={0.6} className="flex-shrink-0" />
                                                                <span className="text-nowrap">Login cuối</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="neutral">
                                                                <span className="uppercase">{userData?.lastLogin ? formatDateWithTime(userData.lastLogin) : "Chưa login"}</span>
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                            <div className="flex items-center gap-2">
                                                                <Icon path={mdiFaceManProfile} size={0.6} className="flex-shrink-0" />
                                                                <span className="text-nowrap">Vai trò</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="neutral">
                                                                <span className="uppercase">{userData?.role?.toString().toLowerCase()}</span>
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                            <div className="flex items-center gap-2">
                                                                <Icon path={mdiCheckCircleOutline} size={0.6} className="flex-shrink-0" />
                                                                <span className="text-nowrap">Trạng thái</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={(userData as any)?.status === 'BLOCKED' ? "red" : "green"}>
                                                                {(userData as any)?.status || "ACTIVE"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </Card>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 md:space-y-4">
                            <div className="flex items-center gap-3 md:gap-4 mb-2">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Cập nhật thông tin</h3>
                                <div className="flex-1 border-b border-dashed border-accent  mr-1" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Vai trò hệ thống</Label>
                                    <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn vai trò" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PLAYER">Người chơi</SelectItem>
                                            <SelectItem value="COURT_OWNER">Chủ sân</SelectItem>
                                            <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Họ và tên <span className="text-red-400 italic text-sm">(*)</span></Label>
                                    <Input
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Ví dụ: Nguyễn Văn A"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4 col-span-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email <span className="text-red-400 italic text-sm">(*)</span></Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Ví dụ: example@mail.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại <span className="text-red-400 italic text-sm">(*)</span></Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Ví dụ: 0901234567"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Mật khẩu mới (Bỏ trống nếu không đổi)</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="********"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-accent transition-colors"
                                            >
                                                <Icon path={showPassword ? mdiEyeOff : mdiEye} size={0.8} className="flex-shrink-0" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={isEditing ? () => setIsEditing(false) : onClose}
                    >
                        <Icon path={mdiClose} size={0.8} />
                        {isEditing ? "Hủy bỏ" : "Đóng"}
                    </Button>
                    {isEditing ? (
                        <Button
                            onClick={handleSave}
                            disabled={isUpdating}
                        >
                            <Icon
                                path={isUpdating ? mdiLoading : mdiContentSaveOutline}
                                size={0.8}
                                className={isUpdating ? "animate-spin" : ""}
                            />
                            {isUpdating ? "Đang xử lý..." : "Lưu thay đổi"}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                        >
                            <Icon path={mdiAccountEditOutline} size={0.8} />
                            Chỉnh sửa
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
