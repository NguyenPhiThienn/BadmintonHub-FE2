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
import { IVenue } from "@/interface/venue";
import { formatDateOnly } from "@/lib/format";
import {
    mdiCheck,
    mdiClose,
    mdiEyeOutline,
    mdiFileDocumentOutline,
    mdiPlaylistRemove
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { memo } from "react";

interface VenueApprovalTableProps {
    venues: IVenue[];
    isLoading?: boolean;
    onApprove: (venue: IVenue) => void;
    onReject: (venue: IVenue) => void;
    onViewDetails: (venue: IVenue) => void;
    onViewLegal: (venue: IVenue) => void;
    currentPage?: number;
    pageSize?: number;
}

export const VenueApprovalTable = memo(({
    venues,
    isLoading = false,
    onApprove,
    onReject,
    onViewDetails,
    onViewLegal,
    currentPage = 1,
    pageSize = 10,
}: VenueApprovalTableProps) => {

    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Tên cơ sở</TableHead>
                        <TableHead>Chủ sở hữu</TableHead>
                        <TableHead>Email/SĐT</TableHead>
                        <TableHead>Ngày gửi</TableHead>
                        <TableHead className="text-center">Hồ sơ</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : venues.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <div className="text-center text-neutral-400 text-base py-8 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    Không có yêu cầu phê duyệt nào đang chờ.
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
                                >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell className="font-medium text-accent hover:underline" onClick={() => onViewDetails(venue)}>
                                        {venue.name}
                                    </TableCell>
                                    <TableCell>{venue.ownerName || "Chưa cập nhật"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs gap-0.5">
                                            <span className="text-neutral-300">{venue.ownerEmail || "-"}</span>
                                            <span className="text-neutral-500">{venue.ownerPhone || "-"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{venue.createdAt ? formatDateOnly(venue.createdAt) : "-"}</TableCell>
                                    <TableCell className="text-center">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewLegal(venue);
                                                    }}
                                                >
                                                    <Icon path={mdiFileDocumentOutline} size={0.7} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Xem tài liệu pháp lý</TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            className="h-8 w-8 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white border-none"
                                                            onClick={() => onApprove(venue)}
                                                        >
                                                            <Icon path={mdiCheck} size={0.7} />
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
                                                            className="h-8 w-8 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border-none"
                                                            onClick={() => onReject(venue)}
                                                        >
                                                            <Icon path={mdiClose} size={0.7} />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Từ chối</TooltipContent>
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
