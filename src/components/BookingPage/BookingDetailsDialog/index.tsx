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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IBooking, BookingStatus } from "@/interface/booking";
import { 
    mdiAccountOutline, 
    mdiCalendarClock, 
    mdiCashMultiple, 
    mdiClose, 
    mdiMapMarkerOutline, 
    mdiStoreOutline 
} from "@mdi/js";
import Icon from "@mdi/react";

interface BookingDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    booking: IBooking | null;
}

export const BookingDetailsDialog = ({
    isOpen,
    onClose,
    booking,
}: BookingDetailsDialogProps) => {
    if (!booking) return null;

    const customerName = typeof booking.playerId === 'object' ? booking.playerId.fullName : "Khách vãng lai";
    const customerPhone = typeof booking.playerId === 'object' ? booking.playerId.phone : "N/A";
    const customerEmail = typeof booking.playerId === 'object' ? booking.playerId.email : "N/A";
    const venueName = typeof booking.venueId === 'object' ? booking.venueId.name : "N/A";
    const venueAddress = typeof booking.venueId === 'object' ? booking.venueId.address : "N/A";

    const getStatusVariant = (status: BookingStatus) => {
        switch (status) {
            case "PENDING": return "orange";
            case "CONFIRMED": return "green";
            case "COMPLETED": return "blue";
            case "CANCELLED": return "red";
            default: return "neutral";
        }
    };

    const getStatusText = (status: BookingStatus) => {
        switch (status) {
            case "PENDING": return "Chờ xác nhận";
            case "CONFIRMED": return "Đã xác nhận";
            case "COMPLETED": return "Hoàn thành";
            case "CANCELLED": return "Đã hủy";
            default: return status;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-secondary">
                        <Icon path={mdiCalendarClock} size={0.8} />
                        <span>Chi tiết đơn đặt sân: #{booking._id.slice(-6).toUpperCase()}</span>
                        <Badge variant={getStatusVariant(booking.status)} className="ml-2">
                            {getStatusText(booking.status)}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar py-4 space-y-6">
                    {/* Section: Customer Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-accent">
                            <Icon path={mdiAccountOutline} size={0.8} />
                            <h3 className="font-semibold uppercase text-xs tracking-wider">Thông tin khách hàng</h3>
                        </div>
                        <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-accent/5 border-darkBorderV1">
                            <div>
                                <p className="text-xs text-neutral-400 mb-1">Họ và tên</p>
                                <p className="text-sm font-medium">{customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-400 mb-1">Số điện thoại</p>
                                <p className="text-sm font-medium">{customerPhone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-400 mb-1">Email</p>
                                <p className="text-sm font-medium truncate" title={customerEmail as string}>{customerEmail}</p>
                            </div>
                        </Card>
                    </div>

                    {/* Section: Venue Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-accent">
                            <Icon path={mdiStoreOutline} size={0.8} />
                            <h3 className="font-semibold uppercase text-xs tracking-wider">Cơ sở đặt sân</h3>
                        </div>
                        <Card className="p-4 bg-transparent border-darkBorderV1 space-y-2">
                            <div className="flex items-start gap-2">
                                <Icon path={mdiStoreOutline} size={0.6} className="text-neutral-500 mt-0.5" />
                                <p className="text-sm font-medium text-neutral-200">{venueName}</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Icon path={mdiMapMarkerOutline} size={0.6} className="text-neutral-500 mt-0.5" />
                                <p className="text-sm text-neutral-400">{venueAddress}</p>
                            </div>
                        </Card>
                    </div>

                    {/* Section: Booking Details (Courts) */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-accent">
                            <Icon path={mdiCalendarClock} size={0.8} />
                            <h3 className="font-semibold uppercase text-xs tracking-wider">Danh sách sân đặt</h3>
                        </div>
                        <div className="rounded-lg border border-darkBorderV1 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-darkBackgroundV1/50">
                                    <TableRow>
                                        <TableHead className="w-12 text-center">STT</TableHead>
                                        <TableHead>Tên sân</TableHead>
                                        <TableHead>Ngày đặt</TableHead>
                                        <TableHead className="text-center">Khung giờ</TableHead>
                                        <TableHead className="text-right">Giá tiền</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {booking.details.map((detail, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="text-center">{idx + 1}</TableCell>
                                            <TableCell className="font-medium text-secondary">
                                                {typeof detail.courtId === 'object' ? detail.courtId.name : "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(detail.bookingDate).toLocaleDateString("vi-VN")}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="neutral">{detail.startTime} - {detail.endTime}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {detail.price?.toLocaleString() || "0"} đ
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Section: Payment Info */}
                    <div className="flex justify-end pt-4">
                        <Card className="p-4 bg-accent/10 border-accent/20 min-w-[280px]">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-neutral-400">Tạm tính:</span>
                                    <span className="text-sm font-medium">{booking.totalPrice.toLocaleString()} đ</span>
                                </div>
                                {booking.finalPrice && booking.finalPrice < booking.totalPrice && (
                                    <div className="flex justify-between items-center text-green-400">
                                        <span className="text-sm">Giảm giá:</span>
                                        <span className="text-sm">-{(booking.totalPrice - booking.finalPrice).toLocaleString()} đ</span>
                                    </div>
                                )}
                                <div className="border-t border-accent/20 pt-2 flex justify-between items-center">
                                    <div className="flex items-center gap-1 text-accent font-semibold">
                                        <Icon path={mdiCashMultiple} size={0.8} />
                                        <span>TỔNG CỘNG:</span>
                                    </div>
                                    <span className="text-lg font-bold text-accent">
                                        {(booking.finalPrice || booking.totalPrice).toLocaleString()} đ
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <DialogFooter className="border-t border-darkBorderV1 pt-4">
                    <Button variant="outline" onClick={onClose} className="gap-2">
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
