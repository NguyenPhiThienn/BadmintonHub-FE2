"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
import { BookingStatus, IBooking } from "@/types/booking";
import { BookingStatusBadge } from "@/components/Common/BookingStatusBadge";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiAccountOutline,
    mdiCalendarClock,
    mdiCashMultiple,
    mdiClose,
    mdiEmailOutline,
    mdiInformationOutline,
    mdiMapMarkerOutline,
    mdiPhoneOutline,
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

    const customerName = (booking.playerId && typeof booking.playerId === 'object') ? booking.playerId.fullName : "Khách vãng lai";
    const customerPhone = (booking.playerId && typeof booking.playerId === 'object') ? booking.playerId.phone : "Chưa thiết lập";
    const customerEmail = (booking.playerId && typeof booking.playerId === 'object') ? booking.playerId.email : "Chưa thiết lập";
    const venueName = (booking.venueId && typeof booking.venueId === 'object') ? booking.venueId.name : "Chưa thiết lập";
    const venueAddress = (booking.venueId && typeof booking.venueId === 'object') ? booking.venueId.address : "Chưa thiết lập";



    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiCalendarClock} size={0.8} />
                        <span>Chi tiết đơn đặt sân: #BH{booking._id.slice(-6).toUpperCase()}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    {/* Section: Basic Info */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
                        <div className="flex-1 border-b border-dashed border-accent mr-1" />
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiInformationOutline} size={0.6} />
                                            <span className="text-nowrap">Trạng thái</span>
                                        </div>
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <div className="flex">
                                            <BookingStatusBadge booking={booking} showIcon={true} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiAccountOutline} size={0.6} />
                                            <span className="text-nowrap">Khách hàng</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8 border border-darkBorderV1">
                                                <AvatarImage src={(booking.playerId as any)?.avatarUrl || (booking.playerId as any)?.avatar} />
                                            </Avatar>
                                            <Badge variant="neutral">{customerName}</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiPhoneOutline} size={0.6} />
                                            <span className="text-nowrap">Số điện thoại</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{customerPhone}</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiEmailOutline} size={0.6} />
                                            <span className="text-nowrap">Email</span>
                                        </div>
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Badge variant="neutral">{customerEmail}</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiStoreOutline} size={0.6} />
                                            <span className="text-nowrap">Cơ sở</span>
                                        </div>
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <Badge variant="neutral">{venueName}</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiMapMarkerOutline} size={0.6} />
                                            <span className="text-nowrap">Địa chỉ</span>
                                        </div>
                                    </TableCell>
                                    <TableCell colSpan={3}>
                                        <div className="text-neutral-400 text-sm italic leading-relaxed py-1">
                                            {venueAddress}
                                        </div>
                                    </TableCell>
                                </TableRow>
                                {booking.cancelReason && (
                                    <TableRow>
                                        <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                            <div className="flex items-center gap-2">
                                                <Icon path={mdiInformationOutline} size={0.6} className="text-red-400" />
                                                <span className="text-nowrap text-red-400">Lý do hủy</span>
                                            </div>
                                        </TableCell>
                                        <TableCell colSpan={3}>
                                            <span className="text-red-400 font-medium">{booking.cancelReason}</span>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {booking.cancelledBy && (
                                    <TableRow>
                                        <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                            <div className="flex items-center gap-2">
                                                <Icon path={mdiAccountOutline} size={0.6} className="text-red-400" />
                                                <span className="text-nowrap text-red-400">Người hủy</span>
                                            </div>
                                        </TableCell>
                                        <TableCell colSpan={3}>
                                            <Badge variant="neutral" className="bg-red-500/10 text-red-400 border-red-500/20">
                                                {booking.cancelledBy === 'CUSTOMER' ? 'Khách hàng' :
                                                 booking.cancelledBy === 'OWNER' ? 'Chủ sân' :
                                                 booking.cancelledBy === 'SYSTEM' ? 'Hệ thống tự động' :
                                                 booking.cancelledBy === 'ADMIN' ? 'Quản trị viên' : booking.cancelledBy}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {booking.payment?.refundInfo && (
                                    <TableRow>
                                        <TableCell className="text-neutral-300 font-semibold w-[160px] align-top">
                                            <div className="flex items-center gap-2 mt-1">
                                                <Icon path={mdiCashMultiple} size={0.6} className="text-purple-400" />
                                                <span className="text-nowrap text-purple-400">TT Hoàn tiền</span>
                                            </div>
                                        </TableCell>
                                        <TableCell colSpan={3}>
                                            <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-md space-y-1 text-sm text-purple-300">
                                                <div className="flex"><span className="w-24 text-neutral-400">Ngân hàng:</span> <span className="font-semibold text-purple-100">{booking.payment.refundInfo.bankName}</span></div>
                                                <div className="flex"><span className="w-24 text-neutral-400">Số TK:</span> <span className="font-semibold text-purple-100">{booking.payment.refundInfo.accountNumber}</span></div>
                                                <div className="flex"><span className="w-24 text-neutral-400">Chủ TK:</span> <span className="font-semibold text-purple-100">{booking.payment.refundInfo.accountName}</span></div>
                                                {booking.payment.refundInfo.reason && <div className="flex"><span className="w-24 text-neutral-400">Lý do:</span> <span className="italic">{booking.payment.refundInfo.reason}</span></div>}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>

                    {/* Section: Booking Details (Courts) */}
                    <div className="flex items-center gap-3 md:gap-4 mt-2">
                        <h3 className="text-accent font-semibold whitespace-nowrap">Danh sách sân đặt ({booking.details.length})</h3>
                        <div className="flex-1 border-b border-dashed border-accent mr-1" />
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
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
                                        <TableCell>
                                            <Badge variant="green">
                                                {detail.courtId && typeof detail.courtId === 'object' ? (detail.courtId as any).name : "N/A"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">
                                                {formatDateWithTime(booking.createdAt)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="neutral">{detail.startTime} - {detail.endTime}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="green">{detail.price?.toLocaleString() || "0"} đ</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    {/* Section: Payment Info */}
                    <div className="flex justify-end pt-2">
                        <Card className="p-4 bg-accent/5 border-darkBorderV1 min-w-[280px]">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center pb-2 border-b border-dashed border-accent/20 mb-2">
                                    <span className="text-sm text-neutral-400">Phương thức:</span>
                                    <span className="text-sm font-medium">
                                        {booking.payment?.method === 'VNPAY' ? (
                                            <Badge variant="blue">VNPay</Badge>
                                        ) : booking.payment?.method === 'CASH' ? (
                                            <Badge variant="neutral">Tiền mặt</Badge>
                                        ) : (
                                            <Badge variant="neutral" className="opacity-50">-</Badge>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-neutral-400">Tạm tính:</span>
                                    <span className="text-sm font-medium text-neutral-300">{booking.totalPrice.toLocaleString()} đ</span>
                                </div>
                                {booking.finalPrice && booking.finalPrice < booking.totalPrice && (
                                    <div className="flex justify-between items-center text-green-400">
                                        <span className="text-sm">Giảm giá:</span>
                                        <span className="text-sm font-medium">-{(booking.totalPrice - booking.finalPrice).toLocaleString()} đ</span>
                                    </div>
                                )}
                                <div className="border-t border-dashed border-accent/30 pt-2 flex justify-between items-center">
                                    <div className="flex items-center gap-1 text-accent font-semibold">
                                        <Icon path={mdiCashMultiple} size={0.8} />
                                        <span className="text-xs uppercase tracking-wider">Tổng cộng</span>
                                    </div>
                                    <span className="text-lg font-bold text-accent">
                                        {(booking.finalPrice || booking.totalPrice).toLocaleString()} đ
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
