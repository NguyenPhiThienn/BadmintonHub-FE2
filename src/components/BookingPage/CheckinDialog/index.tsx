"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useBookingDetails, useUpdateBookingStatus } from "@/hooks/useBooking";
import { BookingStatus } from "@/interface/booking";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiAccountOutline,
    mdiAlertCircleOutline,
    mdiCalendarCheck,
    mdiCalendarClock,
    mdiCashMultiple,
    mdiClose,
    mdiEmailOutline,
    mdiMagnify,
    mdiPhoneOutline,
    mdiQrcodeScan,
    mdiSoccerField,
    mdiStoreOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface CheckinDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CheckinDialog = ({
    isOpen,
    onClose,
}: CheckinDialogProps) => {
    const [searchVal, setSearchVal] = useState("");
    const [activeBookingId, setActiveBookingId] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: bookingRes, isLoading, refetch, isError, error } = useBookingDetails(activeBookingId);
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateBookingStatus();

    const booking = bookingRes?.data;

    useEffect(() => {
        if (isOpen) {
            setSearchVal("");
            setActiveBookingId("");
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const extractBookingId = (value: string) => {
        try {
            if (value.startsWith("http://") || value.startsWith("https://") || value.includes("/booking/success")) {
                const urlObj = new URL(value);
                return urlObj.searchParams.get("bookingId") || value;
            }
        } catch (e) {
            // Not a URL
        }
        return value;
    };

    const handleSearch = () => {
        const trimmed = searchVal.trim();
        if (!trimmed) {
            toast.warn("Vui lòng nhập mã đơn hàng hoặc quét mã QR");
            return;
        }
        const extractedId = extractBookingId(trimmed);
        setActiveBookingId(extractedId);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleUpdateStatus = (status: BookingStatus) => {
        if (!activeBookingId) return;
        updateStatus({ id: activeBookingId, data: { status: status as any } }, {
            onSuccess: () => {
                toast.success(`Đã cập nhật trạng thái đơn hàng thành ${getStatusText(status)}`);
                refetch();
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Cập nhật trạng thái thất bại");
            }
        });
    };

    const getStatusVariant = (status: BookingStatus) => {
        switch (status) {
            case "PENDING": return "orange";
            case "CONFIRMED": return "green";
            case "COMPLETED": return "blue";
            case "CANCELLED": return "red";
            case "NO_SHOW": return "red";
            default: return "neutral";
        }
    };

    const getStatusText = (status: BookingStatus) => {
        switch (status) {
            case "PENDING": return "Chờ xác nhận";
            case "CONFIRMED": return "Đã xác nhận";
            case "COMPLETED": return "Đã nhận sân (Hoàn thành)";
            case "CANCELLED": return "Đã hủy";
            case "NO_SHOW": return "Khách không đến";
            default: return status;
        }
    };

    const customerName = booking && ((booking.playerId && typeof booking.playerId === 'object') ? booking.playerId.fullName : (booking.customerName || "Khách vãng lai"));
    const customerPhone = booking && ((booking.playerId && typeof booking.playerId === 'object') ? booking.playerId.phone : (booking.customerPhone || "Chưa thiết lập"));
    const customerEmail = booking && ((booking.playerId && typeof booking.playerId === 'object') ? booking.playerId.email : (booking.customerEmail || "Chưa thiết lập"));
    const venueName = booking && ((booking.venueId && typeof booking.venueId === 'object') ? booking.venueId.name : "Chưa thiết lập");

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiQrcodeScan} size={0.8} />
                        <span>Check-in Khách Chơi Nhanh</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    {/* Search Panel */}
                    <div className="bg-accent/5 p-4 rounded-xl border border-accent/20 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                        <div className="relative flex-1 min-w-[300px]">
                            <Input
                                ref={inputRef}
                                placeholder="Nhập mã đơn hàng (ID) hoặc quét mã QR check-in..."
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                onKeyDown={handleKeyPress}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiQrcodeScan} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={isLoading}
                            variant="accent"
                        >
                            <Icon path={mdiMagnify} size={0.8} />
                            Kiểm tra đơn
                        </Button>
                    </div>

                    {/* Loading/Error states */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-10 gap-3 text-neutral-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
                            <p className="text-sm">Đang tìm kiếm thông tin đơn hàng...</p>
                        </div>
                    )}

                    {!isLoading && activeBookingId && !booking && (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 border border-dashed border-red-500/30 rounded-xl bg-red-950/10 text-red-400">
                            <Icon path={mdiAlertCircleOutline} size={1.5} />
                            <p className="font-semibold text-base">Không tìm thấy thông tin đơn đặt sân</p>
                            <p className="text-xs text-neutral-400">Mã đơn hàng: #{activeBookingId.slice(-6).toUpperCase() || activeBookingId} không khớp với bất kỳ dữ liệu nào trong cơ sở này.</p>
                        </div>
                    )}

                    {/* Booking Details View */}
                    {!isLoading && booking && (
                        <div className="space-y-4 animate-fadeIn">
                            {/* Actions Header bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-darkBackgroundV1/40 border border-darkBorderV1 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-neutral-400">Mã đơn:</span>
                                    <span className="text-base font-bold text-accent">#BH{booking._id.slice(-6).toUpperCase()}</span>
                                    <Badge variant={getStatusVariant(booking.status)}>
                                        {getStatusText(booking.status)}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    {booking.status === "CONFIRMED" ? (
                                        <Button
                                            onClick={() => handleUpdateStatus("COMPLETED")}
                                            disabled={isUpdating}
                                        >
                                            <Icon path={mdiCalendarCheck} size={0.8} />
                                            Nhận sân
                                        </Button>
                                    ) : (
                                        <div className="text-xs text-neutral-400 italic">
                                            Đơn hàng đã ở trạng thái {getStatusText(booking.status)}, không thể check-in.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-4 border-darkBorderV1 bg-darkBackgroundV1/20 space-y-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin khách hàng</h3>
                                        <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiAccountOutline} size={0.6} className="text-neutral-400" />
                                            <span className="text-neutral-400">Khách hàng:</span>
                                            <span className="font-semibold text-neutral-200">{customerName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiPhoneOutline} size={0.6} className="text-neutral-400" />
                                            <span className="text-neutral-400">Số điện thoại:</span>
                                            <span className=" text-neutral-200">{customerPhone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiEmailOutline} size={0.6} className="text-neutral-400" />
                                            <span className="text-neutral-400">Email:</span>
                                            <span className="truncate text-neutral-200 max-w-[200px]">{customerEmail}</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 border-darkBorderV1 bg-darkBackgroundV1/20 space-y-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin sân đấu</h3>
                                        <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiStoreOutline} size={0.6} className="text-neutral-400" />
                                            <span className="text-neutral-400">Cơ sở:</span>
                                            <span className="font-semibold text-neutral-200">{venueName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiSoccerField} size={0.6} className="text-neutral-400" />
                                            <span className="text-neutral-400">Danh sách sân đấu:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {booking.details.map((d: any, i: number) => (
                                                    <Badge key={i} variant="green" className="text-xs">
                                                        {typeof d.courtId === 'object' ? d.courtId.name : "N/A"}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiCalendarClock} size={0.6} className="text-neutral-400" />
                                            <span className="text-neutral-400">Thời gian đặt:</span>
                                            <span className="text-neutral-200 font-semibold">{formatDateWithTime(booking.createdAt)}</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Courts details table */}
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 text-center">STT</TableHead>
                                            <TableHead>Tên sân</TableHead>
                                            <TableHead className="text-center">Ngày đặt</TableHead>
                                            <TableHead className="text-center">Khung giờ</TableHead>
                                            <TableHead className="text-right">Giá tiền</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {booking.details.map((detail: any, idx: number) => (
                                            <TableRow key={idx}>
                                                <TableCell className="text-center">{idx + 1}</TableCell>
                                                <TableCell>
                                                    <Badge variant="green">
                                                        {typeof detail.courtId === 'object' ? detail.courtId.name : "N/A"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="neutral">{detail.bookingDate}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="neutral">{detail.startTime} - {detail.endTime}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-semibold text-green-400">{(detail.price || 0).toLocaleString()} đ</span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Payment Summary */}
                            <div className="flex justify-end">
                                <Card className="p-4 bg-accent/5 border-darkBorderV1 min-w-[280px]">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-neutral-400">Tạm tính:</span>
                                            <span className="text-neutral-300 font-medium">{booking.totalPrice.toLocaleString()} đ</span>
                                        </div>
                                        {booking.finalPrice && booking.finalPrice < booking.totalPrice && (
                                            <div className="flex justify-between items-center text-green-400">
                                                <span>Giảm giá:</span>
                                                <span className="font-medium">-{(booking.totalPrice - booking.finalPrice).toLocaleString()} đ</span>
                                            </div>
                                        )}
                                        <div className="border-t border-dashed border-accent/30 pt-2 flex justify-between items-center">
                                            <div className="flex items-center gap-1 text-accent font-semibold">
                                                <Icon path={mdiCashMultiple} size={0.8} />
                                                <span className="text-xs uppercase tracking-wider font-bold">Tổng cộng</span>
                                            </div>
                                            <span className="text-base font-bold text-accent">
                                                {(booking.finalPrice || booking.totalPrice).toLocaleString()} đ
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
