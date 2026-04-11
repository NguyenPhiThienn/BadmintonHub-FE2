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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateJobPlan, useUpdateJobPlan } from "@/hooks/useJobPlans";
import { usePartners } from "@/hooks/usePartners";
import { IJobPlan } from "@/interface/jobPlan";
import {
    mdiClose,
    mdiLoading,
    mdiMagnify,
    mdiPlus,
    mdiSquareEditOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface JobPlanDialogProps {
    isOpen: boolean;
    onClose: () => void;
    plan?: IJobPlan | null;
}

export const JobPlanDialog = ({ isOpen, onClose, plan }: JobPlanDialogProps) => {
    const [formData, setFormData] = useState({
        planName: "",
        partnerId: "",
        summary: "",
        status: "Đang trao đổi"
    });

    const [partnerSearch, setPartnerSearch] = useState("");

    const { data: partnersResponse } = usePartners({ limit: 1000 });
    const partners = Array.isArray(partnersResponse?.data?.partners)
        ? partnersResponse.data.partners
        : (Array.isArray(partnersResponse?.data) ? partnersResponse.data : []);

    const filteredPartners = partners.filter((p: any) =>
        p.partnerName?.toLowerCase().includes(partnerSearch.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            if (plan) {
                setFormData({
                    planName: plan.planName,
                    partnerId: typeof plan.partnerId === "string" ? plan.partnerId : (plan.partnerId as any)?._id || "",
                    summary: plan.summary || "",
                    status: plan.status || "Đang trao đổi"
                });
            } else {
                setFormData({
                    planName: "",
                    partnerId: "",
                    summary: "",
                    status: "Đang trao đổi"
                });
            }
        }
    }, [isOpen, plan]);

    const createMutation = useCreateJobPlan();
    const updateMutation = useUpdateJobPlan();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.planName.trim()) {
            toast.warning("Vui lòng nhập tên phương án");
            return;
        }
        if (!formData.partnerId) {
            toast.warning("Vui lòng chọn Công ty");
            return;
        }

        if (plan) {
            updateMutation.mutate({ id: plan._id, data: formData }, {
                onSuccess: () => onClose()
            });
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => onClose()
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="small">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={plan ? mdiSquareEditOutline : mdiPlus} size={0.8} />
                        <span>{plan ? "Cập nhật phương án công việc" : "Thêm phương án công việc"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="job-plan-form" onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="planName">Tên phương án <span className="text-red-500">*</span></Label>
                            <Input
                                id="planName"
                                value={formData.planName}
                                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                                placeholder="Ví dụ: PATC TNĐK Trạm 110kV..."
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div className="space-y-1">
                                <Label>Công ty <span className="text-red-500">*</span></Label>
                                <Select
                                    onValueChange={(v) => setFormData({ ...formData, partnerId: v })}
                                    value={formData.partnerId}
                                    onOpenChange={(open) => !open && setPartnerSearch("")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn Công ty" />
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
                                        <SelectItem value="all">Tất cả công ty</SelectItem>
                                        {filteredPartners.length > 0 ? (
                                            filteredPartners.map((p: any) => (
                                                <SelectItem key={p._id} value={p._id}>{p.partnerName}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="py-2 text-center text-sm text-neutral-400 italic">
                                                Không tìm thấy kết quả
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Trạng thái</Label>
                                <Select
                                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                                    value={formData.status}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Đang trao đổi">Đang trao đổi</SelectItem>
                                        <SelectItem value="Đã duyệt">Đã duyệt</SelectItem>
                                        <SelectItem value="Từ chối">Từ chối</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="summary">Nội dung trao đổi / Ghi chú</Label>
                            <Textarea
                                id="summary"
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                placeholder="Nhập nội dung trao đổi sơ bộ hoặc ghi chú..."
                                className="min-h-[120px]"
                            />
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        <Icon path={mdiClose} size={0.8} />
                        Hủy
                    </Button>
                    <Button
                        form="job-plan-form"
                        type="submit"
                        disabled={isPending}
                    >
                        <Icon
                            path={isPending ? mdiLoading : (plan ? mdiSquareEditOutline : mdiPlus)}
                            size={0.8}
                            className={isPending ? "animate-spin" : ""}
                        />
                        {isPending ? "Đang lưu..." : (plan ? "Cập nhật" : "Lưu phương án")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
