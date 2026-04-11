"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDeviceType, useUpdateDeviceType } from "@/hooks/useTesting";
import { IDeviceType } from "@/interface/testing";
import { mdiClose, mdiContentSave, mdiFormatListBulletedType, mdiLoading, mdiPlus, mdiSquareEditOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface DeviceTypeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    deviceType?: IDeviceType | null;
}

export const DeviceTypeDialog = ({ isOpen, onClose, deviceType }: DeviceTypeDialogProps) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            description: "",
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                name: deviceType?.name || "",
                description: deviceType?.description || "",
            });
        }
    }, [isOpen, deviceType, reset]);

    const createMutation = useCreateDeviceType();
    const updateMutation = useUpdateDeviceType();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (data: any) => {
        if (deviceType) {
            updateMutation.mutate({ id: deviceType._id, data }, { onSuccess: onClose });
        } else {
            createMutation.mutate(data, { onSuccess: onClose });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="small">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={deviceType ? mdiSquareEditOutline : mdiFormatListBulletedType} size={0.8} className="flex-shrink-0" />
                        <span>{deviceType ? "Cập nhật" : "Thêm mới"} loại thiết bị</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    <form id="device-type-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="dt-name">Tên loại thiết bị <span className="text-red-500">*</span></Label>
                            <Input
                                id="dt-name"
                                {...register("name", { required: "Vui lòng nhập tên loại thiết bị" })}
                                placeholder="Ví dụ: Máy cắt, Biến áp..."
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="dt-desc">Mô tả</Label>
                            <Input
                                id="dt-desc"
                                {...register("description")}
                                placeholder="Mô tả ngắn gọn về loại thiết bị"
                            />
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    <Button type="submit" form="device-type-form" disabled={isPending}>
                        {isPending ? (
                            <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                        ) : (
                            <Icon path={deviceType ? mdiContentSave : mdiPlus} size={0.8} />
                        )}
                        {deviceType ? "Lưu thay đổi" : "Thêm mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
