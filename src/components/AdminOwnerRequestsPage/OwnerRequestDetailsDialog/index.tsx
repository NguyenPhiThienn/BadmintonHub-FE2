import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    mdiAlertCircleOutline,
    mdiCheckBold,
    mdiCloseOctagonOutline,
    mdiFaceManProfile,
    mdiFileDocumentOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import Image from "next/image";

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
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium" className="bg-darkCardV1 border-darkBorderV1 text-white">
                <DialogHeader className="bg-darkBackgroundV1 border-b border-darkBorderV1">
                    <DialogTitle className="text-white text-lg flex items-center gap-2">
                        <Icon path={mdiFileDocumentOutline} size={0.9} className="text-accent" />
                        Chi tiết hồ sơ đăng ký chủ sân
                    </DialogTitle>
                </DialogHeader>

                {selectedRequest && (
                    <div className="p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* User Account info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-darkBackgroundV1/40 p-4 rounded-xl border border-darkBorderV1">
                            <div className="flex items-center gap-3 md:col-span-2">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-darkBorderV1 bg-darkCardV1 flex items-center justify-center">
                                    {selectedRequest.userId?.avatarUrl ? (
                                        <img src={selectedRequest.userId.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon path={mdiFaceManProfile} size={0.8} className="text-neutral-400" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base">{selectedRequest.userId?.fullName}</h4>
                                    <p className="text-xs text-neutral-400">{selectedRequest.userId?.email}</p>
                                </div>
                            </div>
                            <div className="flex md:flex-col justify-between md:justify-center md:items-end gap-1 border-t md:border-t-0 md:border-l border-darkBorderV1 pt-3 md:pt-0 md:pl-4">
                                <span className="text-xs text-neutral-400">Số điện thoại:</span>
                                <span className="text-sm font-semibold text-white">{selectedRequest.userId?.phone || "-"}</span>
                            </div>
                        </div>

                        {/* Submitted Documents Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-neutral-400 block font-bold">Số Căn cước công dân (CCCD)</span>
                                <p className="text-sm text-white bg-darkBackgroundV1/50 border border-darkBorderV1 p-3 rounded-lg">
                                    {selectedRequest.identityCard}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs text-neutral-400 block font-bold">Địa chỉ cơ sở đăng ký</span>
                                <p className="text-sm text-white bg-darkBackgroundV1/50 border border-darkBorderV1 p-3 rounded-lg">
                                    {selectedRequest.courtAddress}
                                </p>
                            </div>
                        </div>

                        {/* Real Court Images */}
                        <div className="space-y-2">
                            <span className="text-xs text-neutral-400 block font-bold">Hình ảnh sân cầu lông thực tế</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

                        {/* Business License */}
                        <div className="space-y-2">
                            <span className="text-xs text-neutral-400 block font-bold">Giấy phép hoạt động kinh doanh</span>
                            <div
                                className="relative aspect-video max-w-sm rounded-lg overflow-hidden border border-darkBorderV1 bg-darkBackgroundV1/50 cursor-zoom-in hover:opacity-80 transition-opacity"
                                onClick={() => onPreviewImage(selectedRequest.businessLicense)}
                            >
                                <Image src={selectedRequest.businessLicense} alt="Business License" fill className="object-cover" />
                            </div>
                        </div>

                        {/* Status and rejection reasons */}
                        {selectedRequest.status === "REJECTED" && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 flex gap-3">
                                <Icon path={mdiAlertCircleOutline} size={0.9} className="flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm">Lý do từ chối hồ sơ</p>
                                    <p className="text-xs text-neutral-300 italic mt-1">"{selectedRequest.rejectReason}"</p>
                                </div>
                            </div>
                        )}

                        {/* Rejection input form */}
                        {showRejectForm && (
                            <form onSubmit={handleRejectSubmit} className="space-y-3 bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                                <div className="space-y-1">
                                    <label htmlFor="rejectReason" className="text-xs text-red-400 font-bold block">
                                        Nhập lý do từ chối <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        id="rejectReason"
                                        placeholder="Ví dụ: Giấy phép kinh doanh mờ, không khớp thông tin cơ sở..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={3}
                                        className="bg-darkBackgroundV1 border-red-500/30 text-white focus:border-red-500"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowRejectForm(false)}
                                        className="text-neutral-400"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                        disabled={isReviewing}
                                    >
                                        Xác nhận từ chối
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                <DialogFooter className="bg-darkBackgroundV1 border-t border-darkBorderV1">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white"
                    >
                        Đóng
                    </Button>

                    {selectedRequest && selectedRequest.status === "PENDING" && !showRejectForm && (
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                onClick={() => setShowRejectForm(true)}
                                className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                                disabled={isReviewing}
                            >
                                <Icon path={mdiCloseOctagonOutline} size={0.7} className="mr-1.5" />
                                Từ chối
                            </Button>
                            <Button
                                onClick={handleApprove}
                                className="bg-green-600 text-white hover:bg-green-700 font-bold shadow-lg shadow-green-600/10"
                                disabled={isReviewing}
                            >
                                <Icon path={mdiCheckBold} size={0.7} className="mr-1.5" />
                                Duyệt hồ sơ
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
