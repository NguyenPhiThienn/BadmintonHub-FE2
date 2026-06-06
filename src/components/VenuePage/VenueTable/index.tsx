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
import { IVenue } from "@/types/venue";
import {
    mdiCheck,
    mdiClose,
    mdiEyeOutline,
    mdiPlaylistRemove,
    mdiSquareEditOutline,
    mdiTrashCanOutline,
    mdiLockOutline,
    mdiLockOpenOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { memo } from "react";

interface VenueTableProps {
    venues: IVenue[];
    isLoading?: boolean;
    onApprove?: (venue: IVenue) => void;
    onReject?: (venue: IVenue) => void;
    onAction: (venue: IVenue, mode: "view" | "edit") => void;
    onDelete: (id: string) => void;
    onViewLegal: (venue: IVenue) => void;
    onRequestClosure?: (venueId: string) => void;
    onApproveClosure?: (venueId: string) => void;
    onRejectClosure?: (venueId: string) => void;
    onCancelClosure?: (venueId: string) => void;
    onRequestReopen?: (venueId: string) => void;
    currentPage?: number;
    pageSize?: number;
    showAdminActions?: boolean;
}

export const VenueTable = memo(({
    venues,
    isLoading = false,
    onApprove = () => { },
    onReject = () => { },
    onAction,
    onDelete,
    onViewLegal,
    onRequestClosure,
    onApproveClosure,
    onRejectClosure,
    onCancelClosure,
    onRequestReopen,
    currentPage = 1,
    pageSize = 10,
    showAdminActions = true,
}: VenueTableProps) => {

    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center">STT</TableHead>
                        <TableHead className="text-center">Tên cơ sở</TableHead>
                        <TableHead className="text-left">Địa chỉ</TableHead>
                        <TableHead className="text-center">Số sân</TableHead>
                        <TableHead className="text-center">Giờ mở cửa</TableHead>
                        <TableHead className="text-center">Giá thuê</TableHead>
                        <TableHead className="text-center">Trạng thái</TableHead>
                        <TableHead className="text-center">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-48 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-24 mx-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : venues.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8}>
                                <div className="text-center text-neutral-400 text-base py-8 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    Không có dữ liệu cơ sở sân nào.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        venues.map((venue, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            return (
                                <TableRow
                                    key={venue._id}
                                    className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                    onClick={() => onAction(venue, "view")}
                                >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell className="text-sm text-accent hover:underline cursor-pointer text-center" onClick={() => onAction(venue, "view")}>
                                        {venue.name}
                                    </TableCell>
                                    <TableCell className="max-w-[250px] text-wrap text-left" title={venue.address}>
                                        {venue.address}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="neutral">
                                            {venue.totalCourts || 0} sân
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="neutral">
                                            {venue.openTime} - {venue.closeTime}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="green">
                                            {venue.pricePerHour?.toLocaleString()} đ/giờ
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={venue.status === 'ACTIVE' ? 'green' : (venue.status === 'PENDING' || venue.status === 'PENDING_CLOSURE') ? 'yellow' : 'red'}
                                        >
                                            {venue.status === 'ACTIVE' ? 'Hoạt động' : venue.status === 'PENDING' ? 'Chờ duyệt' : venue.status === 'PENDING_CLOSURE' ? 'Chờ duyệt đóng' : venue.status === 'CLOSED' ? 'Đã đóng' : 'Đã khóa'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center space-x-2">
                                            {showAdminActions && venue.status === 'PENDING' && (
                                                <>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="green"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onApprove(venue);
                                                                    }}
                                                                >
                                                                    <Icon path={mdiCheck} size={0.8} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Phê duyệt</TooltipContent>
                                                        </Tooltip>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="red"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onReject(venue);
                                                                    }}
                                                                >
                                                                    <Icon path={mdiClose} size={0.8} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Từ chối</TooltipContent>
                                                        </Tooltip>
                                                    </motion.div>
                                                </>
                                            )}
                                            {showAdminActions && venue.status === 'PENDING_CLOSURE' && (
                                                <>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="green"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onApproveClosure?.(venue._id);
                                                                    }}
                                                                >
                                                                    <Icon path={mdiCheck} size={0.8} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Duyệt đóng cơ sở</TooltipContent>
                                                        </Tooltip>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="red"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onRejectClosure?.(venue._id);
                                                                    }}
                                                                >
                                                                    <Icon path={mdiClose} size={0.8} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Từ chối đóng cơ sở</TooltipContent>
                                                        </Tooltip>
                                                    </motion.div>
                                                </>
                                            )}
                                            {!showAdminActions && venue.status !== 'PENDING_CLOSURE' && (
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
                                                                    onAction(venue, "edit");
                                                                }}
                                                            >
                                                                <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Cập nhật cơ sở sân
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
                                            )}
                                            {!showAdminActions && (venue.status === 'ACTIVE' || venue.status === 'INACTIVE') && (
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onRequestClosure?.(venue._id);
                                                                }}
                                                            >
                                                                <Icon path={mdiLockOutline} size={0.8} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xin đóng cơ sở</TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
                                            )}
                                            {!showAdminActions && venue.status === 'PENDING_CLOSURE' && (
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="border-neutral-500/50 text-neutral-400 hover:text-white hover:border-neutral-400"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onCancelClosure?.(venue._id);
                                                                }}
                                                            >
                                                                <Icon path={mdiClose} size={0.8} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Hủy yêu cầu đóng cơ sở</TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
                                            )}
                                            {!showAdminActions && venue.status === 'CLOSED' && (
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="green"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onRequestReopen?.(venue._id);
                                                                }}
                                                            >
                                                                <Icon path={mdiLockOpenOutline} size={0.8} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xin mở lại cơ sở</TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
                                            )}
                                            {showAdminActions && venue.status !== 'PENDING' && venue.status !== 'PENDING_CLOSURE' && (
                                                <>
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
                                                                        onAction(venue, "edit");
                                                                    }}
                                                                >
                                                                    <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Cập nhật cơ sở sân
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </motion.div>
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="destructive"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onDelete(venue._id);
                                                                    }}
                                                                >
                                                                    <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Xóa cơ sở sân
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </motion.div>
                                                </>
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

VenueTable.displayName = "VenueTable";
