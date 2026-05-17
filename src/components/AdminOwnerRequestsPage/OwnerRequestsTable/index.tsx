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
import {
    mdiEyeOutline,
    mdiFaceManProfile,
    mdiPlaylistRemove
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { memo } from "react";

interface OwnerRequestsTableProps {
    requests: any[];
    isLoading?: boolean;
    isFetching?: boolean;
    currentPage?: number;
    pageSize?: number;
    onViewDetails: (request: any) => void;
}

export const OwnerRequestsTable = memo(({
    requests,
    isLoading = false,
    isFetching = false,
    currentPage = 1,
    pageSize = 10,
    onViewDetails,
}: OwnerRequestsTableProps) => {

    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center">STT</TableHead>
                        <TableHead className="w-16 text-center">Ảnh</TableHead>
                        <TableHead>Họ và Tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Số điện thoại</TableHead>
                        <TableHead>CCCD</TableHead>
                        <TableHead>Địa chỉ sân</TableHead>
                        <TableHead className="text-center">Trạng thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading || isFetching ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-9 w-9 rounded-full mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : requests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9}>
                                <div className="text-center text-neutral-400 text-base py-8 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    Không có đơn đăng ký chủ sân nào.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        requests.map((request: any, index: number) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const userObj = request.userId || {};
                            const fullName = userObj.fullName || "Người dùng";
                            const avatar = userObj.avatarUrl || userObj.avatar;
                            const phone = userObj.phone || "-";
                            const status = request.status;

                            return (
                                <TableRow
                                    key={request._id}
                                    className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                    onClick={() => onViewDetails(request)}
                                >
                                    <TableCell className="text-center text-neutral-300">{rowNumber}</TableCell>
                                    <TableCell>
                                        <div className="w-9 h-9 rounded-full overflow-hidden bg-darkBackgroundV1 border border-darkBorderV1 flex items-center justify-center mx-auto">
                                            {avatar ? (
                                                <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <Icon path={mdiFaceManProfile} size={0.6} className="text-neutral-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-white">{fullName}</TableCell>
                                    <TableCell className="text-neutral-300">{userObj.email || "-"}</TableCell>
                                    <TableCell className="text-neutral-300">{phone}</TableCell>
                                    <TableCell className="text-neutral-300">{request.identityCard}</TableCell>
                                    <TableCell className="max-w-[200px] truncate text-neutral-300" title={request.courtAddress}>
                                        {request.courtAddress}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={
                                                status === "APPROVED"
                                                    ? "green"
                                                    : status === "REJECTED"
                                                        ? "red"
                                                        : "yellow"
                                            }
                                        >
                                            {status === "APPROVED"
                                                ? "Đã duyệt"
                                                : status === "REJECTED"
                                                    ? "Đã từ chối"
                                                    : "Chờ xét duyệt"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end space-x-2">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            onClick={() => onViewDetails(request)}
                                                        >
                                                            <Icon path={mdiEyeOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Chi tiết hồ sơ
                                                    </TooltipContent>
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

OwnerRequestsTable.displayName = "OwnerRequestsTable";
