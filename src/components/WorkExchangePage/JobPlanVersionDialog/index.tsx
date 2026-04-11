"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateVersion } from "@/hooks/useJobPlans";
import { mdiClose, mdiCounter, mdiLoading, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { useForm } from "react-hook-form";

interface JobPlanVersionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    planId: string;
}

export const JobPlanVersionDialog = ({ isOpen, onClose, planId }: JobPlanVersionDialogProps) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            notes: "",
        }
    });

    const createVersionMutation = useCreateVersion();
    const isPending = createVersionMutation.isPending;

    const onSubmit = (data: any) => {
        createVersionMutation.mutate(
            { id: planId, data },
            {
                onSuccess: () => {
                    reset();
                    onClose();
                }
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="small">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiCounter} size={0.8} className="flex-shrink-0" />
                        <span>Tạo phiên bản mới</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 p-3 md:p-4">
                    <form id="version-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="v-name">Tên phiên bản (VD: v2) <span className="text-red-500">*</span></Label>
                            <Input
                                id="v-name"
                                {...register("name", { required: "Vui lòng nhập tên phiên bản" })}
                                placeholder="Nhập tên phiên bản (v2, v3...)"
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="v-notes">Ghi chú thay đổi</Label>
                            <Textarea
                                id="v-notes"
                                {...register("notes")}
                                placeholder="Nhập tóm tắt các thay đổi trong phiên bản này..."
                                rows={4}
                            />
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    <Button type="submit" form="version-form" disabled={isPending}>
                        {isPending ? (
                            <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                        ) : (
                            <Icon path={mdiPlus} size={0.8} />
                        )}
                        Thêm phiên bản mới
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
