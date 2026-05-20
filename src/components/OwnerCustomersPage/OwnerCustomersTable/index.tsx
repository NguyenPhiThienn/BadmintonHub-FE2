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
    mdiStar
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
                        <TableHead>Số điện thoại</TableHead>
                        <TableHead className="text-center">Số đơn đặt</TableHead>
                        <TableHead className="text-center">Đã chơi / Boom sân</TableHead>
                        <TableHead className="text-right">Doanh thu mang lại</TableHead>
                        <TableHead>Lần đặt cuối</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
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
                                <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
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
                                <TableRow
                                    key={cust.id}
                                    className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                    onClick={() => onAction(cust)}
                                >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative h-10 w-10 flex-shrink-0 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 text-accent font-semibold uppercase overflow-hidden">
                                                {cust.name.slice(0, 2)}
                                                <img
                                                    src={`https://picsum.photos/seed/${encodeURIComponent(cust.id)}/100`}
                                                    alt={cust.name}
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-neutral-200">{cust.name}</span>
                                                <div className="flex gap-1.5 mt-0.5">
                                                    {cust.totalBookings >= 3 && (
                                                        <Badge variant="orange">
                                                            <Icon path={mdiStar} size={0.6} />
                                                            <span>VIP</span>
                                                        </Badge>
                                                    )}
                                                    {cust.noShowBookings > 0 && (
                                                        <Badge variant="red">
                                                            <Icon path={mdiAlertCircle} size={0.6} />
                                                            <span>No-Show x{cust.noShowBookings}</span>
                                                        </Badge>
                                                    )}
                                                    {cust.isGuest && (
                                                        <Badge variant="neutral">
                                                            Khách vãng lai
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className=" text-neutral-300">
                                        <Badge variant="neutral">{cust.phone}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="neutral">{cust.totalBookings}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-xs">
                                            <Badge variant="green">{cust.completedBookings}</Badge>
                                            <span className="text-neutral-500">/</span>
                                            <Badge variant={cust.noShowBookings > 0 ? "red" : "neutral"}>
                                                {cust.noShowBookings}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="green">
                                            {cust.totalSpent.toLocaleString()} đ
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">
                                            {formatDateWithTime(cust.lastBookingDate)}
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
                                                                onAction(cust);
                                                            }}
                                                        >
                                                            <Icon path={mdiEyeOutline} size={0.8} />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Chi tiết</TooltipContent>
                                                </Tooltip>
                                            </motion.div>
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

OwnerCustomersTable.displayName = "OwnerCustomersTable";
