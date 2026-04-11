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
import { ITestingDevice } from "@/interface/testing";
import { mdiEye, mdiFlask, mdiLoading, mdiPlaylistRemove, mdiSquareEditOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface TestingDeviceTableProps {
    devices: ITestingDevice[];
    isLoading: boolean;
    onEdit: (device: ITestingDevice) => void;
    onDelete: (device: ITestingDevice) => void;
    onViewDetails: (device: ITestingDevice) => void;
    onAddJob: (device: ITestingDevice) => void;
    currentPage: number;
    pageSize: number;
    isPartner?: boolean;
}

export const TestingDeviceTable = ({
    devices,
    isLoading,
    onEdit,
    onDelete,
    onViewDetails,
    onAddJob,
    currentPage,
    pageSize,
    isPartner,
}: TestingDeviceTableProps) => {
    if (isLoading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center gap-3 text-neutral-400 italic">
                <Icon path={mdiLoading} size={1.2} className="animate-spin" />
                <p>Đang tải dữ liệu, vui lòng chờ trong giây lát...</p>
            </div>
        );
    }

    if (devices.length === 0) {
        return (
            <div className="text-center text-neutral-400 text-base py-6 italic flex items-center justify-center gap-2">
                <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                Không tìm thấy thiết bị thí nghiệm.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-center">STT</TableHead>
                    <TableHead>Tên vận hành</TableHead>
                    <TableHead>Mã thiết bị</TableHead>
                    <TableHead>Loại thiết bị</TableHead>
                    <TableHead>Hãng sản xuất</TableHead>
                    <TableHead>Đơn vị quản lý</TableHead>
                    <TableHead>Ngày vận hành</TableHead>
                    <TableHead>Chu kỳ (Năm)</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {devices.map((device, index) => (
                    <TableRow
                        key={device._id}
                        className="cursor-pointer hover:bg-accent/5 transition-colors"
                        onClick={() => onViewDetails(device)}
                    >
                        <TableCell className="text-center">
                            {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell>
                            <Badge variant="green">{device.operatingName}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">{device.equipmentCode}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">{typeof device.deviceTypeId === "object" ? (device.deviceTypeId as any).name : ""}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">{device.manufacturer}</Badge>
                        </TableCell>
                        <TableCell className="w-[300px] min-w-[300px]">
                            <span className="text-accent">{typeof device.partnerId === "object" ? (device.partnerId as any).partnerName : ""}</span>
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">{device.commissioningDate ? format(new Date(device.commissioningDate), "dd/MM/yyyy", { locale: vi }) : ""}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="neutral">{device.testCycle} năm</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                                {!isPartner && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddJob(device);
                                                }}
                                            >
                                                <Icon path={mdiFlask} size={0.8} />
                                                Thêm công việc TN
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Thêm công việc thí nghiệm</TooltipContent>
                                    </Tooltip>
                                )}

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(device);
                                            }}
                                        >
                                            <Icon path={mdiEye} size={0.8} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Chi tiết thiết bị</TooltipContent>
                                </Tooltip>
                                {
                                    !isPartner && <><Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(device);
                                                }}
                                            >
                                                <Icon path={mdiSquareEditOutline} size={0.8} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Cập nhật thiết bị</TooltipContent>
                                    </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(device);
                                                    }}
                                                >
                                                    <Icon path={mdiTrashCanOutline} size={0.8} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Xóa thiết bị</TooltipContent>
                                        </Tooltip></>
                                }

                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
