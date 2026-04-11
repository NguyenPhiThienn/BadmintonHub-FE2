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
import { usePartners } from "@/hooks/usePartners";
import { useCreateVoltageLevel } from "@/hooks/useVoltageLevels";
import { IPartner } from "@/interface/partner";
import { mdiClose, mdiFlash, mdiLoading, mdiMagnify, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface CreateVoltageLevelDialogProps {
    isOpen: boolean;
    onClose: () => void;
    partnerId?: string;
}

export const CreateVoltageLevelDialog = ({
    isOpen,
    onClose,
    partnerId,
}: CreateVoltageLevelDialogProps) => {
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
            partnerId: partnerId || "",
        },
    });

    const selectedPartnerId = watch("partnerId");

    useEffect(() => {
        if (isOpen) {
            reset({
                name: "",
                partnerId: partnerId || "",
            });
        }
    }, [isOpen, reset, partnerId]);

    const createMutation = useCreateVoltageLevel();
    const isPending = createMutation.isPending;

    const onSubmit = (data: any) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="small">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiFlash} size={0.8} />
                        <span>Thêm mới cấp điện áp</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    <form id="create-voltage-level-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="partnerId">Công ty</Label>
                            <Select
                                value={selectedPartnerId}
                                onValueChange={(value) => setValue("partnerId", value, { shouldValidate: true })}
                                onOpenChange={(open) => !open && setPartnerSearch("")}
                                disabled={!!partnerId}
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
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    <Button type="submit" form="create-voltage-level-form" disabled={isPending}>
                        {isPending ? (
                            <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                        ) : (
                            <Icon path={mdiPlus} size={0.8} />
                        )}
                        Thêm mới
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
