import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IBooking, BookingStatus } from "@/interface/booking";
import { formatDateWithTime } from "@/lib/format";
import { mdiCalendarCheck, mdiCheckCircleOutline, mdiCloseCircleOutline, mdiClockOutline, mdiEyeOutline, mdiPlaylistRemove } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { memo } from "react";

interface BookingTableProps {
    bookings: IBooking[];
    isLoading?: boolean;
    isSearching?: boolean;
    onView: (booking: IBooking) => void;
    onUpdateStatus: (id: string, status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => void;
    currentPage?: number;
    pageSize?: number;
}

const statusVariantMap: Record<BookingStatus, "green" | "blue" | "red" | "neutral" | "orange" | "yellow"> = {
    PENDING: "yellow",
    CONFIRMED: "blue",
    COMPLETED: "green",
    CANCELLED: "red",
};

const statusLabelMap: Record<BookingStatus, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã huỷ",
};

export const BookingTable = memo(({
    bookings,
    isLoading = false,
    isSearching = false,
    onView,
    onUpdateStatus,
    currentPage = 1,
    pageSize = 10,
}: BookingTableProps) => {
    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Người đặt</TableHead>
                        <TableHead>Cơ sở sân</TableHead>
                        <TableHead>Lịch đặt</TableHead>
                        <TableHead className="text-right">Tổng tiền</TableHead>
                        <TableHead className="text-center">Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : bookings.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    {isSearching ? "Không tìm thấy đơn đặt sân phù hợp." : "Chưa có đơn đặt sân nào."}
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        bookings.map((booking, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const player = typeof booking.playerId === 'object' && booking.playerId !== null ? booking.playerId : null;
                            const venue = typeof booking.venueId === 'object' ? booking.venueId : null;
                            const firstDetail = booking.details?.[0];
                            const court = firstDetail && typeof firstDetail.courtId === 'object' ? firstDetail.courtId : null;
                            const bookingDate = firstDetail?.bookingDate
                                ? new Date(firstDetail.bookingDate).toLocaleDateString('vi-VN')
                                : '—';

                            return (
                                <TableRow
                                    key={booking._id}
                                    className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                    onClick={() => onView(booking)}
                                >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell>
                                        {
                                            player?.fullName ? <Badge variant="green">{player?.fullName}</Badge>
                                                : <Badge variant="neutral">Khách vãng lai</Badge>
                                        }

                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{venue?.name || "—"}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {firstDetail ? (
                                            <div className="flex flex-col gap-2">
                                                {court?.name && (
                                                    <Badge variant="cyan">{court.name}</Badge>
                                                )}
                                                <Badge variant="neutral">
                                                    <Icon path={mdiClockOutline} size={0.6} className="flex-shrink-0" />
                                                    <span>{bookingDate} · {firstDetail.startTime}–{firstDetail.endTime}</span>
                                                </Badge>
                                            </div>
                                        ) : (
                                            <span className="text-neutral-400 text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="green">
                                            {booking.totalPrice?.toLocaleString()} đ
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={statusVariantMap[booking.status]}>
                                            {statusLabelMap[booking.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onView(booking);
                                                            }}
                                                        >
                                                            <Icon path={mdiEyeOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Chi tiết đơn đặt sân</TooltipContent>
                                                </Tooltip>
                                            </motion.div>

                                            {booking.status === 'PENDING' && (
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onUpdateStatus(booking._id, 'CONFIRMED');
                                                                }}
                                                            >
                                                                <Icon path={mdiCheckCircleOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xác nhận đơn</TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
                                            )}

                                            {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onUpdateStatus(booking._id, 'CANCELLED');
                                                                }}
                                                            >
                                                                <Icon path={mdiCloseCircleOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Huỷ đơn</TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
                                            )}

                                            {booking.status === 'CONFIRMED' && (
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onUpdateStatus(booking._id, 'COMPLETED');
                                                                }}
                                                            >
                                                                <Icon path={mdiCalendarCheck} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Hoàn thành đơn</TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
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

BookingTable.displayName = "BookingTable";
