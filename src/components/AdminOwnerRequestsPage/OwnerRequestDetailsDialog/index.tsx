import { Button } from "@/components/ui/button";
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
    mdiAlertCircleOutline,
    mdiCheckBold,
    mdiClose,
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
                            <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin tài khoản</h3>
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
                                <div className="space-y-4">
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
                            <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin hồ sơ</h3>
                            <div className="flex-1 border-b border-dashed border-accent mr-4" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <span className="text-sm text-neutral-400 block font-bold">Số Căn cước công dân (CCCD)</span>
                                <p className="text-sm text-white bg-darkBackgroundV1/50 border border-darkBorderV1 p-4 rounded-lg">
                                    {selectedRequest.identityCard}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <span className="text-sm text-neutral-400 block font-bold">Địa chỉ cơ sở đăng ký</span>
                                <p className="text-sm text-white bg-darkBackgroundV1/50 border border-darkBorderV1 p-4 rounded-lg">
                                    {selectedRequest.courtAddress}
                                </p>
                            </div>
                        </div>

                        {/* Section 3: Documents and Images */}
                        <div className="flex items-center gap-4">
                            <h3 className="text-accent font-semibold whitespace-nowrap">Tài liệu đính kèm</h3>
                            <div className="flex-1 border-b border-dashed border-accent mr-4" />
                        </div>

                        <div className="space-y-4">
                            <span className="text-sm text-neutral-400 block font-bold">Hình ảnh sân cầu lông thực tế</span>
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

                        <div className="space-y-4">
                            <span className="text-sm text-neutral-400 block font-bold">Giấy phép hoạt động kinh doanh</span>
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
                                <div className="space-y-4">
                                    <p className="font-bold text-sm">Lý do từ chối hồ sơ</p>
                                    <p className="text-sm text-neutral-300 italic mt-4">"{selectedRequest.rejectReason}"</p>
                                </div>
                            </div>
                        )}

                        {/* Rejection input form */}
                        {showRejectForm && (
                            <form onSubmit={handleRejectSubmit} className="space-y-4 bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                                <div className="space-y-4">
                                    <Label htmlFor="rejectReason">
                                        Nhập lý do từ chối <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="rejectReason"
                                        placeholder="Ví dụ: Giấy phép kinh doanh mờ, không khớp thông tin cơ sở..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowRejectForm(false)}
                                    >
                                        <Icon path={mdiClose} size={0.8} />
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={isReviewing}
                                    >
                                        <Icon path={mdiCloseOctagonOutline} size={0.8} />
                                        Xác nhận từ chối
                                    </Button>
                                </div>
                            </form>
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

                    {selectedRequest && selectedRequest.status === "PENDING" && !showRejectForm && (
                        <div className="flex gap-4">
                            <Button
                                variant="destructive"
                                onClick={() => setShowRejectForm(true)}
                                disabled={isReviewing}
                            >
                                <Icon path={mdiCloseOctagonOutline} size={0.8} />
                                Từ chối
                            </Button>
                            <Button
                                variant="green"
                                onClick={handleApprove}
                                disabled={isReviewing}
                            >
                                <Icon path={mdiCheckBold} size={0.8} />
                                Duyệt hồ sơ
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
