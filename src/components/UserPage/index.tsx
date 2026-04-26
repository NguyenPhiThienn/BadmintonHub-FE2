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
import { useDeleteUser, useUsers } from "@/hooks/useUsers";
import { IUser, UserRole } from "@/interface/auth";
import { UserTable } from "./UserTable";
import { UserDetailsDialog } from "./UserDetailsDialog";
import { CreateUserDialog } from "./CreateUserDialog";
import { mdiAccountPlus, mdiAccountPlusOutline, mdiLockReset, mdiMagnify, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function UserPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [initialIsEditing, setInitialIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { isMobile, isTablet } = useResponsive();

    const {
        data: userResponse,
        isLoading,
        isFetching,
        refetch,
    } = useUsers({
        page: currentPage,
        limit: pageSize,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
    });

    const handleRefresh = () => {
        setSearchQuery("");
        setRoleFilter("all");
        setStatusFilter("all");
        setCurrentPage(1);
        refetch();
    };

    const { mutate: deleteUserMutation, isPending: isDeleting } = useDeleteUser();

    const handleAction = (user: IUser, mode: "view" | "edit") => {
        setSelectedUser(user);
        setInitialIsEditing(mode === "edit");
        setIsDetailsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setSelectedUser(userResponse?.data?.users.find((u: IUser) => (u._id || u.id) === id) || null);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        const id = selectedUser._id || selectedUser.id;
        return new Promise((resolve, reject) => {
            deleteUserMutation(id, {
                onSuccess: () => {
                    setSelectedUser(null);
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

    const users = Array.isArray(userResponse?.data) ? userResponse.data : userResponse?.data?.users || [];
    const totalItems = userResponse?.data?.pagination?.total || users.length || 0;
    const totalPages = userResponse?.data?.pagination?.totalPages || Math.ceil(totalItems / pageSize) || 1;

    return (
        <TooltipProvider>
            <div className="space-y-4 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Quản lý người dùng</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Section Search and Filter */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="relative w-full md:flex-1">
                            <Input
                                placeholder="Tìm kiếm theo tên, email, sđt..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                                    <SelectItem value="PLAYER">Người chơi</SelectItem>
                                    <SelectItem value="COURT_OWNER">Chủ sân</SelectItem>
                                    <SelectItem value="admin">Quản trị viên</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="active">Hoạt động</SelectItem>
                                    <SelectItem value="blocked">Đã khóa</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={handleRefresh}
                                disabled={isFetching}
                                title="Làm mới"
                                variant="ghost"
                            >
                                <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                {!isMobile && "Làm mới"}
                            </Button>

                            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-accent hover:bg-accent/90">
                                <Icon path={mdiAccountPlus} size={0.8} />
                                {!isMobile && "Thêm người dùng"}
                            </Button>
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <UserTable
                            users={users}
                            isLoading={isLoading || isFetching}
                            isSearching={!!searchQuery}
                            onAction={handleAction}
                            onDelete={handleDelete}
                            currentPage={currentPage}
                            pageSize={pageSize}
                        />
                    </Card>
                </motion.div>

                {totalItems > pageSize && (
                    <div className="flex items-center justify-center mt-4">
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
                    title={`Xóa người dùng: ${selectedUser?.fullName || selectedUser?.full_name || ""}`}
                    description="Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác."
                    confirmText="Xóa người dùng"
                    errorMessage="Xóa người dùng thất bại"
                />

                <UserDetailsDialog
                    isOpen={isDetailsDialogOpen}
                    onClose={() => {
                        setIsDetailsDialogOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                />

                <CreateUserDialog
                    isOpen={isCreateDialogOpen}
                    onClose={() => setIsCreateDialogOpen(false)}
                />
            </div>
        </TooltipProvider>
    );
}
