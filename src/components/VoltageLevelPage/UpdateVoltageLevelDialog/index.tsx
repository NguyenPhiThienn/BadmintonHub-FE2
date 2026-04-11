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
import { usePartners } from "@/hooks/usePartners";
import { useUpdateVoltageLevel, useVoltageLevelDetails } from "@/hooks/useVoltageLevels";
import { IPartner } from "@/interface/partner";
import { IVoltageLevel } from "@/interface/voltageLevel";
import { mdiClose, mdiContentSave, mdiLoading, mdiMagnify, mdiSquareEditOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface UpdateVoltageLevelDialogProps {
    isOpen: boolean;
    onClose: () => void;
    voltageLevel: IVoltageLevel | null;
}

export const UpdateVoltageLevelDialog = ({
    isOpen,
    onClose,
    voltageLevel,
}: UpdateVoltageLevelDialogProps) => {
    const { data: detailsResponse, isLoading } = useVoltageLevelDetails(voltageLevel?._id || "");
    const vlData = detailsResponse?.data || voltageLevel;

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
        },
    });

    const selectedPartnerId = watch("partnerId");

    useEffect(() => {
        if (vlData && isOpen) {
            reset({
                name: vlData.name,
                partnerId: typeof vlData.partnerId === "object" ? (vlData.partnerId as any)._id : vlData.partnerId,
            });
        }
    }, [vlData, reset, isOpen]);

    const updateMutation = useUpdateVoltageLevel();
    const isPending = updateMutation.isPending;

    const onSubmit = (data: any) => {
        if (!voltageLevel?._id) return;
        updateMutation.mutate(
            { id: voltageLevel._id, data },
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
                        <span>Cập nhật cấp điện áp</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <form id="update-voltage-level-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                    <span className="text-red-500 text-xs">Vui lòng Chọn công ty</span>
                                )}
                                <input type="hidden" {...register("partnerId", { required: true })} />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="name">Tên cấp điện áp</Label>
                                <Input
                                    id="name"
                                    {...register("name", { required: "Vui lòng nhập tên cấp điện áp" })}
                                    placeholder="Ví dụ: 220kV"
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
                    <Button type="submit" form="update-voltage-level-form" disabled={isPending || isLoading}>
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
