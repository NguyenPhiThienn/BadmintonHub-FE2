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
import { formatDateWithTime } from "@/lib/format";
import {
    mdiAlertCircle,
    mdiEyeOutline,
    mdiPlaylistRemove,
    mdiStar,
    mdiAccountHeartOutline,
    mdiClockFast
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { memo } from "react";

interface ICustomerSummary {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatarUrl?: string;
    isGuest: boolean;
    totalBookings: number;
    totalSpent: number;
    completedBookings: number;
    noShowBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    lastBookingDate: string;
    bookings: any[];
}

interface OwnerCustomersTableProps {
    customers: ICustomerSummary[];
    isLoading?: boolean;
    onAction: (customer: ICustomerSummary) => void;
    currentPage?: number;
    pageSize?: number;
}

export const OwnerCustomersTable = memo(({
    customers,
    isLoading = false,
    onAction,
    currentPage = 1,
    pageSize = 10,
}: OwnerCustomersTableProps) => {
    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center">STT</TableHead>
                        <TableHead>Họ tên</TableHead>
                        <TableHead className="text-center">Số điện thoại</TableHead>
                        <TableHead className="text-center">Số đơn đặt</TableHead>
                        <TableHead className="text-center">Đã chơi</TableHead>
                        <TableHead className="text-center">Boom sân</TableHead>
                        <TableHead className="text-center">Doanh thu mang lại</TableHead>
                        <TableHead className="text-center">Lần đặt cuối</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            </TableRow>
                        ))
                    ) : customers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8}>
                                <div className="text-center text-neutral-400 text-base py-4 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    Không tìm thấy khách hàng nào khớp bộ lọc.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        customers.map((cust, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            return (
                                <Tooltip key={cust.id}>
                                    <TooltipTrigger asChild>
                                        <TableRow
                                            className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                            onClick={() => onAction(cust)}
                                        >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative h-10 w-10 flex-shrink-0 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 text-accent font-semibold uppercase overflow-hidden">
                                                {cust.name.slice(0, 2)}
                                                {cust.avatarUrl && (
                                                    <img
                                                        src={cust.avatarUrl}
                                                        alt={cust.name}
                                                        className="absolute inset-0 h-full w-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-neutral-200">{cust.name}</span>
                                                <div className="flex flex-wrap gap-1.5 mt-0.5">
                                                    {cust.totalSpent >= 1000000 && (
                                                        <Badge variant="orange" title="Tổng chi tiêu trên 1 triệu">
                                                            <Icon path={mdiStar} size={0.6} className="text-yellow-400" />
                                                            <span>Khách VIP</span>
                                                        </Badge>
                                                    )}
                                                    {cust.completedBookings >= 5 && cust.totalSpent < 1000000 && (
                                                        <Badge variant="blue" title="Đã chơi từ 5 trận trở lên">
                                                            <Icon path={mdiAccountHeartOutline} size={0.6} />
                                                            <span>Khách quen</span>
                                                        </Badge>
                                                    )}
                                                    {cust.noShowBookings > 0 && (
                                                        <Badge variant="red" className={cust.noShowBookings >= 3 ? "animate-pulse" : ""} title={`Đã boom sân ${cust.noShowBookings} lần`}>
                                                            <Icon path={mdiAlertCircle} size={0.6} />
                                                            <span>{cust.noShowBookings >= 3 ? "Hay Boom sân" : `Từng boom x${cust.noShowBookings}`}</span>
                                                        </Badge>
                                                    )}
                                                    {cust.totalBookings === 1 && cust.completedBookings === 0 && !cust.isGuest && (
                                                        <Badge variant="neutral" className="bg-green-500/10 text-green-500 border-green-500/20" title="Khách hàng vừa đặt lần đầu">
                                                            <Icon path={mdiClockFast} size={0.6} />
                                                            <span>Khách mới</span>
                                                        </Badge>
                                                    )}
                                                    {cust.isGuest && (
                                                        <Badge variant="neutral" title="Khách đặt trực tiếp tại sân, chưa có tài khoản">
                                                            Khách vãng lai
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-neutral-300">
                                        <Badge variant="neutral">{cust.phone}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="neutral">{cust.totalBookings}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="green">{cust.completedBookings}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={cust.noShowBookings > 0 ? "red" : "neutral"}>
                                            {cust.noShowBookings}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="green">
                                            {cust.totalSpent.toLocaleString()} đ
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="neutral">
                                            {formatDateWithTime(cust.lastBookingDate)}
                                        </Badge>
                                    </TableCell>
                                        </TableRow>
                                    </TooltipTrigger>
                                    <TooltipContent>Click vào dòng để xem chi tiết</TooltipContent>
                                </Tooltip>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
});

OwnerCustomersTable.displayName = "OwnerCustomersTable";
