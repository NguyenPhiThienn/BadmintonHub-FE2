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
import { BookingStatus, IBooking } from "@/interface/booking";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiCancel,
    mdiEyeOutline,
    mdiPlaylistRemove,
} from "@mdi/js";
import Link from "next/link";
import { memo } from "react";

interface MyBookingsTableProps {
    bookings: IBooking[];
    isLoading: boolean;
    currentPage: number;
    pageSize: number;
    onCancel: (id: string) => void;
}

const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
        case "CONFIRMED":
            return <Badge variant="green">Đã xác nhận</Badge>;
        case "PENDING":
            return <Badge variant="amber">Chờ thanh toán</Badge>;
        case "COMPLETED":
            return <Badge variant="blue">Hoàn thành</Badge>;
        case "CANCELLED":
            return <Badge variant="destructive">Đã hủy</Badge>;
        default:
            return <Badge variant="neutral">{status}</Badge>;
    }
};

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
                        <TableHead>Cơ sở sân</TableHead>
                        <TableHead>Ngày đặt</TableHead>
                        <TableHead>Khung giờ</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : bookings.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <div className="text-center text-neutral-400 text-base py-12 italic flex flex-col items-center justify-center gap-4">
                                    <Icon path={mdiPlaylistRemove} size={2} className="opacity-20" />
                                    <span>Bạn chưa có lịch đặt sân nào.</span>
                                    <Button variant="outline" asChild>
                                        <Link href="/venues">Đặt sân ngay</Link>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        bookings.map((booking: IBooking, index: number) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const venueName = typeof booking.venueId === "object" ? booking.venueId.name : "Sân cầu lông";
                            const venueAddress = typeof booking.venueId === "object" ? booking.venueId.address : "";
                            return (
                                <TableRow key={booking._id} className="hover:bg-darkBorderV1/30 transition-colors">
                                    <TableCell className="text-center font-medium">{rowNumber}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <Link href={`/venue/${typeof booking.venueId === "object" ? booking.venueId._id : booking.venueId}`}><span className="hover:underline text-accent">{venueName}</span></Link>
                                            <span className="text-sm text-neutral-400 line-clamp-2">{venueAddress}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{formatDateWithTime(booking.createdAt)}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {booking.details.map((d, i) => (
                                            <Badge key={i} variant="neutral">
                                                {d.startTime}-{d.endTime}
                                            </Badge>
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="green">
                                            {booking.finalPrice?.toLocaleString("vi-VN")}đ
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(booking.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                asChild
                                                title="Xem chi tiết"
                                            >
                                                <Link href={`/booking/success?bookingId=${booking._id}`}>
                                                    <Icon path={mdiEyeOutline} size={0.8} />
                                                    Xem chi tiết
                                                </Link>
                                            </Button>
                                            {booking.status === "PENDING" && (
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => onCancel(booking._id)}
                                                    title="Hủy đặt"
                                                >
                                                    <Icon path={mdiCancel} size={0.8} />
                                                    Hủy đặt sân
                                                </Button>
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
