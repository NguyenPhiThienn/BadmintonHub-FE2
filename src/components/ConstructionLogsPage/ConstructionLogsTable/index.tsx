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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { IConstructionLog } from "@/interface/task";
import { mdiEyeOutline, mdiPlaylistRemove, mdiSquareEditOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";

interface ConstructionLogsTableProps {
    logs: IConstructionLog[];
    isLoading?: boolean;
    onView: (log: IConstructionLog, isEditing?: boolean) => void;
    onDelete: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
    canUpdate?: boolean;
    canDelete?: boolean;
    isPartner?: boolean;
}

function formatDate(d: string) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function ConstructionLogsTable({
    logs,
    isLoading = false,
    onView,
    onDelete,
    currentPage = 1,
    pageSize = 10,
    canUpdate = true,
    canDelete = true,
    isPartner = false,
}: ConstructionLogsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Dự án</TableHead>
                    <TableHead>Hạng mục</TableHead>
                    <TableHead>Địa điểm</TableHead>
                    <TableHead>Chủ đầu tư</TableHead>
                    <TableHead>Nhân sự</TableHead>
                    <TableHead>Thiết bị</TableHead>
                    <TableHead>Chỉ huy</TableHead>
                    <TableHead>Giám sát</TableHead>
                    <TableHead>Công việc thực hiện trong ngày</TableHead>
                    <TableHead>Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    [...Array(pageSize)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                    ))
                ) : logs.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={13}>
                            <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                Không tìm thấy nhật ký thi công.
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    logs.map((log, index) => {
                        const rowNumber = (currentPage - 1) * pageSize + index + 1;
                        const isEnded = log.status === "closed" || log.status === "completed" || !!log.shiftEndTime;
                        const commanderName = (log.commander && typeof log.commander === 'object') ? log.commander.fullName : (log.commander || "-");
                        const displayLocation = log.location || log.constructionSite || "-";
                        const equipmentList = Array.isArray(log.equipmentUsed) ? log.equipmentUsed : (log.equipmentUsed ? [log.equipmentUsed] : []);
                        const equipment = equipmentList.join(", ");

                        return (
                            <TableRow
                                key={log._id}
                                className="hover:bg-darkBorderV1/50 transition-colors cursor-pointer"
                                onClick={() => onView(log)}
                            >
                                <TableCell className="font-medium text-neutral-300">{rowNumber}</TableCell>
                                <TableCell>
                                    <Badge variant="neutral">{formatDate(log.logDate)}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-2 items-start">
                                        {log.status === "active" && (
                                            <Badge variant="orange">Mới tạo</Badge>
                                        )}
                                        {log.status === "updated" && (
                                            <Badge variant="cyan">Đã cập nhật</Badge>
                                        )}
                                        {log.status === "completed" && (
                                            <Badge variant="green">Đã hoàn thành</Badge>
                                        )}
                                        {log.status === "closed" && (
                                            <Badge variant="green">Đã đóng ca</Badge>
                                        )}
                                        {(!log.status || !["active", "updated", "completed", "closed"].includes(log.status)) && (
                                            <Badge variant={isEnded ? "green" : "orange"}>
                                                {isEnded ? "Đã kết thúc ca" : "Đang thực hiện"}
                                            </Badge>
                                        )}
                                        {log.shiftEndTime && (
                                            <span className="text-sm font-bold text-cyan-400 uppercase tracking-tighter">
                                                Kết thúc: {new Date(log.shiftEndTime).toLocaleTimeString("vi-VN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="min-w-[300px] w-[300px] text-neutral-300 flex flex-col gap-1">
                                    <span className="text-neutral-300 leading-tight">{log.projectName}</span>
                                    {log.shift && <Badge variant="cyan" className="w-fit">{log.shift}</Badge>}
                                </TableCell>
                                <TableCell className="min-w-[200px] w-[200px]">
                                    {log.constructionName}
                                </TableCell>
                                <TableCell className="min-w-[200px] w-[200px]">
                                    {displayLocation}
                                </TableCell>
                                <TableCell className="min-w-[200px] w-[200px]">
                                    {log.investor || "Chưa cập nhật CĐT"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="cyan">{log.employeeCount || 0} NV</Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-neutral-300 line-clamp-2" title={equipment}>
                                        {equipment || "-"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="neutral">{commanderName}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="neutral">{log.supervisorName || log.supervisor || "-"}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div
                                        className="text-sm text-neutral-300 line-clamp-2 leading-relaxed prose prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: log.workDescription || "-" }}
                                        title={log.workDescription?.replace(/<[^>]*>?/gm, '')}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <div className="flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onView(log);
                                                        }}
                                                    >
                                                        <Icon path={mdiEyeOutline} size={0.8} className="flex-shrink-0" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Xem chi tiết</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            {canUpdate && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onView(log, true);
                                                            }}
                                                        >
                                                            <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Cập nhật công việc</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                            {canDelete && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete(log._id);
                                                            }}
                                                        >
                                                            <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Xóa nhật ký</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );
}
