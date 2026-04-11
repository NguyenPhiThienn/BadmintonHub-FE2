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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useResponsive } from "@/hooks/use-mobile";
import { useDeleteEquipment, useEquipment, useEquipmentMetadata } from "@/hooks/useEquipment";
import { usePermissions } from "@/hooks/usePermissions";
import { IEquipment } from "@/interface/equipment";
import { mdiMagnify, mdiPackageVariantClosedPlus, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { EquipmentDetailsDialog } from "./EquipmentDetailsDialog";
import { EquipmentEditDialog } from "./EquipmentEditDialog";
import { EquipmentTable } from "./EquipmentTable";

export default function EquipmentPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("info");
    const [selectedItem, setSelectedItem] = useState<IEquipment | null>(null);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [manufacturerFilter, setManufacturerFilter] = useState<string>("all");

    const { isMobile, isTablet } = useResponsive();
    const { hasPermission } = usePermissions();

    const canAdd = hasPermission("equipment-list:add");
    const canUpdate = hasPermission("equipment-list:update");
    const canDelete = hasPermission("equipment-list:delete");

    const { data: metadataResponse } = useEquipmentMetadata();
    const manufacturers = metadataResponse?.data?.manufacturers || [];
    const statuses = metadataResponse?.data?.statuses || [];

    const {
        data: equipmentResponse,
        isLoading,
        isFetching,
        refetch,
    } = useEquipment({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        manufacturer: manufacturerFilter !== "all" ? manufacturerFilter : undefined,
    });

    const handleRefresh = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setManufacturerFilter("all");
        setCurrentPage(1);
        refetch();
    };

    const { mutate: deleteEquipmentMutation, isPending: isDeleting } = useDeleteEquipment();

    const handleViewDetails = (item: IEquipment) => {
        setSelectedEquipmentId(item._id);
        setActiveTab("info");
        setIsDetailsDialogOpen(true);
    };

    const handleEdit = (item: IEquipment) => {
        setSelectedItem(item);
        setIsEditDialogOpen(true);
    };

    const handleEditFromDetails = () => {
        setIsDetailsDialogOpen(false);
        if (selectedEquipmentId) {
            const item = equipment.find((e: IEquipment) => e._id === selectedEquipmentId);
            if (item) {
                setSelectedItem(item);
                setIsEditDialogOpen(true);
            }
        }
    };

    const handleDelete = (id: string) => {
        setSelectedItem(equipmentResponse?.data?.equipment.find((e: IEquipment) => e._id === id) || null);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        return new Promise((resolve, reject) => {
            deleteEquipmentMutation(selectedItem._id, {
                onSuccess: () => {
                    setSelectedItem(null);
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

    const handleViewHistory = (equipmentId: string) => {
        setSelectedEquipmentId(equipmentId);
        setActiveTab("history");
        setIsDetailsDialogOpen(true);
    };

    const equipment = equipmentResponse?.data?.equipment || [];
    const totalItems = equipmentResponse?.data?.pagination?.total || 0;
    const totalPages = equipmentResponse?.data?.pagination?.totalPages || 1;

    return (
        <TooltipProvider>
            <div className="space-y-3 md:space-y-4 bg-darkCardV1  p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Quản lý dụng cụ</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col gap-3 md:gap-4">
                        {isMobile ? (
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleRefresh}
                                        disabled={isFetching}
                                        className="bg-darkBorderV1 hover:bg-darkBorderV1/70 font-medium"
                                    >
                                        <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                    </Button>
                                    <div className="relative w-full">
                                        <Input
                                            placeholder="Tìm kiếm dụng cụ..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8 w-full text-sm"
                                        />
                                        <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Hãng sản xuất" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả Hãng sản xuất</SelectItem>
                                            {manufacturers.map((m: string) => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Tình trạng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả tình trạng</SelectItem>
                                            {statuses.map((s: string) => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {canAdd && (
                                    <Button
                                        className="flex-1"
                                        onClick={() => {
                                            setSelectedItem(null);
                                            setIsEditDialogOpen(true);
                                        }}
                                    >
                                        <Icon path={mdiPackageVariantClosedPlus} size={0.8} className="flex-shrink-0" />
                                        Thêm dụng cụ
                                    </Button>
                                )}
                            </div>
                        ) : isTablet ? (
                            <div className="flex flex-col gap-3 mb-2">
                                <div className="relative w-full">
                                     <Input
                                         placeholder="Tìm kiếm dụng cụ (tên, mã, Hãng sản xuất)..."
                                         value={searchQuery}
                                         onChange={(e) => setSearchQuery(e.target.value)}
                                         onClear={() => setSearchQuery("")}
                                         className="pl-8 py-2 w-full"
                                     />
                                    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                </div>
                                <div className="flex items-center justify-between gap-3 md:gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Hãng sản xuất" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tất cả Hãng sản xuất</SelectItem>
                                                {manufacturers.map((m: string) => (
                                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Tình trạng" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tất cả tình trạng</SelectItem>
                                                {statuses.map((s: string) => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={handleRefresh}
                                            disabled={isFetching}
                                        >
                                            <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                        </Button>
                                        {canAdd && (
                                            <Button
                                                onClick={() => {
                                                    setSelectedItem(null);
                                                    setIsEditDialogOpen(true);
                                                }}
                                            >
                                                <Icon path={mdiPackageVariantClosedPlus} size={0.8} className="flex-shrink-0" />
                                                Thêm dụng cụ
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                <div className="relative w-full flex-1">
                                    <Input
                                        placeholder="Tìm kiếm dụng cụ (tên, mã, Hãng sản xuất)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onClear={() => setSearchQuery("")}
                                        className="pl-8 py-2 w-full"
                                    />
                                    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Hãng sản xuất" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả Hãng sản xuất</SelectItem>
                                            {manufacturers.map((m: string) => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Tình trạng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả tình trạng</SelectItem>
                                            {statuses.map((s: string) => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
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
                                    {canAdd && (
                                        <Button
                                            onClick={() => {
                                                setSelectedItem(null);
                                                setIsEditDialogOpen(true);
                                            }}
                                        >
                                            <Icon path={mdiPackageVariantClosedPlus} size={0.8} className="flex-shrink-0" />
                                            Thêm dụng cụ
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent mt-1 md:mt-0">
                            <EquipmentTable
                                equipment={equipment}
                                isSearching={!!searchQuery}
                                isLoading={isLoading || isFetching}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onViewHistory={handleViewHistory}
                                onViewDetails={handleViewDetails}
                                currentPage={currentPage}
                                pageSize={pageSize}
                                canUpdate={canUpdate}
                                canDelete={canDelete}
                            />
                        </Card>

                        {totalItems > pageSize && (
                            <div className="flex items-center justify-center mt-2">
                                <Pagination
                                    page={currentPage}
                                    pageSize={pageSize}
                                    total={totalItems}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                </motion.div>

                <DeleteDialog
                    isOpen={isDeleteDialogOpen}
                    isDeleting={isDeleting}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title={`Xóa dụng cụ: ${selectedItem?.equipmentName || ""}`}
                    description="Bạn có chắc chắn muốn xóa dụng cụ này không? Hành động này không thể hoàn tác."
                    confirmText="Xóa dụng cụ"
                    successMessage="Xóa dụng cụ thành công"
                    errorMessage="Xóa dụng cụ thất bại"
                />

                <EquipmentDetailsDialog
                    isOpen={isDetailsDialogOpen}
                    onClose={() => {
                        setIsDetailsDialogOpen(false);
                        setSelectedEquipmentId(null);
                    }}
                    equipmentId={selectedEquipmentId}
                    onEdit={handleEditFromDetails}
                    defaultTab={activeTab}
                />

                <EquipmentEditDialog
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setSelectedItem(null);
                    }}
                    item={selectedItem}
                />
            </div >
        </TooltipProvider >
    );
}
