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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ICoupon, CouponDiscountType, CouponStatus } from "@/interface/coupon";
import {
    mdiPlaylistRemove,
    mdiSquareEditOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { memo } from "react";

interface CouponTableProps {
    coupons: ICoupon[];
    isLoading?: boolean;
    onEdit: (coupon: ICoupon) => void;
    onDelete: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
}

export const CouponTable = memo(({
    coupons,
    isLoading = false,
    onEdit,
    onDelete,
    currentPage = 1,
    pageSize = 10,
}: CouponTableProps) => {

    const formatCurrency = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + "đ";

    return (
        <TooltipProvider>
            <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12 text-center">STT</TableHead>
                            <TableHead className="text-left">Mã (Code)</TableHead>
                            <TableHead className="text-center">Loại giảm</TableHead>
                            <TableHead className="text-center">Mức giảm</TableHead>
                            <TableHead className="text-center">Đơn tối thiểu</TableHead>
                            <TableHead className="text-center">Đã dùng / Tổng</TableHead>
                            <TableHead className="text-center">Hạn sử dụng</TableHead>
                            <TableHead className="text-center">Trạng thái</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(pageSize)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-16 mx-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9}>
                                    <div className="text-center text-neutral-400 text-base py-8 italic flex items-center justify-center gap-2">
                                        <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                        Chưa có mã khuyến mãi nào.
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon, index) => {
                                const rowNumber = (currentPage - 1) * pageSize + index + 1;
                                const isExpired = new Date(coupon.endDate) < new Date();
                                const isFull = coupon.usedCount >= coupon.usageLimit;
                                
                                let displayStatus = coupon.status;
                                let badgeVariant = "green";
                                let statusText = "Hoạt động";

                                if (coupon.status === CouponStatus.DELETED) {
                                    badgeVariant = "red";
                                    statusText = "Đã xóa";
                                } else if (coupon.status === CouponStatus.INACTIVE) {
                                    badgeVariant = "yellow";
                                    statusText = "Tạm ngưng";
                                } else if (isExpired) {
                                    badgeVariant = "red";
                                    statusText = "Hết hạn";
                                } else if (isFull) {
                                    badgeVariant = "neutral";
                                    statusText = "Hết lượt";
                                }

                                return (
                                    <TableRow
                                        key={coupon._id}
                                        className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                        onClick={() => onEdit(coupon)}
                                    >
                                        <TableCell className="text-center">{rowNumber}</TableCell>
                                        <TableCell className="font-bold text-accent">
                                            {coupon.code}
                                            {coupon.venueId && (
                                                <div className="text-[10px] text-neutral-400 font-normal mt-0.5">Một sân cụ thể</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center text-sm">
                                            {coupon.discountType === CouponDiscountType.PERCENTAGE ? "Theo %" : "Tiền mặt"}
                                        </TableCell>
                                        <TableCell className="text-center font-semibold">
                                            {coupon.discountType === CouponDiscountType.PERCENTAGE 
                                                ? `${coupon.discountValue}%` 
                                                : formatCurrency(coupon.discountValue)}
                                            {coupon.maxDiscountAmount ? (
                                                <div className="text-[10px] text-neutral-400 font-normal mt-0.5">Tối đa {formatCurrency(coupon.maxDiscountAmount)}</div>
                                            ) : null}
                                        </TableCell>
                                        <TableCell className="text-center text-sm">
                                            {coupon.minOrderValue ? formatCurrency(coupon.minOrderValue) : "Không"}
                                        </TableCell>
                                        <TableCell className="text-center font-mono">
                                            {coupon.usedCount} / {coupon.usageLimit}
                                        </TableCell>
                                        <TableCell className="text-center text-sm">
                                            {format(new Date(coupon.endDate), "dd/MM/yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={badgeVariant as any}>{statusText}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center space-x-2">
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onEdit(coupon);
                                                                }}
                                                            >
                                                                <Icon path={mdiSquareEditOutline} size={0.8} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Cập nhật</TooltipContent>
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
                                                                    onDelete(coupon._id);
                                                                }}
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xóa</TooltipContent>
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
        </TooltipProvider>
    );
});

CouponTable.displayName = "CouponTable";
