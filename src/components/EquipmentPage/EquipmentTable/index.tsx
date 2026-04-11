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
import { IEquipment } from "@/interface/equipment";
import { mdiEyeOutline, mdiPlaylistRemove, mdiSquareEditOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";

interface EquipmentTableProps {
    equipment: IEquipment[];
    isSearching: boolean;
    isLoading?: boolean;
    onEdit: (item: IEquipment) => void;
    onDelete: (id: string) => void;
    onViewHistory: (equipmentId: string) => void;
    onViewDetails: (item: IEquipment) => void;
    currentPage?: number;
    pageSize?: number;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export const EquipmentTable = ({
    equipment,
    isSearching,
    isLoading = false,
    onEdit,
    onDelete,
    onViewHistory,
    onViewDetails,
    currentPage = 1,
    pageSize = 10,
    canUpdate = true,
    canDelete = true,
}: EquipmentTableProps) => {
    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Mã dụng cụ</TableHead>
                        <TableHead>Tên dụng cụ</TableHead>
                        <TableHead>Số chế tạo</TableHead>
                        <TableHead>Hãng sản xuất</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Hiện có</TableHead>
                        <TableHead>Tình trạng</TableHead>
                        <TableHead>Ghi chú</TableHead>
                        <TableHead>Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : equipment.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10}>
                                <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={0.8} className="flex-shrink-0" />
                                    {isSearching
                                        ? "Không tìm thấy dụng cụ."
                                        : "Quản lý dụng cụ trống."}
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        equipment.map((item, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            return (
                                <TableRow
                                    key={item._id}
                                    className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                    onClick={() => onViewDetails(item)}
                                >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell>
                                        <Badge variant="green">{item.equipmentCode}</Badge>
                                    </TableCell>
                                    <TableCell>{item.equipmentName}</TableCell>
                                    <TableCell><Badge variant="neutral">{item.serialNumber}</Badge></TableCell>
                                    <TableCell>{item.manufacturer}</TableCell>
                                    <TableCell><Badge variant="cyan">{item.quantity}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant="cyan">
                                            {item.availableQuantity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === "Tốt" ? "green" : "orange"}>
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell title={item.notes}>
                                        <div className="w-[200px] max-w-[200px] whitespace-normal break-words">
                                            {item.notes}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
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
                                                                onViewDetails(item);
                                                            }}
                                                        >
                                                            <Icon path={mdiEyeOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Chi tiết thiết bị
                                                    </TooltipContent>
                                                </Tooltip>
                                            </motion.div>
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
                                                                    onEdit(item);
                                                                }}
                                                            >
                                                                <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Cập nhật thiết bị
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
                                            )}
                                            {canDelete && (
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
                                                                    onDelete(item._id);
                                                                }}
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Xóa thiết bị
                                                        </TooltipContent>
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
};
