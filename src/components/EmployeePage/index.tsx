"use client";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useResponsive } from "@/hooks/use-mobile";
import { useDeleteEmployee, useEmployees, useEmployeesMetadata } from "@/hooks/useEmployees";
import { usePermissions } from "@/hooks/usePermissions";
import { IEmployee } from "@/interface/employee";
import { mdiAccountPlusOutline, mdiLockReset, mdiMagnify, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CreateEmployeeDialog } from "./CreateEmployeeDialog";
import { EmployeeDetailsDialog } from "./EmployeeDetailsDialog";
import { EmployeeTable } from "./EmployeeTable";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

export default function EmployeePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);
    const [initialIsEditing, setInitialIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [departmentFilter, setDepartmentFilter] = useState<string>("all");
    const [positionFilter, setPositionFilter] = useState<string>("all");
    const { isMobile, isTablet } = useResponsive();
    const { hasPermission } = usePermissions();

    const canAdd = hasPermission("employee-management:add");
    const canRepass = hasPermission("employee-management:repass");
    const canUpdate = hasPermission("employee-management:update");
    const canDelete = hasPermission("employee-management:delete");
    const canAuthor = hasPermission("employee-management:author");

    const { data: metadataResponse } = useEmployeesMetadata();
    const departments = metadataResponse?.data?.departments || [];
    const positions = metadataResponse?.data?.positions || [];

    const {
        data: employeeResponse,
        isLoading,
        isFetching,
        refetch,
    } = useEmployees({
        page: currentPage,
        limit: pageSize,
        department: departmentFilter !== "all" ? departmentFilter : undefined,
        position: positionFilter !== "all" ? positionFilter : undefined,
        search: searchQuery || undefined,
    });

    const handleRefresh = () => {
        setSearchQuery("");
        setDepartmentFilter("all");
        setPositionFilter("all");
        setCurrentPage(1);
        refetch();
    };

    const { mutate: deleteEmployeeMutation, isPending: isDeleting } = useDeleteEmployee();

    const handleAction = (employee: IEmployee, mode: "view" | "edit") => {
        setSelectedEmployee(employee);
        setInitialIsEditing(mode === "edit");
        setIsDetailsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setSelectedEmployee(employeeResponse?.data?.employees.find((e: IEmployee) => e._id === id) || null);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedEmployee) return;
        return new Promise((resolve, reject) => {
            deleteEmployeeMutation(selectedEmployee._id, {
                onSuccess: () => {
                    setSelectedEmployee(null);
                    resolve(true);
                },
                onError: (error) => {
                    reject(error);
                }
            });
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const employees = employeeResponse?.data?.employees || [];
    const totalItems = employeeResponse?.data?.pagination?.total || 0;
    const totalPages = employeeResponse?.data?.pagination?.totalPages || 1;

    return (
        <TooltipProvider>
            <div className="space-y-4 md:space-y-4 bg-darkCardV1  p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Quản lý nhân sự</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Section Thanh tìm kiếm và bộ lọc */}
                    {isMobile ? (
                        <div className="space-y-4 md:space-y-4">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRefresh}
                                    disabled={isFetching}
                                >
                                    <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                </Button>
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Tìm kiếm nhân viên..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 py-2 w-full"
                                    />
                                    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Phòng ban" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả phòng ban</SelectItem>
                                        {departments.map((dept: string) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={positionFilter} onValueChange={setPositionFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chức vụ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả chức vụ</SelectItem>
                                        {positions.map((pos: string) => (
                                            <SelectItem key={pos} value={pos}>
                                                {pos}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-3 md:gap-4">

                                {canRepass && (
                                    <Button
                                        onClick={() => setIsResetPasswordDialogOpen(true)}
                                    >
                                        <Icon path={mdiLockReset} size={0.8} className="flex-shrink-0" />
                                        Re-Pass
                                    </Button>
                                )}
                                {canAdd && (
                                    <Button
                                        className="flex-[2]"
                                        onClick={() => {
                                            setSelectedEmployee(null);
                                            setIsCreateDialogOpen(true);
                                        }}
                                    >
                                        <Icon path={mdiAccountPlusOutline} size={0.8} className="flex-shrink-0" />
                                        Thêm nhân viên
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : isTablet ? (
                        <div className="flex flex-col gap-3 mb-4">
                            <div className="relative w-full">
                                <Input
                                    placeholder="Tìm kiếm nhân viên..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 py-2 w-full"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                            </div>
                            <div className="flex items-center justify-between gap-3 md:gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Phòng ban" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả phòng ban</SelectItem>
                                            {departments.map((dept: string) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chức vụ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả chức vụ</SelectItem>
                                            {positions.map((pos: string) => (
                                                <SelectItem key={pos} value={pos}>
                                                    {pos}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={handleRefresh}
                                        disabled={isFetching}
                                    >
                                        <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                    </Button>
                                    {canRepass && (
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => setIsResetPasswordDialogOpen(true)}
                                            title="Đặt lại mật khẩu"
                                        >
                                            <Icon path={mdiLockReset} size={0.8} className="flex-shrink-0" />
                                        </Button>
                                    )}
                                    {canAdd && (
                                        <Button
                                            onClick={() => {
                                                setSelectedEmployee(null);
                                                setIsCreateDialogOpen(true);
                                            }}
                                        >
                                            <Icon path={mdiAccountPlusOutline} size={0.8} className="flex-shrink-0" />
                                            Thêm nhân viên
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="relative w-full flex-1">
                                <Input
                                    placeholder="Tìm kiếm nhân viên..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 py-2 w-full"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger className="w-[190px]">
                                        <SelectValue placeholder="Phòng ban" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả phòng ban</SelectItem>
                                        {departments.map((dept: string) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={positionFilter} onValueChange={setPositionFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Chức vụ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả chức vụ</SelectItem>
                                        {positions.map((pos: string) => (
                                            <SelectItem key={pos} value={pos}>
                                                {pos}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleRefresh}
                                    disabled={isFetching}
                                    title="Reset bộ lọc"
                                    variant="ghost"
                                >
                                    <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                    Reset bộ lọc
                                </Button>
                                {canRepass && (
                                    <Button
                                        onClick={() => {
                                            setIsResetPasswordDialogOpen(true);
                                        }}
                                    >
                                        <Icon path={mdiLockReset} size={0.8} className="flex-shrink-0" />
                                        Re-Pass
                                    </Button>
                                )}
                                {canAdd && (
                                    <Button
                                        onClick={() => {
                                            setSelectedEmployee(null);
                                            setIsCreateDialogOpen(true);
                                        }}
                                    >
                                        <Icon path={mdiAccountPlusOutline} size={0.8} className="flex-shrink-0" />
                                        Thêm nhân viên
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <EmployeeTable
                            employees={employees}
                            isLoading={isLoading || isFetching}
                            isSearching={!!searchQuery}
                            onAction={handleAction}
                            onDelete={handleDelete}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                        />
                    </Card>
                </motion.div>
                {totalItems > pageSize && (
                    <div className="flex items-center justify-center">
                        <Pagination
                            page={currentPage}
                            pageSize={pageSize}
                            total={totalItems}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
                <DeleteDialog
                    isOpen={isDeleteDialogOpen}
                    isDeleting={isDeleting}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title={`Xóa nhân viên: ${selectedEmployee?.fullName || ""}`}
                    description="Bạn có chắc chắn muốn xóa nhân viên này không? Hệ thống sẽ chuyển trạng thái sang ngưng hoạt động."
                    confirmText="Xóa nhân viên"
                    successMessage="Xóa nhân viên thành công"
                    errorMessage="Xóa nhân viên thất bại"
                />

                <CreateEmployeeDialog
                    isOpen={isCreateDialogOpen}
                    onClose={() => {
                        setIsCreateDialogOpen(false);
                    }}
                />

                <ResetPasswordDialog
                    isOpen={isResetPasswordDialogOpen}
                    onClose={() => setIsResetPasswordDialogOpen(false)}
                />

                <EmployeeDetailsDialog
                    isOpen={isDetailsDialogOpen}
                    onClose={() => {
                        setIsDetailsDialogOpen(false);
                        setSelectedEmployee(null);
                    }}
                    employee={selectedEmployee}
                    initialIsEditing={initialIsEditing}
                />
            </div >
        </TooltipProvider >
    );
}
