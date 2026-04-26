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
import {
    useCreatePlan,
    usePartners,
    useUpdatePlan,
} from "@/hooks/usePartners";
import { useUploadPdf } from "@/hooks/useUpload";
import { IConstructionPlan, IPartner } from "@/interface/partner";
import {
    mdiArchiveEyeOutline,
    mdiCheckCircle,
    mdiClose,
    mdiCloudUploadOutline,
    mdiFileDocumentEditOutline,
    mdiFileDocumentOutline,
    mdiFileDocumentPlusOutline,
    mdiLinkVariant,
    mdiLoading,
    mdiMagnify,
    mdiOpenInNew,
    mdiSquareEditOutline,
    mdiTrashCanOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface ConstructionPlanDialogProps {
    isOpen: boolean;
    onClose: () => void;
    plan: IConstructionPlan | null;
}

export function ConstructionPlanDialog({
    isOpen,
    onClose,
    plan,
}: ConstructionPlanDialogProps) {
    const isEditing = !!plan;
    const { mutate: createPlan, isPending: isCreating } = useCreatePlan();
    const { mutate: updatePlan, isPending: isUpdating } = useUpdatePlan();
    const { mutate: uploadPdf, isPending: isUploading } = useUploadPdf();
    const { data: partnersResponse } = usePartners({ limit: 1000 });
    const partners = partnersResponse?.data?.partners || [];

    const [partnerSearch, setPartnerSearch] = useState("");
    const filteredPartners = partners.filter((p: any) =>
        p.partnerName?.toLowerCase().includes(partnerSearch.toLowerCase())
    );

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>("");

    const [formData, setFormData] = useState({
        partnerId: "",
        description: "",
        constructionPlansFileUrl: "",
    });

    useEffect(() => {
        if (isOpen) {
            if (plan) {
                setFormData({
                    partnerId: plan.partnerId,
                    description: plan.description,
                    constructionPlansFileUrl: plan.constructionPlansFileUrl,
                });
                // Nếu đang edit thì hiển thị tên file từ URL
                setFileName(plan.constructionPlansFileUrl?.split("/").pop() || "");
            } else {
                setFormData({
                    partnerId: "",
                    description: "",
                    constructionPlansFileUrl: "",
                });
                setFileName("");
            }
        }
    }, [isOpen, plan]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận file PDF, DOC hoặc DOCX");
            return;
        }

        setFileName(file.name);
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

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFormData((prev) => ({ ...prev, constructionPlansFileUrl: "" }));
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && plan) {
            updatePlan(
                {
                    id: plan._id,
                    data: {
                        description: formData.description,
                        constructionPlansFileUrl: formData.constructionPlansFileUrl,
                    },
                },
                {
                    onSuccess: onClose,
                }
            );
        } else {
            createPlan(
                {
                    partnerId: formData.partnerId,
                    description: formData.description,
                    constructionPlansFileUrl: formData.constructionPlansFileUrl,
                },
                {
                    onSuccess: onClose,
                }
            );
        }
    };

    const isPending = isCreating || isUpdating || isUploading;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon
                            path={isEditing ? mdiSquareEditOutline : mdiArchiveEyeOutline}
                            size={0.8}
                        />
                        <span>{isEditing ? "Cập nhật phương án" : "Thêm phương án mới"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="plan-form" onSubmit={handleSubmit} className="space-y-4 py-2">
                        {!isEditing && (
                            <div className="space-y-2">
                                <Label htmlFor="partnerId">Công ty <span className="text-destructive">*</span></Label>
                                <Select
                                    value={formData.partnerId}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, partnerId: value }))}
                                    disabled={isPending}
                                    onOpenChange={(open) => !open && setPartnerSearch("")}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn công ty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="sticky top-0 z-10 bg-darkCardV1 p-2 border-b border-darkBorderV1 mb-1">
                                            <div className="relative">
                                                <Icon path={mdiMagnify} size={0.8} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                <Input
                                                    placeholder="Nhập từ khóa Nhập từ khóa tìm kiếm công ty..."
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
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả phương án <span className="text-destructive">*</span></Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Nhập mô tả phương án thi công..."
                                disabled={isPending}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>File phương án thi công (PDF, DOC, DOCX)</Label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                            />
                            <motion.div
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    relative group cursor-pointer border-2 border-dashed rounded-xl p-8
                                    flex flex-col items-center justify-center gap-3 transition-all duration-300
                                    ${formData.constructionPlansFileUrl
                                        ? "border-accent/40 bg-accent/5"
                                        : "border-darkBorderV1 hover:border-accent/30 hover:bg-accent/5 bg-darkCardV1/30"}
                                `}
                            >
                                <div className={`
                                    w-14 h-14 rounded-full flex items-center justify-center transition-colors
                                    ${formData.constructionPlansFileUrl ? "bg-accent/20 text-accent" : "bg-darkBorderV1/50 text-neutral-300 group-hover:text-accent group-hover:bg-accent/10"}
                                `}>
                                    <Icon
                                        path={isUploading ? mdiLoading : (formData.constructionPlansFileUrl ? mdiFileDocumentOutline : mdiCloudUploadOutline)}
                                        size={1.5}
                                        className={isUploading ? "animate-spin" : ""}
                                    />
                                </div>

                                <div className="text-center">
                                    {isUploading ? (
                                        <p className="text-accent font-medium animate-pulse">Đang tải tệp lên...</p>
                                    ) : formData.constructionPlansFileUrl ? (
                                        <div className="space-y-1">
                                            <p className="text-accent font-semibold flex items-center justify-center gap-1">
                                                <Icon path={mdiCheckCircle} size={0.6} />
                                                Tải lên thành công
                                            </p>
                                            <p className="text-neutral-300 text-sm truncate italic">
                                                {fileName || "file_phuong_an"}
                                            </p>
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1 text-sm mt-2 bg-darkBackgroundV1/50 px-3 py-1.5 rounded-lg border border-darkBorderV1 max-w-[300px] hover:border-accent/30 text-neutral-300 transition-all cursor-default"
                                            >
                                                <Icon path={mdiLinkVariant} size={0.6} className="shrink-0" />
                                                <span className="truncate flex-1">{formData.constructionPlansFileUrl}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-neutral-300 font-semibold">Nhấn để chọn tệp (PDF, DOC, DOCX)</p>
                                            <p className="text-sm mt-1 text-neutral-300">Dung lượng tối đa 1GB</p>
                                        </>
                                    )}
                                </div>

                                {formData.constructionPlansFileUrl && !isUploading && (
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <Link
                                            href={formData.constructionPlansFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-8 h-8 rounded-full bg-accent/20 hover:bg-accent/30 flex items-center justify-center text-accent transition-colors border border-accent/30"
                                            title="Xem tệp"
                                        >
                                            <Icon path={mdiOpenInNew} size={0.6} />
                                        </Link>
                                        <div
                                            onClick={handleRemoveFile}
                                            className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors border border-red-500/30 cursor-pointer"
                                            title="Gỡ bỏ"
                                        >
                                            <Icon path={mdiTrashCanOutline} size={0.6} />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    <Button
                        form="plan-form"
                        type="submit"
                        disabled={isPending || !formData.constructionPlansFileUrl}
                    >
                        <Icon
                            path={isPending ? mdiLoading : (isEditing ? mdiFileDocumentEditOutline : mdiFileDocumentPlusOutline)}
                            size={0.8}
                            className={isPending ? "animate-spin" : ""}
                        />
                        {isEditing ? (isUpdating ? "Đang lưu..." : "Lưu thay đổi") : (isCreating ? "Đang lưu..." : "Lưu phương án")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
