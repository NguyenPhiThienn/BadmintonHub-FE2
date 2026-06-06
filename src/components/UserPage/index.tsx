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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useResponsive } from "@/hooks/use-mobile";
import { useDeleteUser, useUsers } from "@/hooks/useUsers";
import { IUser } from "@/types/auth";
import { mdiAccountPlus, mdiMagnify, mdiRefresh, mdiClose, mdiTune } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CreateUserDialog } from "./CreateUserDialog";
import { UserDetailsDialog } from "./UserDetailsDialog";
import { BlockUserDialog } from "./BlockUserDialog";
import { UserTable } from "./UserTable";

export default function UserPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
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

    const handleBlock = (user: IUser) => {
        setSelectedUser(user);
        setIsBlockDialogOpen(true);
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
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            <div className="relative w-full md:w-[260px]">
                                <Input
                                    placeholder="Tìm kiếm theo tên, email, sđt..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-10 py-2 w-full"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                                    >
                                        <Icon path={mdiClose} size={0.8} />
                                    </button>
                                )}
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon" className="relative">
                                        <Icon path={mdiTune} size={0.8} className="text-neutral-400" />
                                        {(statusFilter !== "all" || roleFilter !== "all") && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[380px] p-5 bg-darkCardV1 border-darkBorderV1 shadow-2xl" align="start">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-white">Lọc kết quả</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-neutral-400 hover:text-white"
                                                onClick={() => {
                                                    setStatusFilter("all");
                                                    setRoleFilter("all");
                                                }}
                                            >
                                                Xóa lọc
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-neutral-400 font-medium text-xs uppercase tracking-wider">Vai trò</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { id: "all", label: "Tất cả" },
                                                    { id: "PLAYER", label: "Người chơi" },
                                                    { id: "OWNER", label: "Chủ sân" },
                                                    { id: "ADMIN", label: "Quản trị viên" },
                                                ].map(st => (
                                                    <Badge
                                                        key={st.id}
                                                        variant="neutral"
                                                        className={`cursor-pointer px-3 py-1.5 transition-colors ${roleFilter === st.id ? 'bg-accent/20 text-accent border-accent/40' : 'hover:bg-darkBorderV1/80 border-darkBorderV1 bg-darkBackgroundV1 text-neutral-400'}`}
                                                        onClick={() => setRoleFilter(st.id)}
                                                    >
                                                        {st.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-neutral-400 font-medium text-xs uppercase tracking-wider">Trạng thái</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { id: "all", label: "Tất cả" },
                                                    { id: "active", label: "Hoạt động" },
                                                    { id: "blocked", label: "Đã khóa" },
                                                ].map(st => (
                                                    <Badge
                                                        key={st.id}
                                                        variant="neutral"
                                                        className={`cursor-pointer px-3 py-1.5 transition-colors ${statusFilter === st.id ? 'bg-accent/20 text-accent border-accent/40' : 'hover:bg-darkBorderV1/80 border-darkBorderV1 bg-darkBackgroundV1 text-neutral-400'}`}
                                                        onClick={() => setStatusFilter(st.id)}
                                                    >
                                                        {st.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Button
                                onClick={handleRefresh}
                                disabled={isFetching}
                                variant="outline"
                                size="icon"
                            >
                                <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin text-neutral-400" : "text-neutral-400"} />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-accent hover:bg-accent/90 flex items-center gap-1.5">
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
                            onBlock={handleBlock}
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
                    onBlock={handleBlock}
                    initialIsEditing={initialIsEditing}
                />

                <BlockUserDialog 
                    isOpen={isBlockDialogOpen}
                    onClose={() => {
                        setIsBlockDialogOpen(false);
                        if (!isDetailsDialogOpen) {
                            setSelectedUser(null);
                        }
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
