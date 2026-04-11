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
import { ITestJob } from "@/interface/testing";
import {
    mdiEye,
    mdiFilePdfBox,
    mdiPlaylistRemove,
    mdiSquareEditOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";


interface LaboratoryWorkTableProps {
    jobs: ITestJob[];
    isLoading: boolean;
    onEdit: (job: ITestJob) => void;
    onDelete: (job: ITestJob) => void;
    onViewDetails: (job: ITestJob) => void;
    currentPage: number;
    pageSize: number;
    isPartner?: boolean;
}

export const LaboratoryWorkTable = ({
    jobs,
    isLoading,
    onEdit,
    onDelete,
    onViewDetails,
    currentPage,
    pageSize,
    isPartner,
}: LaboratoryWorkTableProps) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-neutral-400 animate-pulse">Đang tải dữ liệu, vui lòng chờ trong giây lát...</p>
            </div>
        );
    }

    if (!jobs.length) {
        return (
            <div className="text-center text-neutral-400 text-base py-10 italic flex items-center justify-center gap-2">
                <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                Không tìm thấy công việc thí nghiệm
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-center">STT</TableHead>
                    <TableHead className="text-center">Số biên bản</TableHead>
                    <TableHead>Ngày thí nghiệm</TableHead>
                    <TableHead>Thiết bị (Tên vận hành)</TableHead>
                    <TableHead>Loại thiết bị</TableHead>
                    <TableHead>Tên dự án/Tên trạm</TableHead>
                    <TableHead>Đơn vị (Công ty)</TableHead>
                    <TableHead>Loại thí nghiệm</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                    <TableHead>Người kiểm duyệt</TableHead>
                    <TableHead className="text-center">Kết quả</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {jobs.map((job, index) => (
                    <TableRow key={job._id} className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => onViewDetails(job)}>
                        <TableCell className="text-center">
                            {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                            <Badge variant="green">{job.reportNumber || ""}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">{job.testDate ? format(new Date(job.testDate), "dd/MM/yyyy", { locale: vi }) : ""}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">
                                {typeof job.deviceId === 'object' ? (job.deviceId as any)?.operatingName : "--"}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">
                                {typeof job.deviceId === 'object' && typeof (job.deviceId as any).deviceTypeId === 'object'
                                    ? (job.deviceId as any).deviceTypeId.name
                                    : ""}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-accent text-wrap">
                            {job?.projectName}
                        </TableCell>
                        <TableCell className="text-accent text-wrap">
                            {typeof (job.deviceId as any)?.partnerId === 'object' ? (job.deviceId as any)?.partnerId?.partnerName : ""}
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">
                                {job.testType}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">{job.testerName || ""}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">{job.approverName || ""}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge
                                variant={job.status === "Đạt" ? "green" : "red"}
                            >
                                {job.status?.toUpperCase() || "N/A"}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end space-x-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button asChild>
                                            <Link href={`/laboratory-work/preview/${job._id}`} target="_blank">
                                                <Icon path={mdiFilePdfBox} size={0.8} />
                                                Xem biên bản
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Xem biên bản</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(job);
                                            }}
                                        >
                                            <Icon path={mdiEye} size={0.8} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Chi tiết kết quả</TooltipContent>
                                </Tooltip>

                                {!isPartner && (
                                    <>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(job);
                                                    }}
                                                >
                                                    <Icon path={mdiSquareEditOutline} size={0.8} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Cập nhật kết quả</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(job);
                                                    }}
                                                >
                                                    <Icon path={mdiTrashCanOutline} size={0.8} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Xóa kết quả</TooltipContent>
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
