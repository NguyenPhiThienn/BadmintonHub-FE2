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
import { IVoltageLevel } from "@/interface/voltageLevel";
import { mdiFlash, mdiSquareEditOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { memo } from "react";

interface VoltageLevelTableProps {
    voltageLevels: IVoltageLevel[];
    isLoading?: boolean;
    onAction: (voltageLevel: IVoltageLevel) => void;
    onDelete: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
    canUpdate?: boolean;
    canDelete?: boolean;
    isPartner?: boolean;
}

export const VoltageLevelTable = memo(({
    voltageLevels,
    isLoading = false,
    onAction,
    onDelete,
    currentPage = 1,
    pageSize = 10,
    canUpdate = true,
    canDelete = true,
    isPartner = false,
}: VoltageLevelTableProps) => {
    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Tên cấp điện áp</TableHead>
                        <TableHead>Thuộc công ty</TableHead>
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
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : voltageLevels.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiFlash} size={0.8} className="flex-shrink-0" />
                                    Không tìm thấy cấp điện áp.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        voltageLevels.map((vl, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const partnerName = typeof vl.partnerId === "object"
                                ? (vl.partnerId as any).partnerName
                                : "Không có công ty";
                            const createdAt = vl.createdAt
                                ? new Date(vl.createdAt).toLocaleDateString("vi-VN")
                                : "Không có ngày tạo";

                            return (
                                <TableRow
                                    key={vl._id}
                                    className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                    onClick={() => onAction(vl)}
                                >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{vl.name}</Badge>
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
                                                                    onAction(vl);
                                                                }}
                                                            >
                                                                <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Cập nhật cấp điện áp</TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
                                            )}
                                            {!isPartner && (
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
                                                                    onDelete(vl._id);
                                                                }}
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xóa cấp điện áp</TooltipContent>
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

VoltageLevelTable.displayName = "VoltageLevelTable";
export default VoltageLevelTable;
