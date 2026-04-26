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
import { usePartners } from "@/hooks/usePartners";
import { usePermissions } from "@/hooks/usePermissions";
import { useDeleteVoltageLevel, useVoltageLevels } from "@/hooks/useVoltageLevels";
import { IPartner } from "@/interface/partner";
import { IVoltageLevel } from "@/interface/voltageLevel";
import { mdiMagnify, mdiPlus, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CreateVoltageLevelDialog } from "./CreateVoltageLevelDialog";
import { UpdateVoltageLevelDialog } from "./UpdateVoltageLevelDialog";
import { VoltageLevelTable } from "./VoltageLevelTable";

export default function VoltageLevelPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedVoltageLevel, setSelectedVoltageLevel] = useState<IVoltageLevel | null>(null);
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
    const canAdd = hasPermission("voltage-level-management:add") || true;
    const canUpdate = hasPermission("voltage-level-management:update") || true;
    const canDelete = hasPermission("voltage-level-management:delete") || true;

    const { data: partnersResponse } = usePartners({ limit: 1000 });
    const partners = partnersResponse?.data?.partners || [];

    const filteredPartners = partners.filter((p: any) =>
        p.partnerName?.toLowerCase().includes(partnerSearch.toLowerCase())
    );

    const {
        data: voltageLevelResponse,
        isLoading,
        isFetching,
        refetch,
    } = useVoltageLevels({
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        partnerId: selectedPartnerId === "all" ? undefined : selectedPartnerId,
    });

    const handleRefresh = () => {
        setSearchQuery("");
        setSelectedPartnerId("all");
        setCurrentPage(1);
        refetch();
    };

    const { mutate: deleteMutation, isPending: isDeleting } = useDeleteVoltageLevel();

    const handleAction = (voltageLevel: IVoltageLevel) => {
        setSelectedVoltageLevel(voltageLevel);
        setIsUpdateDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setSelectedVoltageLevel(voltageLevelResponse?.data?.voltageLevels.find((v: IVoltageLevel) => v._id === id) || null);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedVoltageLevel) return;
        return new Promise((resolve, reject) => {
            deleteMutation(selectedVoltageLevel._id, {
                onSuccess: () => {
                    setSelectedVoltageLevel(null);
                    resolve(true);
                },
                onError: (error) => {
                    reject(error);
                }
            });
        });
    };

    const voltageLevels = voltageLevelResponse?.data?.voltageLevels || [];
    const totalItems = voltageLevelResponse?.data?.pagination?.total || 0;
    const totalPages = voltageLevelResponse?.data?.pagination?.totalPages || 1;

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
                            <BreadcrumbPage>Quản lý cấp điện áp</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Filter & Search section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="relative w-full flex-1">
                            <Input
                                placeholder="Tìm kiếm cấp điện áp..."
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
                                                autoFocus
                                                onBlur={(e) => e.target.focus()}
                                                onKeyDown={(e) => e.stopPropagation()}
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
                                        setSelectedVoltageLevel(null);
                                        setIsCreateDialogOpen(true);
                                    }}
                                >
                                    <Icon path={mdiPlus} size={0.8} />
                                    Thêm cấp điện áp
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <VoltageLevelTable
                            voltageLevels={voltageLevels}
                            isLoading={isLoading || isFetching}
                            onAction={handleAction}
                            onDelete={handleDelete}
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
                    title={`Xóa cấp điện áp: ${selectedVoltageLevel?.name || ""}`}
                    description="Bạn có chắc chắn muốn xóa cấp điện áp này không?"
                    confirmText="Xác nhận xóa"
                    successMessage="Xóa cấp điện áp thành công"
                    errorMessage="Xóa cấp điện áp thất bại"
                />

                <CreateVoltageLevelDialog
                    isOpen={isCreateDialogOpen}
                    onClose={() => setIsCreateDialogOpen(false)}
                    partnerId={isPartner ? profile?.id : undefined}
                />

                <UpdateVoltageLevelDialog
                    isOpen={isUpdateDialogOpen}
                    onClose={() => {
                        setIsUpdateDialogOpen(false);
                        setSelectedVoltageLevel(null);
                    }}
                    voltageLevel={selectedVoltageLevel}
                />
            </div>
        </TooltipProvider>
    );
}
