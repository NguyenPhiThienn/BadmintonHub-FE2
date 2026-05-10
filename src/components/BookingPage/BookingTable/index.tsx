"use client";
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
import { BookingStatus, IBooking } from "@/interface/booking";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiCheckCircleOutline,
    mdiCloseCircleOutline,
    mdiEyeOutline,
    mdiPlaylistRemove
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { memo } from "react";

interface BookingTableProps {
    bookings: IBooking[];
    isLoading?: boolean;
    onAction: (booking: IBooking) => void;
    onUpdateStatus: (id: string, status: BookingStatus) => void;
    currentPage?: number;
    pageSize?: number;
}

export const BookingTable = memo(({
    bookings,
    isLoading = false,
    onAction,
    onUpdateStatus,
    currentPage = 1,
    pageSize = 10,
}: BookingTableProps) => {

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
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center">STT</TableHead>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Cơ sở</TableHead>
                        <TableHead className="text-center">Số lượng sân</TableHead>
                        <TableHead className="text-right">Tổng tiền</TableHead>
                        <TableHead>Ngày & giờ đặt</TableHead>
                        <TableHead className="text-center">Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : bookings.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9}>
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

                            return (
                                <TableRow
                                    key={booking._id}
                                    className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                    onClick={() => onAction(booking)}
                                >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">#{booking._id.slice(-6).toUpperCase()}</Badge>
                                    </TableCell>
                                    <TableCell >
                                        <Badge variant="neutral">
                                            {customerName}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="min-w-[200px]">
                                        <span className="text-accent hover:underline cursor-pointer">{venueName}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="neutral">{booking.details?.length || 0}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="green">
                                            {booking.finalPrice?.toLocaleString() || booking.totalPrice.toLocaleString()} đ
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">
                                            {
                                                formatDateWithTime(booking.createdAt)
                                            }
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(booking.status)}>
                                            {getStatusText(booking.status)}
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
                                                                onAction(booking);
                                                            }}
                                                        >
                                                            <Icon path={mdiEyeOutline} size={0.8} />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Chi tiết</TooltipContent>
                                                </Tooltip>
                                            </motion.div>

                                            {booking.status === "PENDING" && (
                                                <>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onUpdateStatus(booking._id, "CONFIRMED");
                                                                    }}
                                                                >
                                                                    <Icon path={mdiCheckCircleOutline} size={0.8} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Xác nhận</TooltipContent>
                                                        </Tooltip>
                                                    </motion.div>

                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="destructive"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onUpdateStatus(booking._id, "CANCELLED");
                                                                    }}
                                                                >
                                                                    <Icon path={mdiCloseCircleOutline} size={0.8} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Hủy bỏ</TooltipContent>
                                                        </Tooltip>
                                                    </motion.div>
                                                </>
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
