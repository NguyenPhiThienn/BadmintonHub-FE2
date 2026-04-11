"use client";
import { Button } from "@/components/ui/button";
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
import { useMe } from "@/hooks/useAuth";
import { useBayDetails, useUpdateBay } from "@/hooks/useBays";
import { usePartners } from "@/hooks/usePartners";
import { useVoltageLevelsByPartner } from "@/hooks/useVoltageLevels";
import { IBay } from "@/interface/bay";
import { IPartner } from "@/interface/partner";
import { mdiClose, mdiContentSave, mdiLoading, mdiMagnify, mdiSquareEditOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface UpdateBayDialogProps {
    isOpen: boolean;
    onClose: () => void;
    bay: IBay | null;
}

export const UpdateBayDialog = ({
    isOpen,
    onClose,
    bay,
}: UpdateBayDialogProps) => {
    const { data: detailsResponse, isLoading } = useBayDetails(bay?._id || "");
    const bayData = detailsResponse?.data || bay;

    const { data: profileResponse } = useMe();
    const isPartner = profileResponse?.data?.role === "partner";

    const { data: partnersResponse } = usePartners({ limit: 1000 });
    const partners = partnersResponse?.data?.partners || [];

    const [partnerSearch, setPartnerSearch] = useState("");
    const filteredPartners = partners.filter((p: any) =>
        p.partnerName?.toLowerCase().includes(partnerSearch.toLowerCase())
    );

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            partnerId: "",
            voltageLevelId: "",
        },
    });

    const selectedPartnerId = watch("partnerId");
    const selectedVl = watch("voltageLevelId");

    const { data: vlByPartnerResponse, isLoading: isVlLoading } = useVoltageLevelsByPartner(selectedPartnerId);
    const voltageLevels = vlByPartnerResponse?.data || [];

    useEffect(() => {
        if (bayData && isOpen) {
            reset({
                name: bayData.name,
                partnerId: typeof bayData.partnerId === "object" ? (bayData.partnerId as any)._id : bayData.partnerId,
                voltageLevelId: typeof bayData.voltageLevelId === "object" ? (bayData.voltageLevelId as any)._id : bayData.voltageLevelId,
            });
        }
    }, [bayData, reset, isOpen]);

    const updateMutation = useUpdateBay();
    const isPending = updateMutation.isPending;

    const onSubmit = (data: any) => {
        if (!bay?._id) return;
        updateMutation.mutate(
            { id: bay._id, data },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="small">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                        <span>Cập nhật ngăn lộ</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <form id="update-bay-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="partnerId">Công ty</Label>
                                <Select
                                    value={selectedPartnerId}
                                    onValueChange={(value) => setValue("partnerId", value, { shouldValidate: true })}
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
                                            filteredPartners.map((partner: IPartner) => (
                                                <SelectItem key={partner._id} value={partner._id}>
                                                    {partner.partnerName}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="py-4 text-center text-sm text-neutral-400 italic">
                                                Không tìm thấy kết quả
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.partnerId && (
                                    <span className="text-red-500 text-xs text-nowrap">Vui lòng Chọn công ty</span>
                                )}
                                <input type="hidden" {...register("partnerId", { required: true })} />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="voltageLevelId">Cấp điện áp</Label>
                                <Select
                                    value={selectedVl}
                                    disabled={!selectedPartnerId || isVlLoading}
                                    onValueChange={(value) => setValue("voltageLevelId", value, { shouldValidate: true })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={isVlLoading ? "Đang tải..." : (selectedPartnerId ? "Chọn cấp điện áp" : "Vui lòng chọn công ty trước")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {voltageLevels.map((vl: any) => (
                                            <SelectItem key={vl._id} value={vl._id}>
                                                {vl.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.voltageLevelId && (
                                    <span className="text-red-500 text-xs text-nowrap">Vui lòng chọn cấp điện áp</span>
                                )}
                                <input type="hidden" {...register("voltageLevelId", { required: true })} />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="name">Tên ngăn lộ</Label>
                                <Input
                                    id="name"
                                    {...register("name", { required: "Vui lòng nhập tên ngăn lộ" })}
                                    placeholder="Ví dụ: Ngăn lộ 110kV T1"
                                />
                                {errors.name && (
                                    <span className="text-red-500 text-xs">{errors.name.message}</span>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    <Button type="submit" form="update-bay-form" disabled={isPending || isLoading}>
                        {isPending ? (
                            <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                        ) : (
                            <Icon path={mdiContentSave} size={0.8} />
                        )}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
