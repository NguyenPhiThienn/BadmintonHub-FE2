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
    mdiChevronRight
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";

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
    const [formData, setFormData] = useState({
        fullName: "",
        role: ""
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                fullName: userData.fullName || userData.full_name || "",
                role: userData.role?.toString() || ""
            });
        }
    }, [userData, isOpen]);

    const handleSave = () => {
        updateUser({
            id: userId,
            data: { fullName: formData.fullName, role: formData.role }
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
                                                                <Icon path={mdiBarcode} size={0.6} className="flex-shrink-0" />
                                                                <span className="text-nowrap">Mã định danh</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="green">
                                                                {userData?._id || userData?.id}
                                                            </Badge>
                                                        </TableCell>
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
                                                                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString("vi-VN") : "-"}
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
                                                                <span className="uppercase">{userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString("vi-VN") : "Chưa login"}</span>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-neutral-400 text-xs">Họ và tên</Label>
                                    <Input
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="h-9 border-darkBorderV1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-400 text-xs">Vai trò hệ thống</Label>
                                    <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                                        <SelectTrigger className="h-9 border-darkBorderV1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PLAYER">PLAYER</SelectItem>
                                            <SelectItem value="COURT_OWNER">COURT_OWNER</SelectItem>
                                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                                            <SelectItem value="PARTNER">PARTNER</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                            <Icon path={mdiContentSaveOutline} size={0.8} />
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
