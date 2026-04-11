"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IJobPlan } from "@/interface/jobPlan";
import { mdiBriefcaseArrowLeftRightOutline, mdiEye, mdiPlaylistRemove, mdiSquareEditOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

interface JobPlanTableProps {
    plans: IJobPlan[];
    isLoading: boolean;
    onEdit: (plan: IJobPlan) => void;
    onDelete: (plan: IJobPlan) => void;
    onViewDetails: (plan: IJobPlan) => void;
    onEnterWorkspace?: (plan: IJobPlan) => void;
    currentPage: number;
    pageSize: number;
    isPartner?: boolean;
}

export const JobPlanTable = ({
    plans,
    isLoading,
    onEdit,
    onDelete,
    onViewDetails,
    onEnterWorkspace,
    currentPage,
    pageSize,
    isPartner,
}: JobPlanTableProps) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-neutral-400 animate-pulse">Đang tải dữ liệu, vui lòng chờ trong giây lát...</p>
            </div>
        );
    }

    if (!plans.length) {
        return (
            <div className="text-center text-neutral-400 text-base py-10 italic flex items-center justify-center gap-2">
                <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                Không tìm thấy phương án công việc
            </div>
        );
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Đã duyệt":
                return "green";
            case "Đang trao đổi":
                return "blue";
            case "Từ chối":
                return "red";
            default:
                return "neutral";
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-center">STT</TableHead>
                    <TableHead>Tên phương án</TableHead>
                    <TableHead>Đơn vị (Công ty)</TableHead>
                    <TableHead>Nội dung sơ bộ trao đổi</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {plans.map((plan, index) => (
                    <TableRow
                        key={plan._id}
                        className="cursor-pointer hover:bg-accent/5 transition-colors"
                        onClick={() => onViewDetails(plan)}
                    >
                        <TableCell className="text-center">
                            {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell className="text-accent font-medium">
                            {plan.planName}
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">
                                {typeof plan.partnerId === "object" ? (plan.partnerId as any).partnerName : ""}
                            </Badge>
                        </TableCell>
                        <TableCell className="max-w-[400px] truncate text-neutral-300 ">
                            {plan.summary ? plan.summary : <span className="text-neutral-400 italic">Chưa có nội dung trao đổi</span>}
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge variant={getStatusVariant(plan.status)}>
                                {plan.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">
                                {plan.createdAt ? format(new Date(plan.createdAt), "dd/MM/yyyy", { locale: vi }) : ""}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end space-x-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={`/work-exchange/workspace/${plan._id}`}
                                            target="_blank"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button>
                                                <Icon path={mdiBriefcaseArrowLeftRightOutline} size={0.8} />
                                                Vào Workspace
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>Vào Workspace</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(plan);
                                            }}
                                        >
                                            <Icon path={mdiEye} size={0.8} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Chi tiết phương án</TooltipContent>
                                </Tooltip>

                                {!isPartner && (
                                    <>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(plan);
                                                    }}
                                                >
                                                    <Icon path={mdiSquareEditOutline} size={0.8} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Cập nhật phương án</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(plan);
                                                    }}
                                                >
                                                    <Icon path={mdiTrashCanOutline} size={0.8} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Xóa phương án</TooltipContent>
                                        </Tooltip>
                                    </>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
