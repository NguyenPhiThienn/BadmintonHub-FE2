"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/useUserContext";
import { useCancelPartnerAccount, useCreatePartnerAccount, usePartnerDetails, useUpdatePartner } from "@/hooks/usePartners";
import { usePermissions } from "@/hooks/usePermissions";
import { IContact, IPartner } from "@/interface/partner";
import {
    mdiAlertCircleOutline,
    mdiArchiveEyeOutline,
    mdiCancel,
    mdiClose,
    mdiContentCopy,
    mdiDomain,
    mdiEye,
    mdiEyeOff,
    mdiLoading,
    mdiMapMarkerOutline,
    mdiMinus,
    mdiPlus,
    mdiSquareEditOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface PartnerDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    partner: IPartner | null;
    defaultIsEditing?: boolean;
}

export function PartnerDetailsDialog({
    isOpen,
    onClose,
    partner,
    defaultIsEditing = false
}: PartnerDetailsDialogProps) {
    const { data: detailsResponse, isLoading } = usePartnerDetails(partner?._id || "");
    const partnerData = detailsResponse?.data || partner;

    const { mutate: updatePartner, isPending: isUpdating } = useUpdatePartner();
    const [isEditing, setIsEditing] = useState(defaultIsEditing);
    const { hasPermission } = usePermissions();
    const { profile } = useUser();
    const role = profile?.data?.role;
    const isAdmin = role === "admin";
    const canUpdate = hasPermission("partner-management:update");

    const [formData, setFormData] = useState({
        partnerName: "",
        address: "",
        contacts: [{ _id: "", name: "", phoneNumber: "", username: "" }] as IContact[],
        isActive: true,
    });
    const [accountFormData, setAccountFormData] = useState({
        username: "",
        password: "",
        contactId: "",
    });
    const [selectedContactName, setSelectedContactName] = useState("");
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { mutate: createAccount, isPending: isCreatingAccount } = useCreatePartnerAccount();
    const { mutate: cancelAccount, isPending: isCancelingAccount } = useCancelPartnerAccount();
    const [cancelAccountInfo, setCancelAccountInfo] = useState<{ contactId: string, name: string } | null>(null);

    // Sync isEditing with defaultIsEditing when dialog opens
    useEffect(() => {
        if (isOpen) {
            setIsEditing(defaultIsEditing);
        }
    }, [isOpen, defaultIsEditing]);

    // Reset and sync data when dialog opens
    useEffect(() => {
        if (isOpen && partnerData && !isEditing) {
            setFormData({
                partnerName: partnerData.partnerName || "",
                address: partnerData.address || "",
                contacts: partnerData.contacts?.length
                    ? partnerData.contacts.map((c: any) => ({
                        _id: c._id || "",
                        name: c.name || "",
                        phoneNumber: c.phoneNumber || "",
                        username: c.username || ""
                    }))
                    : [{ _id: "", name: "", phoneNumber: "", username: "" }],
                isActive: partnerData.isActive ?? true,
            });
        }
    }, [isOpen, partnerData, isEditing]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addContact = () => {
        setFormData((prev) => ({
            ...prev,
            contacts: [...prev.contacts, { _id: "", name: "", phoneNumber: "", username: "" }],
        }));
    };

    const removeContact = (i: number) => {
        setFormData((prev) => ({
            ...prev,
            contacts: prev.contacts.length > 1 ? prev.contacts.filter((_, idx) => idx !== i) : prev.contacts,
        }));
    };

    const updateContact = (i: number, field: keyof IContact, value: string) => {
        setFormData((prev) => {
            const nextContacts = [...prev.contacts];
            nextContacts[i] = { ...nextContacts[i], [field]: value };
            return { ...prev, contacts: nextContacts };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!partner) return;

        const validContacts = formData.contacts.filter((c) => c.name.trim() || c.phoneNumber.trim());
        const { isActive, ...dataWithoutStatus } = formData;
        const data = { ...dataWithoutStatus, contacts: validContacts };

        updatePartner(
            { id: partnerData._id, data },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    onClose();
                },
            }
        );
    };

    const handleCreateAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!partnerData?._id || !accountFormData.contactId) return;
        const payload = {
            ...accountFormData,
            rawPassword: accountFormData.password
        };

        createAccount(
            { id: partnerData._id, data: payload },
            {
                onSuccess: () => {
                    setShowAccountForm(false);
                    setAccountFormData({ username: "", password: "", contactId: "" });
                    setSelectedContactName("");
                },
            }
        );
    };

    const handleCancelAccount = () => {
        if (!partnerData?._id || !cancelAccountInfo) return;
        cancelAccount(
            { partnerId: partnerData._id, contactId: cancelAccountInfo.contactId },
            {
                onSuccess: () => {
                    setCancelAccountInfo(null);
                }
            }
        );
    };

    const handleCopy = (username: string, password?: string) => {
        if (!username) return;
        const text = `Tên đăng nhập: ${username}\nMật khẩu: ${password || "********"}`;
        navigator.clipboard.writeText(text);
        toast.info("Đã sao chép thông tin tài khoản");
    };

    if (!partner) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={isEditing ? mdiSquareEditOutline : mdiArchiveEyeOutline} size={0.8} />
                        <span>{isEditing ? "Cập nhật công ty" : "Chi tiết công ty"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="space-y-3 md:space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ) : isEditing ? (
                        <form id="edit-partner-form" onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                            <div className="space-y-3 md:space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="partnerName">Tên công ty</Label>
                                    <Input
                                        id="partnerName"
                                        value={formData.partnerName}
                                        onChange={(e) => handleChange("partnerName", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="address">Địa chỉ</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Thông tin liên hệ</Label>
                                    <div className="space-y-2 mb-4">
                                        {formData.contacts.map((c, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    value={c.name}
                                                    onChange={(e) => updateContact(i, "name", e.target.value)}
                                                    placeholder="Họ tên liên hệ"
                                                />
                                                <Input
                                                    value={c.phoneNumber}
                                                    onChange={(e) => updateContact(i, "phoneNumber", e.target.value)}
                                                    placeholder="Số điện thoại"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeContact(i)}
                                                    disabled={formData.contacts.length <= 1}
                                                >
                                                    <Icon path={mdiMinus} size={0.8} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-full flex justify-end pt-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addContact}
                                        >
                                            <Icon path={mdiPlus} size={0.8} />
                                            Thêm liên hệ
                                        </Button>
                                    </div>

                                </div>

                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3 md:space-y-4">
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiDomain} size={0.6} />
                                                    <span>Tên công ty</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-medium whitespace-normal">
                                                {partnerData.partnerName}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiMapMarkerOutline} size={0.6} />
                                                    <span>Địa chỉ</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 whitespace-normal">
                                                {partnerData.address || "-"}
                                            </TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </Card>

                            <div className="space-y-2">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-accent font-semibold whitespace-nowrap">Danh sách liên hệ</h3>
                                    <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            {partnerData.contacts?.length ? (
                                                partnerData.contacts.map((contact: any, idx: number) => (
                                                    <Fragment key={contact._id || idx}>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 w-[160px] font-semibold text-nowrap">
                                                                {contact.name || "Không có tên"}
                                                            </TableCell>
                                                            <TableCell className="text-nowrap">
                                                                <Badge variant="neutral">{contact.phoneNumber || "Không có số điện thoại"}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {contact.username ? (
                                                                    <div className="flex flex-row items-center justify-between gap-3 w-full">
                                                                        <div className="flex flex-col items-start justify-start gap-1 text-neutral-300">
                                                                            <div className="flex items-center gap-1">
                                                                                <Badge variant="green">Tên đăng nhập:</Badge> <Badge variant="neutral">{contact.username}</Badge>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Badge variant="green">Mật khẩu:</Badge> <Badge variant="neutral">{contact.rawPassword}</Badge>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-3">
                                                                            <Button variant="outline" onClick={() => handleCopy(contact.username || "", contact.rawPassword)}>
                                                                                <Icon path={mdiContentCopy} size={0.8} />
                                                                                Sao chép
                                                                            </Button>
                                                                            <Button
                                                                                variant="red"
                                                                                onClick={() => {
                                                                                    setCancelAccountInfo({ contactId: contact._id || "", name: contact.name });
                                                                                }}
                                                                                disabled={isCancelingAccount}
                                                                            >
                                                                                {isCancelingAccount && cancelAccountInfo?.contactId === contact._id ? (
                                                                                    <Icon path={mdiLoading} size={0.8} />
                                                                                ) : (
                                                                                    <Icon path={mdiCancel} size={0.8} />
                                                                                )}
                                                                                Hủy tài khoản
                                                                            </Button>

                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    isAdmin && (
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                setAccountFormData(p => ({ ...p, contactId: contact._id || "" }));
                                                                                setSelectedContactName(contact.name);
                                                                                setShowAccountForm(true);
                                                                            }}
                                                                        >
                                                                            <Icon path={mdiPlus} size={0.8} />
                                                                            Cấp tài khoản
                                                                        </Button>
                                                                    )
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                        {showAccountForm && accountFormData.contactId === contact._id && (
                                                            <TableRow className="bg-darkCardV1">
                                                                <TableCell colSpan={3} className="p-4 border-t-0 bg-darkBackgroundV1">
                                                                    <div className="space-y-4">
                                                                        <h3 className="text-accent font-semibold whitespace-nowrap text-base">Cấp tài khoản cho: {selectedContactName}</h3>
                                                                        <form onSubmit={handleCreateAccount} className="space-y-4">
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                <div className="space-y-1">
                                                                                    <Label>Tên đăng nhập</Label>
                                                                                    <Input
                                                                                        value={accountFormData.username}
                                                                                        onChange={(e) => setAccountFormData(p => ({ ...p, username: e.target.value }))}
                                                                                        placeholder="Ví dụ: lam_khesanh"
                                                                                        required
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <Label>Mật khẩu</Label>
                                                                                    <div className="relative">
                                                                                        <Input
                                                                                            type={showPassword ? "text" : "password"}
                                                                                            value={accountFormData.password}
                                                                                            onChange={(e) => setAccountFormData(p => ({ ...p, password: e.target.value }))}
                                                                                            placeholder="••••••••"
                                                                                            required
                                                                                            className="pr-10"
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setShowPassword(!showPassword)}
                                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-accent transition-colors"
                                                                                        >
                                                                                            <Icon path={showPassword ? mdiEyeOff : mdiEye} size={0.8} />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex justify-end gap-2">
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    onClick={() => {
                                                                                        setShowAccountForm(false);
                                                                                        setAccountFormData({ username: "", password: "", contactId: "" });
                                                                                        setSelectedContactName("");
                                                                                    }}
                                                                                >
                                                                                    <Icon path={mdiClose} size={0.8} />
                                                                                    Hủy
                                                                                </Button>
                                                                                <Button
                                                                                    type="submit"
                                                                                    disabled={isCreatingAccount}
                                                                                >
                                                                                    {isCreatingAccount ? (
                                                                                        <Icon path={mdiLoading} size={0.8} />
                                                                                    ) : (
                                                                                        <Icon path={mdiPlus} size={0.8} />
                                                                                    )}
                                                                                    Tạo tài khoản
                                                                                </Button>
                                                                            </div>
                                                                        </form>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </Fragment>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3}>
                                                        <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                                            <Icon path={mdiAlertCircleOutline} size={0.8} className="flex-shrink-0" />
                                                            Chưa có thông tin liên hệ. Chưa thể cấp tài khoản đăng nhập.
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>


                        </div>
                    )}
                </div>

                <DialogFooter>
                    {isEditing ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={isUpdating}
                            >
                                <Icon path={mdiClose} size={0.8} />
                                Hủy
                            </Button>
                            <Button
                                form="edit-partner-form"
                                type="submit"
                                disabled={isUpdating}
                            >
                                <Icon
                                    path={isUpdating ? mdiLoading : mdiSquareEditOutline}
                                    size={0.8}
                                />
                                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                                <Icon path={mdiClose} size={0.8} />
                                Đóng
                            </Button>
                            {canUpdate && (
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsEditing(true);
                                    }}
                                    disabled={isLoading || !partnerData}
                                >
                                    <Icon path={mdiSquareEditOutline} size={0.8} />
                                    Cập nhật
                                </Button>
                            )}
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
            {/* Confirmation dialog for canceling account */}
            <ConfirmDialog
                isOpen={!!cancelAccountInfo}
                onClose={() => setCancelAccountInfo(null)}
                onConfirm={handleCancelAccount}
                title="Hủy tài khoản"
                description={`Bạn có chắc chắn muốn hủy tài khoản của: ${cancelAccountInfo?.name || ""}?`}
                isPending={isCancelingAccount}
                variant="warning"
                confirmText="Xác nhận hủy"
            />
        </Dialog>
    );
}
