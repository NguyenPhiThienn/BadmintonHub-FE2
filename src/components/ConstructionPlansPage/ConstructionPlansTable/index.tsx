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
import { IConstructionPlan } from "@/interface/partner";
import {
    mdiEyeOutline,
    mdiLinkVariant,
    mdiPlaylistRemove,
    mdiSquareEditOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import Link from "next/link";

interface ConstructionPlansTableProps {
    plans: IConstructionPlan[];
    isLoading?: boolean;
    onView: (plan: IConstructionPlan) => void;
    onEdit: (plan: IConstructionPlan) => void;
    onDelete: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
    canUpdate?: boolean;
    canDelete?: boolean;
    isPartner?: boolean;
}

export function ConstructionPlansTable({
    plans,
    isLoading = false,
    onView,
    onEdit,
    onDelete,
    currentPage = 1,
    pageSize = 10,
    canUpdate = true,
    canDelete = true,
    isPartner = false,
}: ConstructionPlansTableProps) {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="w-full overflow-auto border border-darkBorderV1 rounded-md bg-darkCardV1/30">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Công ty</TableHead>
                        <TableHead>Mô tả phương án</TableHead>
                        <TableHead>Ngày tải lên</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i} className="border-b border-darkBorderV1/50">
                                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : plans.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    Không tìm thấy phương án thi công.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        plans.map((plan, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            return (
                                <TableRow
                                    key={plan._id}
                                    className="border-b border-darkBorderV1/50 hover:bg-darkBorderV1/20 transition-colors cursor-pointer"
                                    onClick={() => onView(plan)}
                                >
                                    <TableCell className="text-neutral-300 font-medium text-center">{rowNumber}</TableCell>
                                    <TableCell className="w-[240px] min-w-[240px]">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-accent w-[300px] min-w-[300px]">{plan.partnerName}</span>
                                            {plan.constructionPlansFileUrl && (
                                                <Link
                                                    href={plan.constructionPlansFileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline underline-offset-4 text-sm w-fit"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Icon path={mdiLinkVariant} size={0.6} className="flex-shrink-0" />
                                                    Click để xem và tải xuống
                                                </Link>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="min-w-[300px] w-[300px] text-neutral-300" title={plan.description}>
                                        {plan.description}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{formatDate(plan.uploadedAt)}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={plan.isActive ? "green" : "destructive"}>
                                            {plan.isActive ? "Hiệu lực" : "Không hiệu lực"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onView(plan);
                                                            }}
                                                        >
                                                            <Icon path={mdiEyeOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Xem chi tiết</TooltipContent>
                                                </Tooltip>
                                            </motion.div>

                                            {canUpdate && (
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onEdit(plan);
                                                                }}
                                                            >
                                                                <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Cập nhật phương án</TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
                                            )}

                                            {canDelete && (
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDelete(plan._id);
                                                                }}
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xóa phương án</TooltipContent>
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
}
