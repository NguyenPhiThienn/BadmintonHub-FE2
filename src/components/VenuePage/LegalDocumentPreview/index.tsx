import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IVenue } from "@/interface/venue";
import { mdiClose, mdiFileDocumentOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { Button } from "@/components/ui/button";

interface LegalDocumentPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    venue: IVenue | null;
}

export const LegalDocumentPreview = ({
    isOpen,
    onClose,
    venue,
}: LegalDocumentPreviewProps) => {
    if (!venue) return null;

    const documents = venue.legalDocuments || [];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="large">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiFileDocumentOutline} size={0.8} />
                        <span>Hồ sơ pháp lý: {venue.name}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
                    {documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-4">
                            <Icon path={mdiFileDocumentOutline} size={2} className="opacity-20" />
                            <p className="italic">Chủ sở hữu chưa tải lên tài liệu pháp lý nào.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {documents.map((doc, index) => {
                                const isPdf = doc.toLowerCase().endsWith('.pdf');
                                return (
                                    <div key={index} className="space-y-2 group">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-neutral-300">Tài liệu #{index + 1}</span>
                                            <a 
                                                href={doc} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-accent hover:underline"
                                            >
                                                Xem bản gốc
                                            </a>
                                        </div>
                                        <div className="relative aspect-video bg-darkCardV1 border border-darkBorderV1 rounded-xl overflow-hidden shadow-inner group-hover:border-accent/50 transition-colors">
                                            {isPdf ? (
                                                <iframe src={doc} className="w-full h-full border-none" title={`Document ${index + 1}`} />
                                            ) : (
                                                <img 
                                                    src={doc} 
                                                    alt={`Legal Document ${index + 1}`} 
                                                    className="w-full h-full object-contain"
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl space-y-2">
                        <h4 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                            Lưu ý phê duyệt:
                        </h4>
                        <ul className="text-xs text-neutral-400 space-y-1 list-disc ml-4">
                            <li>Vui lòng kiểm tra kỹ Giấy phép kinh doanh và các chứng chỉ liên quan.</li>
                            <li>Thông tin trên hồ sơ phải khớp với tên cơ sở và chủ sở hữu đã đăng ký.</li>
                            <li>Nếu hồ sơ mờ hoặc không hợp lệ, hãy yêu cầu chủ sân tải lên bản quét rõ nét hơn.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-darkBorderV1">
                    <Button variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.7} />
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
