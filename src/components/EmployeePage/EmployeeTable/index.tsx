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
import { IEmployee } from "@/interface/employee";
import { mdiEyeOutline, mdiFaceManProfile, mdiPlaylistRemove, mdiSquareEditOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { memo } from "react";

interface EmployeeTableProps {
    employees: IEmployee[];
    isSearching: boolean;
    isLoading?: boolean;
    onAction: (employee: IEmployee, mode: "view" | "edit") => void;
    onDelete: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export const EmployeeTable = memo(({
    employees,
    isSearching,
    isLoading = false,
    onAction,
    onDelete,
    currentPage = 1,
    pageSize = 10,
    canUpdate = true,
    canDelete = true,
}: EmployeeTableProps) => {
    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Ảnh</TableHead>
                        <TableHead>Mã nhân viên</TableHead>
                        <TableHead>Họ và Tên</TableHead>
                        <TableHead>Ngày sinh</TableHead>
                        <TableHead>Quê quán</TableHead>
                        <TableHead>Số điện thoại</TableHead>
                        <TableHead>Phòng ban</TableHead>
                        <TableHead>Chức vụ</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : employees.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={11}>
                                <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                    Không tìm thấy nhân viên.
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        employees.map((employee, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            return (
                                <TableRow
                                    key={employee._id}
                                    className="cursor-pointer hover:bg-darkBorderV1/50 transition-colors"
                                    onClick={() => onAction(employee, "view")}
                                >
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell>
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-darkCardV1 border border-darkBorderV1 flex items-center justify-center">
                                            {employee.avatar ? (
                                                <img
                                                    src={employee.avatar}
                                                    alt={employee.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Icon path={mdiFaceManProfile} size={0.8} className="text-neutral-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="green">{employee.employeeCode}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{employee.fullName}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">
                                            {employee.dateOfBirth
                                                ? new Date(employee.dateOfBirth).toLocaleDateString("vi-VN")
                                                : "-"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{employee.hometown}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{employee.phoneNumber}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{employee.department}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{employee.position}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={employee.isActive ? "green" : "red"}>
                                            {employee.isActive ? "Đang làm việc" : "Đã thôi việc"}
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
                                                                onAction(employee, "view");
                                                            }}
                                                        >
                                                            <Icon path={mdiEyeOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Chi tiết nhân viên
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
                                                                onAction(employee, "edit");
                                                            }}
                                                        >
                                                            <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Cập nhật nhân viên
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
                                                                onDelete(employee._id);
                                                            }}
                                                        >
                                                            <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Xóa nhân viên
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

EmployeeTable.displayName = "EmployeeTable";
