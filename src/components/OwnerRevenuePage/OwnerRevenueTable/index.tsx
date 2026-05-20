import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    mdiCash,
    mdiCreditCardOutline,
    mdiPlaylistRemove
} from "@mdi/js";
import Icon from "@mdi/react";
import { memo } from "react";

export interface IOwnerRevenueTransaction {
    _id: string;
    transaction_id?: string;
    amount: number;
    method: "CASH" | "VNPAY" | string;
    createdAt: string;
    booking?: {
        customerName?: string;
        customerPhone?: string;
        _id?: string;
    };
    venue?: {
        name?: string;
    };
}

interface OwnerRevenueTableProps {
    transactions: IOwnerRevenueTransaction[];
    isLoading?: boolean;
    page?: number;
    pageSize?: number;
}

const METHOD_CONFIG: Record<string, { label: string; variant: "green" | "blue" | "purple"; icon: string }> = {
    CASH: { label: "Tiền mặt", variant: "green", icon: mdiCash },
    VNPAY: { label: "VNPay", variant: "blue", icon: mdiCreditCardOutline },
};

export const OwnerRevenueTable = memo(({
    transactions,
    isLoading = false,
    page = 1,
    pageSize = 10,
}: OwnerRevenueTableProps) => {
    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center">STT</TableHead>
                        <TableHead>Mã giao dịch</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Cơ sở sân</TableHead>
                        <TableHead className="text-center">Số tiền</TableHead>
                        <TableHead className="text-center">Phương thức</TableHead>
                        <TableHead className="text-right">Thời gian</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-6 w-28 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : transactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <div className="text-center text-neutral-400 text-base py-8 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    Không tìm thấy giao dịch doanh thu nào phù hợp với bộ lọc.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        transactions.map((t, index) => {
                            const rowNumber = (page - 1) * pageSize + index + 1;
                            const method = METHOD_CONFIG[t.method] ?? { label: t.method, variant: "neutral" as any, icon: mdiCash };
                            return (
                                <TableRow
                                    key={t._id}
                                    className="cursor-default hover:bg-darkBorderV1/50 transition-colors"
                                >
                                    {/* STT */}
                                    <TableCell className="text-center">{rowNumber}</TableCell>

                                    {/* Mã giao dịch */}
                                    <TableCell>
                                        <Badge variant="neutral" title={t.transaction_id || t._id}>
                                            {t.transaction_id || t._id}
                                        </Badge>
                                    </TableCell>

                                    {/* Khách hàng */}
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {t.booking?.customerName && (
                                                <Badge variant="neutral" className="w-fit">
                                                    {t.booking.customerName}
                                                </Badge>
                                            )}
                                            {t.booking?.customerPhone && (
                                                <Badge variant="neutral" className="w-fit">
                                                    {t.booking.customerPhone}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Cơ sở sân */}
                                    <TableCell>
                                        <span className="text-accent">{t.venue?.name || "Chưa thiết lập"}</span>
                                    </TableCell>

                                    {/* Số tiền */}
                                    <TableCell className="text-center">
                                        <Badge variant="green">
                                            {(t.amount || 0).toLocaleString()} đ
                                        </Badge>
                                    </TableCell>

                                    {/* Phương thức */}
                                    <TableCell className="text-center">
                                        <Badge variant={method.variant} className="gap-1.5">
                                            <Icon path={method.icon} size={0.55} />
                                            {method.label}
                                        </Badge>
                                    </TableCell>

                                    {/* Thời gian */}
                                    <TableCell className="text-right">
                                        <Badge variant="neutral" className="font-mono text-xs">
                                            {new Date(t.createdAt).toLocaleString("vi-VN", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Badge>
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

OwnerRevenueTable.displayName = "OwnerRevenueTable";
