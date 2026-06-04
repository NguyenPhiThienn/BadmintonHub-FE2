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
import { IUser } from "@/interface/auth";
import { mdiAlertCircleOutline, mdiLockOutline, mdiLockOpenVariantOutline, mdiLoading } from "@mdi/js";
import Icon from "@mdi/react";
import { useState, useEffect } from "react";
import { useBlockUser } from "@/hooks/useUsers";

interface BlockUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: IUser | null;
}

const PREDEFINED_REASONS = [
    "Vi phạm chính sách đặt sân",
    "Spam hoặc quấy rối",
    "Thái độ không phù hợp",
    "Yêu cầu từ chủ tài khoản",
    "Khác"
];

export function BlockUserDialog({ isOpen, onClose, user }: BlockUserDialogProps) {
    const { mutateAsync: blockUserAsync, isPending } = useBlockUser();
    const [reason, setReason] = useState("");
    const [selectedReason, setSelectedReason] = useState(PREDEFINED_REASONS[0]);
    const isActive = user ? (user as any).status !== 'BLOCKED' : true;

    useEffect(() => {
        if (isOpen) {
            setReason(PREDEFINED_REASONS[0]);
            setSelectedReason(PREDEFINED_REASONS[0]);
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        if (!user) return;
        const id = user._id || user.id;
        
        try {
            await blockUserAsync({
                id,
                data: {
                    action: isActive ? 'block' : 'unblock',
                    reason: isActive ? reason : undefined,
                    blockType: 'TEMPORARY'
                }
            });
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="small" className="!max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${isActive ? 'text-amber-500' : 'text-green-500'}`}>
                        <Icon path={isActive ? mdiLockOutline : mdiLockOpenVariantOutline} size={1} />
                        <span className="text-xl">{isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="p-5 space-y-5">
                    <div className={`p-4 rounded-xl flex items-start gap-3 ${isActive ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                        <Icon path={mdiAlertCircleOutline} size={1} className={`flex-shrink-0 mt-0.5 ${isActive ? 'text-amber-500' : 'text-green-500'}`} />
                        <p className="text-sm text-neutral-300 leading-relaxed">
                            Bạn có chắc chắn muốn {isActive ? 'khóa' : 'mở khóa'} tài khoản của người dùng <span className="font-bold text-white block mt-1 text-base">{user?.fullName || user?.email}</span>
                        </p>
                    </div>
                    
                    {isActive && (
                        <div className="space-y-3">
                            <Label className="text-neutral-400 font-medium">Lý do khóa (bắt buộc)</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {PREDEFINED_REASONS.map((r) => (
                                    <div
                                        key={r}
                                        onClick={() => {
                                            setSelectedReason(r);
                                            if (r !== "Khác") setReason(r);
                                            else setReason("");
                                        }}
                                        className={`cursor-pointer p-3 rounded-lg border text-sm transition-all flex items-center gap-3 ${selectedReason === r ? "border-amber-500 bg-amber-500/10 text-amber-500 font-medium shadow-[0_0_10px_rgba(245,158,11,0.1)]" : "border-darkBorderV1 bg-darkBackgroundV1 text-neutral-300 hover:border-neutral-500 hover:bg-darkBorderV1/30"}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${selectedReason === r ? "border-amber-500" : "border-neutral-500"}`}>
                                            {selectedReason === r && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                                        </div>
                                        {r}
                                    </div>
                                ))}
                            </div>
                            {selectedReason === "Khác" && (
                                <Input 
                                    className="mt-3 bg-darkBackgroundV1 border-darkBorderV1 focus:border-amber-500 transition-colors"
                                    placeholder="Vui lòng nhập lý do cụ thể..." 
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter className="px-5 pb-5 pt-0 border-t-0">
                    <Button variant="outline" onClick={onClose} disabled={isPending} className="w-full sm:w-auto">
                        Hủy bỏ
                    </Button>
                    <Button 
                        variant={isActive ? "destructive" : "default"} 
                        className={`w-full sm:w-auto ${isActive ? "" : "bg-green-600 hover:bg-green-700"}`}
                        onClick={handleConfirm}
                        disabled={isPending || (isActive && !reason.trim())}
                    >
                        {isPending && <Icon path={mdiLoading} size={0.8} className="animate-spin mr-2" />}
                        {isActive ? 'Khóa tài khoản' : 'Mở khóa ngay'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
