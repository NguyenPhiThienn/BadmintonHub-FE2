"use client";
import { BookingStatusBadge } from "@/components/Common/BookingStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BookingStatus, IBooking } from "@/interface/booking";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiAlertCircleOutline,
    mdiCheckCircleOutline,
    mdiCloseCircleOutline,
    mdiFlagCheckered,
    mdiPlaylistRemove,
    mdiRunFast
} from "@mdi/js";
import Icon from "@mdi/react";
import { memo, useState } from "react";

interface BookingTableProps {
    bookings: IBooking[];
    isLoading?: boolean;
    isFetching?: boolean;
    onAction: (booking: IBooking) => void;
    onUpdateStatus: (id: string, status: BookingStatus, paymentStatus?: string, cancelReason?: string) => void;
    onConfirmRefund?: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
}

export const BookingTable = memo(({
    bookings,
    isLoading = false,
    isFetching = false,
    onAction,
    onUpdateStatus,
    onConfirmRefund,
    currentPage = 1,
    pageSize = 10,
}: BookingTableProps) => {
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        bookingId: string;
        status: BookingStatus;
        title: string;
        description: string;
        variant: "default" | "destructive";
        paymentStatus?: "SUCCESS" | "DEBT";
    }>({
        isOpen: false,
        bookingId: "",
        status: "PENDING",
        title: "",
        description: "",
        variant: "default",
    });

    const [cancelConfig, setCancelConfig] = useState<{
        isOpen: boolean;
        bookingId: string;
        reason: string;
    }>({
        isOpen: false,
        bookingId: "",
        reason: "",
    });
    const [customReason, setCustomReason] = useState("");

    const CANCEL_REASONS = [
        { label: "Khách không đủ điều kiện", icon: "🚫" },
        { label: "Khách yêu cầu hủy", icon: "👤" },
        { label: "Sân bị hỏng/bảo trì", icon: "🔧" },
        { label: "Sự kiện bất ngờ tại sân", icon: "⚠️" },
        { label: "Lý do khác", icon: "✏️" },
    ];



    const statusActionConfig: Record<BookingStatus, { title: string; description: string; variant: "default" | "destructive" }> = {
        CONFIRMED: {
            title: "Xác nhận đơn đặt sân",
            description: `Xác nhận đơn đặt sân này?`,
            variant: "default",
        },
        IN_PROGRESS: {
            title: "Check-in khách vào sân",
            description: "Xác nhận khách đã đến và bắt đầu chơi?",
            variant: "default",
        },
        LATE_ARRIVAL: {
            title: "Đánh dấu đến trễ",
            description: "Đánh dấu khách này đến trễ?",
            variant: "default",
        },
        COMPLETED: {
            title: "Hoàn tất buổi chơi",
            description: "Xác nhận khách đã chơi xong và trả sân?",
            variant: "default",
        },
        CANCELLED: {
            title: "Hủy đơn đặt sân",
            description: "Hủy đơn này? Hành động không thể hoàn tác.",
            variant: "destructive",
        },
        PENDING: { title: "", description: "", variant: "default" },
        NO_SHOW: { title: "", description: "", variant: "destructive" },
    };

    const getEarlyWarning = (booking: IBooking, status: BookingStatus): string => {
        if (status !== "IN_PROGRESS" && status !== "COMPLETED") return "";
        const firstDetail = booking.details?.[0];
        if (!firstDetail) return "";

        // Build scheduled datetime from bookingDate + startTime
        const targetTime = status === "COMPLETED"
            ? firstDetail.endTime
            : firstDetail.startTime;
        const [h, m] = targetTime.split(":").map(Number);
        const scheduledDate = new Date(firstDetail.bookingDate);
        scheduledDate.setHours(h, m, 0, 0);

        const now = new Date();
        const diffMs = scheduledDate.getTime() - now.getTime();
        if (diffMs <= 0) return ""; // already past scheduled time, no warning

        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        const timeStr = hours > 0
            ? `${hours} tiếng${mins > 0 ? ` ${mins} phút` : ""}`
            : `${mins} phút`;

        const actionLabel = status === "IN_PROGRESS" ? "giờ chơi" : "giờ kết thúc";
        return `⚠️ Còn ${timeStr} nữa mới đến ${actionLabel}. Bạn có chắc muốn xác nhận sớm không?`;
    };

    const handleConfirmRequest = (booking: IBooking, status: BookingStatus, paymentStatus?: "SUCCESS" | "DEBT") => {
        const cfg = statusActionConfig[status];
        const earlyWarning = getEarlyWarning(booking, status);
        const baseDesc = cfg.description.replace("này", `#BH${booking._id.slice(-6).toUpperCase()}`);
        let fullDesc = earlyWarning ? `${baseDesc}\n\n${earlyWarning}` : baseDesc;

        if (paymentStatus === 'DEBT') {
            fullDesc += "\n\n⚠️ Đơn này sẽ được ghi nhận là Khách nợ. Nếu khách nợ quá 3 lần sẽ tự động bị khóa tài khoản.";
        }

        setConfirmConfig({
            isOpen: true,
            bookingId: booking._id,
            status,
            title: paymentStatus === 'DEBT' ? "Khách nợ (Thanh toán thất bại)" : cfg.title,
            description: fullDesc,
            variant: paymentStatus === 'DEBT' ? "destructive" : (earlyWarning ? "destructive" : cfg.variant),
            paymentStatus
        });
    };

    const handleCancelRequest = (booking: IBooking) => {
        setCancelConfig({ isOpen: true, bookingId: booking._id, reason: CANCEL_REASONS[0].label });
        setCustomReason("");
    };

    const handleCancelConfirm = () => {
        const finalReason = cancelConfig.reason === "Lý do khác" ? (customReason.trim() || "Lý do khác") : cancelConfig.reason;
        if (!finalReason) return;
        onUpdateStatus(cancelConfig.bookingId, "CANCELLED" as BookingStatus, undefined, finalReason);
        setCancelConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleConfirmAction = () => {
        onUpdateStatus(confirmConfig.bookingId, confirmConfig.status, confirmConfig.paymentStatus);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] text-center">STT</TableHead>
                        <TableHead className="w-[120px] text-center">Mã đơn</TableHead>
                        <TableHead className="w-[160px] text-center">Khách hàng</TableHead>
                        <TableHead className="min-w-[200px] text-left">Cơ sở</TableHead>
                        <TableHead className="w-[120px] text-center">Cố định</TableHead>
                        <TableHead className="w-[140px] text-center">Ngày đặt</TableHead>
                        <TableHead className="w-[145px] text-center">Khung giờ</TableHead>
                        <TableHead className="w-[120px] text-center">Tổng tiền</TableHead>
                        <TableHead className="w-[140px] text-center">Thanh toán</TableHead>
                        <TableHead className="w-[140px] text-center">Trạng thái</TableHead>
                        <TableHead className="text-center w-[190px] sticky right-0 bg-darkBackgroundV1 z-20 border-l border-darkBorderV1 shadow-[-4px_0_15px_rgba(0,0,0,0.3)]">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i} className="group">
                                <TableCell className="text-center"><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                                <TableCell className="text-right sticky right-0 group-odd:bg-darkBorderV1 group-even:bg-darkCardV1 z-10 border-l border-darkBorderV1 shadow-[-4px_0_15px_rgba(0,0,0,0.3)]"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : bookings.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={11}>
                                <div className="text-center text-neutral-400 text-base py-4 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    Không có đơn đặt sân nào.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        bookings.map((booking, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const customerName = (booking.playerId && typeof booking.playerId === 'object') ? booking.playerId.fullName : "Khách vãng lai";
                            const venueName = (booking.venueId && typeof booking.venueId === 'object') ? booking.venueId.name : "N/A";
                            const venueAddress = (booking.venueId && typeof booking.venueId === 'object') ? booking.venueId.address : "Địa chỉ không khả dụng";

                            return (
                                <TableRow
                                    key={booking._id}
                                    className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors group"
                                    onClick={() => onAction(booking)}
                                >
                                    <TableCell className="text-center font-medium w-[50px]">{rowNumber}</TableCell>
                                    <TableCell className="text-center w-[120px] font-mono text-xs text-neutral-300">
                                        #BH{booking._id.slice(-6).toUpperCase()}
                                    </TableCell>
                                    <TableCell className="w-[160px] text-center">
                                        <Badge variant="neutral">
                                            {customerName}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="min-w-[200px] text-left">
                                        <div className="flex flex-col items-start">
                                            <span className="text-accent font-semibold">{venueName}</span>
                                            <span className="text-sm text-neutral-300 mt-0.5 block" title={venueAddress}>{venueAddress}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[120px] text-center">
                                        <div className="flex justify-center">
                                            {booking.isWeekly ? (
                                                <Badge variant="blue">Cố định theo tuần</Badge>
                                            ) : (
                                                <Badge variant="neutral">Lịch đơn</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[140px] text-center">
                                        <div className="flex justify-center">
                                            <Badge variant="neutral">
                                                {formatDateWithTime(booking.createdAt)}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[145px] text-center">
                                        <div className="flex flex-col gap-1 items-center justify-center mx-auto">
                                            {booking.details.slice(0, 2).map((d, i) => (
                                                <Badge key={i} variant="neutral" className="justify-center">
                                                    {d.startTime}-{d.endTime}
                                                    {i === 1 && booking.details.length > 2 ? "..." : ""}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[120px] text-center">
                                        <div className="flex justify-center">
                                            <Badge variant="green">
                                                {booking.finalPrice?.toLocaleString() || booking.totalPrice.toLocaleString()} đ
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[140px] text-center">
                                        <div className="flex justify-center">
                                            {booking.payment?.method === 'VNPAY' ? (
                                                <Badge variant="blue">VNPay</Badge>
                                            ) : booking.payment?.method === 'CASH' ? (
                                                <Badge variant="neutral">Tiền mặt</Badge>
                                            ) : (
                                                <Badge variant="neutral" className="opacity-50">-</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[140px] text-center">
                                        <div className="flex justify-center">
                                            <BookingStatusBadge booking={booking} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center w-[190px] sticky right-0 group-odd:bg-darkBorderV1 group-even:bg-darkCardV1 group-hover:bg-[#1c242c] transition-colors z-10 border-l border-darkBorderV1 shadow-[-4px_0_15px_rgba(0,0,0,0.3)]">
                                        <div className="flex justify-center gap-2">
                                            {/* PENDING: Xác nhận / Hủy */}
                                            {booking.status === "PENDING" && (
                                                <>
                                                    <Button variant="ghost" size="sm" className="h-7 w-[82px] px-0 gap-1 text-[11px] bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all rounded-full" onClick={(e) => { e.stopPropagation(); handleConfirmRequest(booking, "CONFIRMED"); }}>
                                                        <Icon path={mdiCheckCircleOutline} size={0.6} />
                                                        Xác nhận
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-7 w-[82px] px-0 gap-1 text-[11px] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full" onClick={(e) => { e.stopPropagation(); handleCancelRequest(booking); }}>
                                                        <Icon path={mdiCloseCircleOutline} size={0.6} />
                                                        Hủy đơn
                                                    </Button>
                                                </>
                                            )}

                                            {/* CONFIRMED: Check-in + Hủy */}
                                            {booking.status === "CONFIRMED" && (
                                                <>
                                                    <Button variant="ghost" size="sm" className="h-7 w-[82px] px-0 gap-1 text-[11px] bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all rounded-full" onClick={(e) => { e.stopPropagation(); handleConfirmRequest(booking, "IN_PROGRESS"); }}>
                                                        <Icon path={mdiRunFast} size={0.6} />
                                                        Check-in
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-7 w-[82px] px-0 gap-1 text-[11px] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full" onClick={(e) => { e.stopPropagation(); handleCancelRequest(booking); }}>
                                                        <Icon path={mdiCloseCircleOutline} size={0.6} />
                                                        Hủy đơn
                                                    </Button>
                                                </>
                                            )}

                                            {/* LATE_ARRIVAL: Check-in + Hủy */}
                                            {booking.status === "LATE_ARRIVAL" && (
                                                <>
                                                    <Button variant="ghost" size="sm" className="h-7 w-[82px] px-0 gap-1 text-[11px] bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all rounded-full" onClick={(e) => { e.stopPropagation(); handleConfirmRequest(booking, "IN_PROGRESS"); }}>
                                                        <Icon path={mdiRunFast} size={0.6} />
                                                        Check-in
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-7 w-[82px] px-0 gap-1 text-[11px] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full" onClick={(e) => { e.stopPropagation(); handleCancelRequest(booking); }}>
                                                        <Icon path={mdiCloseCircleOutline} size={0.6} />
                                                        Hủy đơn
                                                    </Button>
                                                </>
                                            )}

                                            {/* IN_PROGRESS: Hoàn tất */}
                                            {booking.status === "IN_PROGRESS" && (
                                                <>
                                                    <Button variant="ghost" size="sm" className="h-7 w-[82px] px-0 gap-1 text-[11px] bg-accent/10 text-accent hover:bg-accent hover:text-darkCardV1 transition-all rounded-full" onClick={(e) => { e.stopPropagation(); handleConfirmRequest(booking, "COMPLETED", "SUCCESS"); }}>
                                                        <Icon path={mdiFlagCheckered} size={0.6} />
                                                        Hoàn tất
                                                    </Button>

                                                    {(!booking.payment || booking.payment.method === 'CASH') && (
                                                        <Button variant="ghost" size="sm" className="h-7 w-[82px] px-0 gap-1 text-[11px] bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white transition-all rounded-full" onClick={(e) => { e.stopPropagation(); handleConfirmRequest(booking, "COMPLETED", "DEBT"); }}>
                                                            <Icon path={mdiAlertCircleOutline} size={0.6} />
                                                            Nợ
                                                        </Button>
                                                    )}
                                                </>
                                            )}

                                            {/* Refund (Admin only) */}
                                            {onConfirmRefund && booking.payment?.status === 'REFUNDING' && (
                                                <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-[11px] bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all rounded-full" onClick={(e) => { e.stopPropagation(); onConfirmRefund(booking._id); }}>
                                                    <Icon path={mdiCheckCircleOutline} size={0.6} />
                                                    Xác nhận đã hoàn tiền
                                                </Button>
                                            )}

                                            {/* COMPLETED, CANCELLED, NO_SHOW: No actions */}
                                            {(booking.status === "COMPLETED" || booking.status === "CANCELLED" || booking.status === "NO_SHOW") && !(onConfirmRefund && booking.payment?.status === 'REFUNDING') && (
                                                <span className="text-neutral-500 text-xs">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            <ConfirmDialog
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmAction}
                title={confirmConfig.title}
                description={confirmConfig.description}
                variant={confirmConfig.variant}
                confirmText="Đồng ý"
                cancelText="Hủy"
            />

            {/* Cancel with reason dialog */}
            <Dialog open={cancelConfig.isOpen} onOpenChange={(open) => !open && setCancelConfig(prev => ({ ...prev, isOpen: false }))}>
                <DialogContent size="small" className="md:!w-[450px] md:!max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-400 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Icon path={mdiCloseCircleOutline} size={0.7} />
                            </div>
                            Hủy đơn đặt sân
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-3 px-4 md:px-5">
                        <p className="text-sm text-neutral-400">Chọn lý do hủy đơn đặt sân này:</p>
                        <div className="flex flex-col gap-2">
                            {CANCEL_REASONS.map(({ label, icon }) => {
                                const isSelected = cancelConfig.reason === label;
                                return (
                                    <label
                                        key={label}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                                            ? "border-red-500/60 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                                            : "border-darkBorderV1 bg-darkBackgroundV1/40 hover:border-neutral-500 hover:bg-darkBorderV1/50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="cancel-reason"
                                            value={label}
                                            checked={isSelected}
                                            onChange={() => setCancelConfig(prev => ({ ...prev, reason: label }))}
                                            className="hidden"
                                        />
                                        <span className="text-lg">{icon}</span>
                                        <span className={`text-sm font-medium ${isSelected ? "text-red-300" : "text-neutral-300"}`}>{label}</span>
                                        {isSelected && (
                                            <div className="ml-auto w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                                        )}
                                    </label>
                                );
                            })}
                        </div>

                        {cancelConfig.reason === "Lý do khác" && (
                            <div className="space-y-1.5">
                                <Label className="text-sm text-neutral-400">Nhập lý do cụ thể:</Label>
                                <Input
                                    placeholder="Ví dụ: Khách bị ốm, thời tiết xấu..."
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    className="bg-darkBackgroundV1/60 border-darkBorderV1 focus:border-red-500/50"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelConfig(prev => ({ ...prev, isOpen: false }))}>
                            Đóng
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelConfirm}
                            disabled={cancelConfig.reason === "Lý do khác" && !customReason.trim()}
                        >
                            Xác nhận hủy
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
});

BookingTable.displayName = "BookingTable";
