import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    mdiAccountBoxOutline,
    mdiAccountDetailsOutline,
    mdiAlertCircleOutline,
    mdiBankOutline,
    mdiCardAccountDetailsOutline,
    mdiCheckBold,
    mdiClose,
    mdiCloseOctagonOutline,
    mdiCreditCardOutline,
    mdiFaceManProfile,
    mdiFileCertificateOutline,
    mdiFileDocumentOutline,
    mdiImageArea,
    mdiMapMarkerOutline,
    mdiPaperclip,
    mdiReceiptTextOutline,
    mdiStorefrontOutline,
    mdiTextBoxEditOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import Image from "next/image";
import { useState } from "react";

interface OwnerRequestDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRequest: any;
    isReviewing: boolean;
    showRejectForm: boolean;
    setShowRejectForm: (show: boolean) => void;
    rejectReason: string;
    setRejectReason: (reason: string) => void;
    handleApprove: () => void;
    handleRejectSubmit: (e: React.FormEvent) => void;
    onPreviewImage: (url: string) => void;
}

const PREDEFINED_REASONS = [
    { text: "Số căn cước công dân không hợp lệ.", icon: mdiAccountBoxOutline },
    { text: "Giấy phép kinh doanh bị mờ hoặc không hợp lệ.", icon: mdiFileCertificateOutline },
    { text: "Thông tin địa chỉ cơ sở không trùng khớp với giấy tờ.", icon: mdiMapMarkerOutline },
    { text: "Thông tin tài khoản ngân hàng không hợp lệ.", icon: mdiBankOutline },
    { text: "Ảnh sân thực tế không hợp lệ.", icon: mdiImageArea },
    { text: "Lý do khác", icon: mdiTextBoxEditOutline }
];

export const OwnerRequestDetailsDialog = ({
    isOpen,
    onClose,
    selectedRequest,
    isReviewing,
    showRejectForm,
    setShowRejectForm,
    rejectReason,
    setRejectReason,
    handleApprove,
    handleRejectSubmit,
    onPreviewImage,
}: OwnerRequestDetailsDialogProps) => {
    const [isConfirmApproveOpen, setIsConfirmApproveOpen] = useState(false);
    const [isCustomReason, setIsCustomReason] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiFileDocumentOutline} size={0.8} />
                        <span>Chi tiết hồ sơ đăng ký chủ sân</span>
                    </DialogTitle>
                </DialogHeader>

                {selectedRequest && (
                    <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                        {/* Section 1: Account Info */}
                        <div className="flex items-center gap-4">
                            <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-2">
                                <Icon path={mdiCardAccountDetailsOutline} size={0.8} /> Thông tin tài khoản
                            </h3>
                            <div className="flex-1 border-b border-dashed border-accent mr-4" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-darkBackgroundV1/40 p-4 rounded-xl border border-darkBorderV1">
                            <div className="flex items-center gap-4 md:col-span-2">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-darkBorderV1 bg-darkCardV1 flex items-center justify-center">
                                    {selectedRequest.userId?.avatarUrl ? (
                                        <img src={selectedRequest.userId.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon path={mdiFaceManProfile} size={0.8} className="text-neutral-400" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-white text-base">{selectedRequest.userId?.fullName}</h4>
                                    <p className="text-sm text-neutral-400">{selectedRequest.userId?.email}</p>
                                </div>
                            </div>
                            <div className="flex md:flex-col justify-between md:justify-center md:items-end gap-4 border-t md:border-t-0 md:border-l border-darkBorderV1 pt-4 md:pt-0 md:pl-4">
                                <span className="text-sm text-neutral-400">Số điện thoại:</span>
                                <span className="text-sm font-semibold text-white">{selectedRequest.userId?.phone || "-"}</span>
                            </div>
                        </div>

                        {/* Section 2: Registration Info */}
                        <div className="flex items-center gap-4">
                            <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-2">
                                <Icon path={mdiStorefrontOutline} size={0.8} /> Thông tin hồ sơ
                            </h3>
                            <div className="flex-1 border-b border-dashed border-accent mr-4" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1 uppercase text-xs font-bold text-neutral-400">
                                    <Icon path={mdiAccountBoxOutline} size={0.6} /> SỐ CĂN CƯỚC CÔNG DÂN (CCCD)
                                </Label>
                                <p className="text-sm text-white bg-darkBackgroundV1/50 border border-darkBorderV1 p-4 rounded-lg font-medium">
                                    {selectedRequest.identityCard}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1 uppercase text-xs font-bold text-neutral-400">
                                    <Icon path={mdiReceiptTextOutline} size={0.6} /> MÃ SỐ THUẾ
                                </Label>
                                <p className="text-sm text-white bg-darkBackgroundV1/50 border border-darkBorderV1 p-4 rounded-lg font-medium">
                                    {selectedRequest.taxCode || "-"}
                                </p>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="flex items-center gap-1 uppercase text-xs font-bold text-neutral-400">
                                    <Icon path={mdiMapMarkerOutline} size={0.6} /> ĐỊA CHỈ CƠ SỞ ĐĂNG KÝ
                                </Label>
                                <p className="text-sm text-white bg-darkBackgroundV1/50 border border-darkBorderV1 p-4 rounded-lg font-medium">
                                    {selectedRequest.courtAddress}
                                </p>
                            </div>
                        </div>

                        {/* Section 2.5: Financial Info */}
                        <div className="flex items-center gap-4">
                            <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-2">
                                <Icon path={mdiBankOutline} size={0.8} /> Thông tin thanh toán
                            </h3>
                            <div className="flex-1 border-b border-dashed border-accent mr-4" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1 uppercase text-xs font-bold text-neutral-400">
                                    <Icon path={mdiBankOutline} size={0.6} /> NGÂN HÀNG
                                </Label>
                                <p className="text-sm text-white bg-darkBackgroundV1/50 border border-darkBorderV1 p-4 rounded-lg font-medium">
                                    {selectedRequest.bankName || "-"}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1 uppercase text-xs font-bold text-neutral-400">
                                    <Icon path={mdiCreditCardOutline} size={0.6} /> SỐ TÀI KHOẢN
                                </Label>
                                <p className="text-sm text-white bg-darkBackgroundV1/50 border border-darkBorderV1 p-4 rounded-lg font-medium">
                                    {selectedRequest.bankAccountNumber || "-"}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1 uppercase text-xs font-bold text-neutral-400">
                                    <Icon path={mdiAccountDetailsOutline} size={0.6} /> TÊN CHỦ THẺ
                                </Label>
                                <p className="text-sm text-white bg-darkBackgroundV1/50 border border-darkBorderV1 p-4 rounded-lg font-medium">
                                    {selectedRequest.bankAccountName || "-"}
                                </p>
                            </div>
                        </div>

                        {/* Section 3: Documents and Images */}
                        <div className="flex items-center gap-4">
                            <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-2">
                                <Icon path={mdiPaperclip} size={0.8} /> Tài liệu đính kèm
                            </h3>
                            <div className="flex-1 border-b border-dashed border-accent mr-4" />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-1 uppercase text-xs font-bold text-neutral-400">
                                <Icon path={mdiImageArea} size={0.6} /> HÌNH ẢNH SÂN CẦU LÔNG THỰC TẾ
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {selectedRequest.courtImages?.map((url: string, idx: number) => (
                                    <div
                                        key={idx}
                                        className="relative aspect-video rounded-lg overflow-hidden border border-darkBorderV1 bg-darkBackgroundV1/50 cursor-zoom-in hover:opacity-80 transition-opacity"
                                        onClick={() => onPreviewImage(url)}
                                    >
                                        <Image src={url} alt={`Court Image ${idx + 1}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-1 uppercase text-xs font-bold text-neutral-400">
                                <Icon path={mdiFileCertificateOutline} size={0.6} /> GIẤY PHÉP HOẠT ĐỘNG KINH DOANH
                            </Label>
                            <div
                                className="relative aspect-video max-w-sm rounded-lg overflow-hidden border border-darkBorderV1 bg-darkBackgroundV1/50 cursor-zoom-in hover:opacity-80 transition-opacity"
                                onClick={() => onPreviewImage(selectedRequest.businessLicense)}
                            >
                                <Image src={selectedRequest.businessLicense} alt="Business License" fill className="object-cover" />
                            </div>
                        </div>

                        {/* Section 4: Status feedback */}
                        {selectedRequest.status === "REJECTED" && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 flex gap-4">
                                <Icon path={mdiAlertCircleOutline} size={0.8} className="flex-shrink-0 mt-4" />
                                <div className="space-y-2">
                                    <p className="font-bold text-sm">Lý do từ chối hồ sơ</p>
                                    <p className="text-sm text-neutral-300 italic mt-4">"{selectedRequest.rejectReason}"</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isReviewing}
                    >
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>

                    {selectedRequest && selectedRequest.status === "PENDING" && (
                        <>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setRejectReason(PREDEFINED_REASONS[0].text);
                                    setIsCustomReason(false);
                                    setShowRejectForm(true);
                                }}
                                disabled={isReviewing}
                            >
                                <Icon path={mdiCloseOctagonOutline} size={0.8} />
                                Từ chối
                            </Button>
                            <Button
                                onClick={() => setIsConfirmApproveOpen(true)}
                                disabled={isReviewing}
                            >
                                <Icon path={mdiCheckBold} size={0.8} />
                                Duyệt hồ sơ
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>

            {selectedRequest && (
                <ConfirmDialog
                    isOpen={isConfirmApproveOpen}
                    onClose={() => setIsConfirmApproveOpen(false)}
                    onConfirm={() => {
                        setIsConfirmApproveOpen(false);
                        handleApprove();
                    }}
                    title="Duyệt hồ sơ đăng ký"
                    description={`Bạn có chắc chắn muốn duyệt đăng ký chủ sân cho người dùng: ${selectedRequest.userId?.fullName}?`}
                    confirmText="Duyệt"
                    cancelText="Hủy"
                    isPending={isReviewing}
                />
            )}

            <Dialog open={showRejectForm} onOpenChange={setShowRejectForm}>
                <DialogContent size="small" className="p-0 border-red-500/20 bg-darkCardV1 overflow-hidden !max-w-xl !w-[95vw]">
                    <DialogHeader className="p-6 pb-4 border-b border-darkBorderV1 bg-red-500/5">
                        <DialogTitle className="flex items-center gap-2 text-red-500 text-lg font-bold uppercase tracking-wider">
                            <Icon path={mdiAlertCircleOutline} size={1} />
                            <span>Từ chối hồ sơ đăng ký</span>
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (isCustomReason && !rejectReason.trim()) return;
                        handleRejectSubmit(e);
                    }} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <Label className="text-base font-semibold text-neutral-200">Vui lòng chọn lý do từ chối:</Label>
                            <div className="space-y-4 bg-darkBackgroundV1/50 p-5 rounded-xl border border-darkBorderV1 shadow-inner">
                                {PREDEFINED_REASONS.map((r, i) => (
                                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={r.text}
                                            checked={isCustomReason ? (r.text === "Lý do khác") : rejectReason === r.text}
                                            onChange={() => {
                                                if (r.text === "Lý do khác") {
                                                    setIsCustomReason(true);
                                                    setRejectReason("");
                                                } else {
                                                    setIsCustomReason(false);
                                                    setRejectReason(r.text);
                                                }
                                            }}
                                            className="mt-1 w-4 h-4 accent-red-500 group-hover:scale-110 transition-transform cursor-pointer"
                                        />
                                        <div className={`flex items-start gap-2 flex-1 transition-colors ${(isCustomReason ? (r.text === "Lý do khác") : rejectReason === r.text)
                                                ? "text-red-400 font-semibold"
                                                : "text-neutral-300 group-hover:text-white"
                                            }`}>
                                            <Icon path={r.icon} size={0.8} className="mt-0.5 flex-shrink-0" />
                                            <span className="text-[14px] leading-snug">{r.text}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {isCustomReason && (
                                <Textarea
                                    placeholder="Vui lòng nhập chi tiết lý do cụ thể để người dùng có thể khắc phục..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={4}
                                    required={isCustomReason}
                                    className="mt-4 bg-darkBackgroundV1/50 border-red-500/30 focus-visible:ring-red-500 text-[15px] p-4 text-white"
                                />
                            )}
                        </div>
                        <DialogFooter className="pt-4 border-t border-darkBorderV1">
                            <Button type="button" variant="ghost" onClick={() => setShowRejectForm(false)} className="hover:bg-neutral-800 text-neutral-300">
                                <Icon path={mdiClose} size={0.8} />
                                Hủy bỏ
                            </Button>
                            <Button type="submit" variant="destructive" disabled={isReviewing || (!isCustomReason && !rejectReason) || (isCustomReason && !rejectReason.trim())} className="font-semibold shadow-red-500/20 shadow-lg px-6">
                                <Icon path={mdiCloseOctagonOutline} size={0.8} />
                                Xác nhận từ chối
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};
