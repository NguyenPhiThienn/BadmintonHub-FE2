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
import { IPartner } from "@/interface/partner";
import { mdiEyeOutline, mdiPlaylistRemove, mdiSquareEditOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";

interface PartnerTableProps {
    partners: IPartner[];
    isLoading?: boolean;
    onView: (partner: IPartner) => void;
    onEdit: (partner: IPartner) => void;
    onDelete: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export const PartnerTable = ({
    partners,
    isLoading = false,
    onView,
    onEdit,
    onDelete,
    currentPage = 1,
    pageSize = 10,
    canUpdate = true,
    canDelete = true,
}: PartnerTableProps) => {
    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Tên công ty</TableHead>
                        <TableHead>Địa chỉ</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : partners.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    Không tìm thấy công ty.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        partners.map((partner, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const contactsStr = partner.contacts?.length
                                ? partner.contacts.map((c) => `${c.name}: ${c.phoneNumber}`).join("; ")
                                : "-";
                            return (
                                <TableRow
                                    key={partner._id}
                                    className="hover:bg-darkBorderV1/50 transition-colors cursor-pointer"
                                    onClick={() => onView(partner)}
                                >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell className="text-accent">
                                        {partner.partnerName}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={partner.address}>
                                        {partner.address}
                                    </TableCell>
                                    <TableCell className="max-w-[180px] truncate text-sm" title={contactsStr}>
                                        {contactsStr}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={partner.isActive ? "green" : "destructive"}>
                                            {partner.isActive ? "Hoạt động" : "Ngưng"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            onClick={() => onView(partner)}
                                                        >
                                                            <Icon path={mdiEyeOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Chi tiết công ty</TooltipContent>
                                                </Tooltip>
                                            </motion.div>

                                            {canUpdate && (
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                onClick={() => onEdit(partner)}
                                                            >
                                                                <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Cập nhật công ty</TooltipContent>
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
                                                                onClick={() => onDelete(partner._id)}
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xóa công ty</TooltipContent>
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
