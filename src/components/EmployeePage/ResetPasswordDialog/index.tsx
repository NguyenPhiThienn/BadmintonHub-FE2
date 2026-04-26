"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEmployees, useResetPasswordBulk } from "@/hooks/useEmployees";
import { IEmployee } from "@/interface/employee";
import { mdiAccountMultipleOutline, mdiCheckboxMarkedCircleOutline, mdiCheckCircleOutline, mdiClose, mdiKeyVariant, mdiLockReset } from "@mdi/js";
import Icon from "@mdi/react";
import { useState } from "react";
import { toast } from "react-toastify";

interface ResetPasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ResetPasswordDialog({
    isOpen,
    onClose,
}: ResetPasswordDialogProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [newPassword, setNewPassword] = useState("");

    // Fetch all employees (large limit to avoid pagination)
    const { data: employeeResponse, isLoading } = useEmployees({
        limit: 1000,
        page: 1
    });

    const employees: IEmployee[] = (employeeResponse?.data?.employees || []).filter(
        (e: IEmployee) => e.employeeCode !== "NV001"
    );
    const { mutate: resetPasswordBulk, isPending } = useResetPasswordBulk();

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(employees.map((e) => e._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((prevId) => prevId !== id));
        }
    };

    const handleReset = () => {
        if (selectedIds.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một nhân viên");
            return;
        }
        if (!newPassword) {
            toast.warning("Vui lòng nhập mật khẩu mới");
            return;
        }

        resetPasswordBulk(
            { employeeIds: selectedIds, newPassword },
            {
                onSuccess: () => {
                    setSelectedIds([]);
                    setNewPassword("");
                    onClose();
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiLockReset} size={0.8} className="flex-shrink-0" />
                        <span>Đặt lại mật khẩu hàng loạt</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 md:gap-4">
                            <h3 className="text-primary font-semibold whitespace-nowrap">Chọn nhân viên</h3>
                            <div className="flex-1 border-b border-dashed border-primary mr-1" />
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="cyan" className="flex items-center gap-1 py-1 px-2">
                                <Icon path={mdiAccountMultipleOutline} size={0.6} />
                                Tổng số: {employees.length}
                            </Badge>
                            <Badge variant="green" className="flex items-center gap-1 py-1 px-2">
                                <Icon path={mdiCheckboxMarkedCircleOutline} size={0.6} />
                                Đã chọn: {selectedIds.length}
                            </Badge>
                        </div>

                        <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                            <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                <Checkbox
                                                    className="h-5 w-5 -translate-x-2"
                                                    checked={selectedIds.length === employees.length && employees.length > 0}
                                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                                />
                                            </TableHead>
                                            <TableHead>Mã NV</TableHead>
                                            <TableHead>Họ và Tên</TableHead>
                                            <TableHead>Phòng ban</TableHead>
                                            <TableHead>Chức vụ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-4 text-neutral-300 italic">
                                                    Đang tải danh sách...
                                                </TableCell>
                                            </TableRow>
                                        ) : employees.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-4 text-neutral-300 italic">
                                                    Không có dữ liệu nhân viên
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            employees.map((employee) => (
                                                <TableRow key={employee._id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            className="h-5 w-5"
                                                            checked={selectedIds.includes(employee._id)}
                                                            onCheckedChange={(checked) => handleSelectOne(employee._id, !!checked)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium text-sm">
                                                        <Badge variant="cyan">{employee.employeeCode}</Badge></TableCell>
                                                    <TableCell className="text-sm">{employee.fullName}</TableCell>
                                                    <TableCell className="text-sm">{employee.department}</TableCell>
                                                    <TableCell className="text-sm">{employee.position}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <h3 className="text-primary font-semibold whitespace-nowrap">Thiết lập mật khẩu mới</h3>
                            <div className="flex-1 border-b border-dashed border-primary mr-1" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="newPassword">Mật khẩu mới</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới..."
                                    className="pl-9"
                                />
                                <Icon
                                    path={mdiKeyVariant}
                                    size={0.8}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    <Button onClick={handleReset} disabled={isPending || selectedIds.length === 0}>
                        <Icon path={mdiCheckCircleOutline} size={0.8} className="flex-shrink-0" />
                        {isPending ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
