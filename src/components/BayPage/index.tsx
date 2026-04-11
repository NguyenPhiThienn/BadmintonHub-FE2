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
import { useMe } from "@/hooks/useAuth";
import { useBays, useDeleteBay } from "@/hooks/useBays";
import { usePartners } from "@/hooks/usePartners";
import { usePermissions } from "@/hooks/usePermissions";
import { IBay } from "@/interface/bay";
import { IPartner } from "@/interface/partner";
import { mdiMagnify, mdiPlus, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BayTable } from "./BayTable";
import { CreateBayDialog } from "./CreateBayDialog";
import { UpdateBayDialog } from "./UpdateBayDialog";

export default function BayPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedBay, setSelectedBay] = useState<IBay | null>(null);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [partnerSearch, setPartnerSearch] = useState("");

    const { data: profileResponse } = useMe();
    const profile = profileResponse?.data;
    const isPartner = profile?.role === "partner";

    useEffect(() => {
        if (isPartner && profile?.id) {
            setSelectedPartnerId(profile.id);
        }
    }, [isPartner, profile?.id]);

    const { hasPermission } = usePermissions();
    const canAdd = hasPermission("bay-management:add") || true;
    const canUpdate = hasPermission("bay-management:update") || true;
    const canDelete = hasPermission("bay-management:delete") || true;

    const { data: partnersResponse } = usePartners({ limit: 1000 });
    const partners = partnersResponse?.data?.partners || [];

    const filteredPartners = partners.filter((p: any) =>
        p.partnerName?.toLowerCase().includes(partnerSearch.toLowerCase())
    );

    const {
        data: bayResponse,
        isLoading,
        isFetching,
        refetch,
    } = useBays({
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        partnerId: selectedPartnerId === "all" ? undefined : selectedPartnerId,
    });

    const handleRefresh = () => {
        setSearchQuery("");
        if (!isPartner) setSelectedPartnerId("all");
        setCurrentPage(1);
        refetch();
    };

    const { mutate: deleteMutation, isPending: isDeleting } = useDeleteBay();

    const handleAction = (bay: IBay) => {
        setSelectedBay(bay);
        setIsUpdateDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setSelectedBay(bayResponse?.data?.bays.find((b: IBay) => b._id === id) || null);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedBay) return;
        return new Promise((resolve, reject) => {
            deleteMutation(selectedBay._id, {
                onSuccess: () => {
                    setSelectedBay(null);
                    resolve(true);
                },
                onError: (error: any) => {
                    reject(error);
                }
            });
        });
    };

    const bays = bayResponse?.data?.bays || [];
    const totalItems = bayResponse?.data?.pagination?.total || 0;
    const totalPages = bayResponse?.data?.pagination?.totalPages || 1;

    return (
        <TooltipProvider>
            <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Quản lý ngăn lộ</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="relative w-full flex-1">
                            <Input
                                placeholder="Tìm kiếm ngăn lộ..."
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                onClear={() => setSearchQuery("")}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>
                        <div className="flex items-center gap-3">
                            {!isPartner && <Select
                                value={selectedPartnerId}
                                onValueChange={(value) => {
                                    setSelectedPartnerId(value);
                                    setCurrentPage(1);
                                }}
                                onOpenChange={(open) => !open && setPartnerSearch("")}
                                disabled={isPartner}
                            >
                                <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder="Lọc theo công ty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="sticky top-0 z-10 bg-darkCardV1 p-2 border-b border-darkBorderV1 mb-1">
                                        <div className="relative">
                                            <Icon path={mdiMagnify} size={0.8} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
                                            <Input
                                                placeholder="Nhập từ khóa tìm kiếm công ty..."
                                                value={partnerSearch}
                                                onChange={(e) => setPartnerSearch(e.target.value)}
                                                onClear={() => setPartnerSearch("")}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                autoFocus
                                                onBlur={(e) => e.target.focus()}
                                                className="pl-8 py-2 w-full bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    <SelectItem value="all">Tất cả công ty</SelectItem>
                                    {filteredPartners.length > 0 ? (
                                        filteredPartners.map((partner: IPartner) => (
                                            <SelectItem key={partner._id} value={partner._id}>
                                                {partner.partnerName}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        partnerSearch !== "" && (
                                            <div className="py-4 text-center text-sm text-neutral-400 italic">
                                                Không tìm thấy kết quả
                                            </div>
                                        )
                                    )}
                                </SelectContent>
                            </Select>}

                            <Button
                                onClick={handleRefresh}
                                variant="ghost"
                            >
                                <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                Reset bộ lọc
                            </Button>
                            {canAdd && (
                                <Button
                                    onClick={() => {
                                        setSelectedBay(null);
                                        setIsCreateDialogOpen(true);
                                    }}
                                >
                                    <Icon path={mdiPlus} size={0.8} />
                                    Thêm ngăn lộ
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <BayTable
                            bays={bays}
                            isLoading={isLoading || isFetching}
                            onAction={handleAction}
                            onDelete={handleDelete}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            isPartner={isPartner}
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
                            onPageChange={(page: number) => setCurrentPage(page)}
                        />
                    </div>
                )}

                <DeleteDialog
                    isOpen={isDeleteDialogOpen}
                    isDeleting={isDeleting}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title={`Xóa ngăn lộ: ${selectedBay?.name || ""}`}
                    description="Bạn có chắc chắn muốn xóa ngăn lộ này không?"
                    confirmText="Xác nhận xóa"
                    successMessage="Xóa ngăn lộ thành công"
                    errorMessage="Xóa ngăn lộ thất bại"
                />

                <CreateBayDialog
                    isOpen={isCreateDialogOpen}
                    onClose={() => setIsCreateDialogOpen(false)}
                    partnerId={isPartner ? profile?.id : undefined}
                />

                <UpdateBayDialog
                    isOpen={isUpdateDialogOpen}
                    onClose={() => {
                        setIsUpdateDialogOpen(false);
                        setSelectedBay(null);
                    }}
                    bay={selectedBay}
                />
            </div>
        </TooltipProvider>
    );
}
