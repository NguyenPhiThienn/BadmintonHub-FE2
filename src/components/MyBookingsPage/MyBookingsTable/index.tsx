import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BookingStatus, IBooking } from "@/types/booking";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiCancel,
    mdiEyeOutline,
    mdiPlaylistRemove,
    mdiCreditCardOutline,
    mdiCash,
} from "@mdi/js";
import Link from "next/link";
import { memo } from "react";
import { BookingStatusBadge } from "@/components/Common/BookingStatusBadge";

interface MyBookingsTableProps {
    bookings: IBooking[];
    isLoading: boolean;
    currentPage: number;
    pageSize: number;
    onCancel: (booking: IBooking) => void;
}



export const MyBookingsTable = memo(({
    bookings,
    isLoading,
    currentPage,
    pageSize,
    onCancel,
}: MyBookingsTableProps) => {
    return (
        <div className="w-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] text-center">STT</TableHead>
                        <TableHead className="w-[120px] text-center">Mã đơn</TableHead>
                        <TableHead className="min-w-[200px]">Cơ sở sân</TableHead>
                        <TableHead className="w-[120px] text-center">Cố định</TableHead>
                        <TableHead className="w-[140px] text-center">Ngày đặt</TableHead>
                        <TableHead className="w-[145px] text-center">Khung giờ</TableHead>
                        <TableHead className="w-[120px] text-center">Tổng tiền</TableHead>
                        <TableHead className="w-[140px] text-center">Thanh toán</TableHead>
                        <TableHead className="w-[140px] text-center">Trạng thái</TableHead>
                        <TableHead className="text-center w-[120px] sticky right-0 bg-darkBackgroundV1 z-20 border-l border-darkBorderV1 shadow-[-4px_0_15px_rgba(0,0,0,0.3)]">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i} className="group">
                                <TableCell className="text-center"><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell className="text-right sticky right-0 group-odd:bg-darkBorderV1 group-even:bg-darkCardV1 z-10 border-l border-darkBorderV1 shadow-[-4px_0_15px_rgba(0,0,0,0.3)]"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : bookings.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10}>
                                <div className="text-center text-neutral-400 text-base py-12 italic flex flex-col items-center justify-center gap-4">
                                    <Icon path={mdiPlaylistRemove} size={2} />
                                    <span>Bạn chưa có lịch đặt sân nào.</span>
                                    <Button variant="outline">
                                        <Link href="/venues">Đặt sân ngay</Link>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        bookings.map((booking: IBooking, index: number) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const isVenueObj = booking.venueId !== null && typeof booking.venueId === "object";
                            const venueName = isVenueObj ? (booking.venueId as any).name : "Sân cầu lông (Đã giải thể)";
                            const venueAddress = isVenueObj ? (booking.venueId as any).address : "Địa chỉ không khả dụng";
                            const venueIdStr = isVenueObj ? (booking.venueId as any)._id : (booking.venueId || "");
                            const shortBookingId = `BH${booking._id.toString().slice(-6).toUpperCase()}`;
                            return (
                                <TableRow 
                                    key={booking._id} 
                                    className="hover:bg-darkBorderV1/30 transition-colors group cursor-pointer"
                                    onClick={() => window.open(`/booking/success?bookingId=${booking._id}`, '_blank')}
                                >
                                    <TableCell className="text-center font-medium w-[50px]">{rowNumber}</TableCell>
                                    <TableCell className="text-center w-[120px] font-mono text-xs text-neutral-300">
                                        {shortBookingId}
                                    </TableCell>
                                    <TableCell className="min-w-[200px]">
                                        <div className="flex flex-col">
                                            <Link target="_blank" href={`/venues/${venueIdStr}`} onClick={(e) => e.stopPropagation()}>
                                                <span className="hover:underline text-accent font-semibold">{venueName}</span>
                                            </Link>
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
                                            <Badge variant="neutral">{formatDateWithTime(booking.createdAt)}</Badge>
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
                                                {booking.finalPrice?.toLocaleString("vi-VN")}đ
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[140px] text-center">
                                        <div className="flex justify-center">
                                            {booking.payment?.method === 'VNPAY' ? (
                                                <Badge variant="blue"><Icon path={mdiCreditCardOutline} size={0.6} className="mr-1" /> VNPay</Badge>
                                            ) : booking.payment?.method === 'CASH' ? (
                                                <Badge variant="neutral"><Icon path={mdiCash} size={0.6} className="mr-1" /> Tiền mặt</Badge>
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
                                    <TableCell className="text-center w-[120px] sticky right-0 group-odd:bg-darkBorderV1 group-even:bg-darkCardV1 group-hover:bg-[#1c242c] transition-colors z-10 border-l border-darkBorderV1 shadow-[-4px_0_15px_rgba(0,0,0,0.3)]">
                                        <div className="flex justify-center gap-2">
                                            {(booking.status === "PENDING" || booking.status === "CONFIRMED") ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-[82px] px-0 gap-1 text-[11px] bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCancel(booking);
                                                    }}
                                                    title="Hủy đặt sân"
                                                >
                                                    <Icon path={mdiCancel} size={0.6} />
                                                    Hủy đơn
                                                </Button>
                                            ) : (
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
        </div>
    );
});

MyBookingsTable.displayName = "MyBookingsTable";
