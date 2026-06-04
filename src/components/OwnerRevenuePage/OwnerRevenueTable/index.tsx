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
    mdiPlaylistRemove,
    mdiRefresh
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
        address?: string;
    };
}

interface OwnerRevenueTableProps {
    transactions: IOwnerRevenueTransaction[];
    isLoading?: boolean;
    isFetching?: boolean;
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
    isFetching = false,
    page = 1,
    pageSize = 10,
}: OwnerRevenueTableProps) => {
    return (
        <div className="relative w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            {isFetching && !isLoading && (
                <div className="absolute top-2 right-2 z-10">
                    <Icon path={mdiRefresh} size={0.8} className="animate-spin text-accent" />
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center">STT</TableHead>
                        <TableHead className="text-center w-[120px]">Mã GD</TableHead>
                        <TableHead className="text-center min-w-[160px]">Khách hàng</TableHead>
                        <TableHead className="text-left min-w-[250px]">Cơ sở sân</TableHead>
                        <TableHead className="text-center w-[130px]">Số tiền</TableHead>
                        <TableHead className="text-center w-[130px]">Phương thức</TableHead>
                        <TableHead className="text-center w-[140px]">Thời gian</TableHead>
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
                                    <TableCell className="text-center font-medium text-neutral-300">
                                        {rowNumber}
                                    </TableCell>

                                    {/* Mã giao dịch */}
                                    <TableCell className="text-center">
                                        <Badge variant="neutral" className="font-mono text-xs" title={t.transaction_id || t._id}>
                                            #{(t.transaction_id || t._id).slice(-6).toUpperCase()}
                                        </Badge>
                                    </TableCell>

                                    {/* Khách hàng */}
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            {
                                                t.booking?.customerName ? (
                                                    <Badge variant="neutral">{t.booking.customerName}</Badge>
                                                ) : (
                                                    <Badge variant="neutral" className="bg-darkBorderV1/50 text-neutral-400 border-dashed font-normal italic">Khách vãng lai</Badge>
                                                )
                                            }
                                            {
                                                t.booking?.customerPhone && (
                                                    <span className="text-xs text-neutral-400">{t.booking.customerPhone}</span>
                                                )
                                            }
                                        </div>
                                    </TableCell>

                                    {/* Cơ sở sân */}
                                    <TableCell className="min-w-[250px] text-left">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-accent font-medium">{t.venue?.name || "Chưa thiết lập"}</span>
                                            {t.venue?.address && (
                                                <span className="text-xs text-neutral-400 line-clamp-1 break-all pr-2" title={t.venue.address}>
                                                    {t.venue.address}
                                                </span>
                                            )}
                                        </div>
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
                                    <TableCell className="text-center">
                                        <span className="text-sm font-medium text-neutral-300">
                                            {new Date(t.createdAt).toLocaleTimeString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        <span className="text-xs text-neutral-500 ml-1.5">
                                            {new Date(t.createdAt).toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric"
                                            })}
                                        </span>
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
