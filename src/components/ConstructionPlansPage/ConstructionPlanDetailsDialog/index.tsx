"use client";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { usePartners, usePlanDetails, useUpdatePlan } from "@/hooks/usePartners";
import { usePermissions } from "@/hooks/usePermissions";
import { useUploadPdf } from "@/hooks/useUpload";
import {
    mdiArchiveEyeOutline,
    mdiCalendar,
    mdiCheckCircleOutline,
    mdiClose,
    mdiContentSave,
    mdiFileUploadOutline,
    mdiHandshakeOutline,
    mdiInformationOutline,
    mdiLinkVariant,
    mdiLoading,
    mdiMagnify,
    mdiOpenInNew,
    mdiSquareEditOutline,
    mdiUpload
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ConstructionPlanDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    plan: any | null;
    defaultIsEditing?: boolean;
    isPartner?: boolean;
}

export function ConstructionPlanDetailsDialog({
    isOpen,
    onClose,
    plan,
    defaultIsEditing = false,
    isPartner = false,
}: ConstructionPlanDetailsDialogProps) {
    const { data: detailsResponse, isLoading } = usePlanDetails(
        isOpen && plan?._id ? plan._id : ""
    );
    const planData = detailsResponse?.data || plan;

    const { mutate: updatePlan, isPending } = useUpdatePlan();
    const { mutate: uploadPdf, isPending: isUploading } = useUploadPdf();
    const { data: partnersResponse } = usePartners({ limit: 100 });
    const partners = partnersResponse?.data?.partners || [];

    const [isEditing, setIsEditing] = useState(defaultIsEditing);
    const [partnerSearch, setPartnerSearch] = useState("");
    const { hasPermission } = usePermissions();
    const canUpdate = !isPartner && hasPermission("construction-plans:update");
    const [formData, setFormData] = useState({
        partnerId: "",
        description: "",
        constructionPlansFileUrl: "",
    });

    const filteredPartners = partners.filter((p: any) =>
        p.partnerName.toLowerCase().includes(partnerSearch.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setIsEditing(defaultIsEditing);
        }
    }, [isOpen, defaultIsEditing]);

    useEffect(() => {
        if (isOpen && planData) {
            setFormData({
                partnerId: (planData.partnerId?._id || planData.partnerId) || "",
                description: planData.description || "",
                constructionPlansFileUrl: planData.constructionPlansFileUrl || "",
            });
        }
    }, [isOpen, planData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận file PDF, DOC hoặc DOCX");
            return;
        }

        uploadPdf(file, {
            onSuccess: (response: any) => {
                if (response.data?.url) {
                    setFormData((prev) => ({
                        ...prev,
                        constructionPlansFileUrl: response.data.url,
                    }));
                    toast.success("Tải file lên thành công");
                }
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!planData?._id) return;
        updatePlan(
            { id: planData._id, data: formData },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    onClose();
                },
            }
        );
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi });
        } catch {
            return dateStr;
        }
    };

    if (!plan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={isEditing ? mdiSquareEditOutline : mdiArchiveEyeOutline} size={0.8} className="flex-shrink-0" />
                        <span>{isEditing ? "Cập nhật phương án" : "Chi tiết phương án thi công"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="space-y-3 md:space-y-4">
                            <Skeleton className="h-[100px] w-full" />
                            <Skeleton className="h-[200px] w-full" />
                        </div>
                    ) : isEditing ? (
                        <form id="edit-plan-form" onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="partnerId">Công ty <span className="text-destructive">*</span></Label>
                                <Select
                                    onValueChange={(v) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            partnerId: v,
                                        }));
                                    }}
                                    value={formData.partnerId}
                                    onOpenChange={(open) => !open && setPartnerSearch("")}
                                    disabled={isPartner}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn công ty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="sticky top-0 z-10 bg-darkCardV1 p-2 border-b border-darkBorderV1 mb-1">
                                            <div className="relative">
                                                <Icon path={mdiMagnify} size={0.8} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                <Input
                                                    placeholder="Nhập từ khóa tìm kiếm công ty..."
                                                    value={partnerSearch}
                                                    onChange={(e) => setPartnerSearch(e.target.value)}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    autoFocus
                                                    onBlur={(e) => e.target.focus()}
                                                    className="pl-8 py-2 w-full bg-transparent"
                                                />
                                            </div>
                                        </div>
                                        {filteredPartners.length > 0 ? (
                                            filteredPartners.map((p: any) => (
                                                <SelectItem key={p._id} value={p._id}>{p.partnerName}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="py-4 text-center text-sm text-neutral-400 italic">
                                                Không tìm thấy kết quả
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="description">Mô tả phương án <span className="text-destructive">*</span></Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                    placeholder="Nhập mô tả phương án thi công..."
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="planFile">File phương án (PDF, DOC, DOCX)</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            id="planFile"
                                            value={formData.constructionPlansFileUrl}
                                            onChange={(e) =>
                                                setFormData((p) => ({ ...p, constructionPlansFileUrl: e.target.value }))
                                            }
                                            placeholder="Tải lên hoặc dán link file..."
                                            className="pr-10"
                                        />
                                    </div>
                                    <input
                                        type="file"
                                        id="file-upload-edit"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => document.getElementById("file-upload-edit")?.click()}
                                        disabled={isUploading}
                                    >
                                        <Icon
                                            path={isUploading ? mdiLoading : mdiUpload}
                                            size={0.8}
                                            className={isUploading ? "animate-spin" : ""}
                                        />
                                    </Button>
                                    {formData.constructionPlansFileUrl && (
                                        <Link href={formData.constructionPlansFileUrl} target="_blank">
                                            <Button type="button" variant="outline" size="icon" className="shrink-0">
                                                <Icon path={mdiOpenInNew} size={0.8} className="flex-shrink-0" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3 md:space-y-4">
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
                                    <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiHandshakeOutline} size={0.6} className="flex-shrink-0" />
                                                        <span>Công ty</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-accent font-semibold">{planData?.partnerName || "-"}</TableCell>
                                            </TableRow>
                                            <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiInformationOutline} size={0.6} className="flex-shrink-0" />
                                                        <span>Mô tả</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300">{planData?.description || "-"}</TableCell>
                                            </TableRow>
                                            <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiCheckCircleOutline} size={0.6} className="flex-shrink-0" />
                                                        <span>Trạng thái</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={planData?.isActive ? "green" : "destructive"}>
                                                        {planData?.isActive ? "Hiệu lực" : "Không hiệu lực"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-accent font-semibold whitespace-nowrap">Thời gian & Tệp đính kèm</h3>
                                    <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiCalendar} size={0.6} className="flex-shrink-0" />
                                                        <span>Ngày tải lên</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral"> {formatDate(planData?.uploadedAt)}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow className="border-none hover:bg-transparent">
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiFileUploadOutline} size={0.6} className="flex-shrink-0" />
                                                        <span>Tệp phương án</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {planData?.constructionPlansFileUrl ? (
                                                        <Link
                                                            href={planData.constructionPlansFileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline underline-offset-4"
                                                        >
                                                            <Icon path={mdiLinkVariant} size={0.8} className="flex-shrink-0" />
                                                            Xem tệp đính kèm
                                                        </Link>
                                                    ) : (
                                                        <span className="text-neutral-300 italic text-sm">Không có tệp</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
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
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isPending}>
                                <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                Đóng
                            </Button>
                            <Button type="submit" form="edit-plan-form" disabled={isPending || isUploading}>
                                <Icon
                                    path={isPending ? mdiLoading : mdiContentSave}
                                    size={0.8}
                                    className={isPending ? "animate-spin" : ""}
                                />
                                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </>
                    ) : (
                        <div className="flex gap-2 w-full justify-end">
                            <Button variant="outline" onClick={onClose}>
                                <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                Đóng
                            </Button>
                            {canUpdate && (
                                <Button onClick={() => setIsEditing(true)}>
                                    <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                    Cập nhật phương án
                                </Button>
                            )}
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
