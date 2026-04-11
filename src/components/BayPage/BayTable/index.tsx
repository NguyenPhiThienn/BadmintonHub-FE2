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
import { IBay } from "@/interface/bay";
import { mdiPlaylistRemove, mdiSquareEditOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { memo } from "react";

interface BayTableProps {
    bays: IBay[];
    isLoading?: boolean;
    onAction: (bay: IBay) => void;
    onDelete: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
    canUpdate?: boolean;
    canDelete?: boolean;
    isPartner?: boolean;
}

export const BayTable = memo(({
    bays,
    isLoading = false,
    onAction,
    onDelete,
    currentPage = 1,
    pageSize = 10,
    canUpdate = true,
    canDelete = true,
    isPartner = false,
}: BayTableProps) => {
    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Tên ngăn lộ</TableHead>
                        <TableHead>Cấp điện áp</TableHead>
                        <TableHead>Công ty</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : bays.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    Không tìm thấy ngăn lộ.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        bays.map((bay, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const partnerName = typeof bay.partnerId === "object"
                                ? (bay.partnerId as any).partnerName
                                : "Chưa xác định";
                            const voltageLevelName = typeof bay.voltageLevelId === "object"
                                ? (bay.voltageLevelId as any).name
                                : "Chưa xác định";
                            const createdAt = bay.createdAt
                                ? new Date(bay.createdAt).toLocaleDateString("vi-VN")
                                : "Chưa rõ";

                            return (
                                <TableRow
                                    key={bay._id}
                                    className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                    onClick={() => onAction(bay)}
                                >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{bay.name}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{voltageLevelName}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{partnerName}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{createdAt}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            {canUpdate && (
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onAction(bay);
                                                                }}
                                                            >
                                                                <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Cập nhật ngăn lộ</TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
                                            )}
                                            {!isPartner && canDelete && (
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDelete(bay._id);
                                                                }}
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xóa ngăn lộ</TooltipContent>
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

BayTable.displayName = "BayTable";
export default BayTable;
