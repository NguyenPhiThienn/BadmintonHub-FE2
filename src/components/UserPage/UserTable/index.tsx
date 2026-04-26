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
import { IUser } from "@/interface/auth";
import { mdiEyeOutline, mdiFaceManProfile, mdiPlaylistRemove, mdiSquareEditOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { memo } from "react";

interface UserTableProps {
    users: IUser[];
    isSearching: boolean;
    isLoading?: boolean;
    onAction: (user: IUser, mode: "view" | "edit") => void;
    onDelete: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
}

export const UserTable = memo(({
    users,
    isSearching,
    isLoading = false,
    onAction,
    onDelete,
    currentPage = 1,
    pageSize = 10,
}: UserTableProps) => {
    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] text-center">STT</TableHead>
                        <TableHead className="w-[80px] text-center">Ảnh</TableHead>
                        <TableHead>Họ và Tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Số điện thoại</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-10 w-10 rounded-full mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8}>
                                <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    Không tìm thấy người dùng.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const id = user._id || user.id;
                            const fullName = user.fullName || user.full_name || user.username || "Người dùng";
                            const avatar = user.avatarUrl || user.avatar;
                            const phone = user.phone || user.phoneNumber || "-";
                            const role = user.role as string;
                            const isActive = (user as any).active !== false && (user as any).status !== 'BLOCKED';

                            return (
                                <TableRow
                                    key={id}
                                    className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                    onClick={() => onAction(user, "view")}
                                >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell>
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-darkCardV1 border border-darkBorderV1 flex items-center justify-center mx-auto">
                                            {avatar ? (
                                                <img
                                                    src={avatar}
                                                    alt={fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Icon path={mdiFaceManProfile} size={0.8} className="text-neutral-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{fullName}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{user.email}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{phone}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={role === 'admin' || role === 'ADMIN' ? 'red' : role === 'COURT_OWNER' ? 'blue' : 'green'}
                                        >
                                            {role === 'admin' || role === 'ADMIN' ? 'Quản trị viên' : role === 'COURT_OWNER' ? 'Chủ sân' : 'Người chơi'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={isActive ? "green" : "red"}>
                                            {isActive ? "Hoạt động" : "Đã khóa"}
                                        </Badge>
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
                                                                onAction(user, "view");
                                                            }}
                                                        >
                                                            <Icon path={mdiEyeOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Chi tiết người dùng
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onAction(user, "edit");
                                                            }}
                                                        >
                                                            <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Cập nhật người dùng
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
                                                                onDelete(id);
                                                            }}
                                                        >
                                                            <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Xóa người dùng
                                                    </TooltipContent>
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

UserTable.displayName = "UserTable";
