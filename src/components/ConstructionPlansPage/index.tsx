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
import { useMe } from "@/hooks/useAuth";
import {
    useConstructionPlans,
    useDeletePlan,
} from "@/hooks/usePartners";
import { usePermissions } from "@/hooks/usePermissions";
import { IConstructionPlan } from "@/interface/partner";
import { mdiMagnify, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { ConstructionPlanDetailsDialog } from "./ConstructionPlanDetailsDialog";
import { ConstructionPlansTable } from "./ConstructionPlansTable";
import { CreateConstructionPlanDialog } from "./CreateConstructionPlanDialog";

export default function ConstructionPlansPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<IConstructionPlan | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const { data: profileResponse } = useMe();
    const profile = profileResponse?.data;
    const isPartner = profile?.role === "partner";

    const { hasPermission } = usePermissions();
    const canAdd = !isPartner && hasPermission("construction-plans:add");
    const canUpdate = !isPartner && hasPermission("construction-plans:update");
    const canDelete = !isPartner && hasPermission("construction-plans:delete");

    const { data: plansResponse, isLoading, isFetching } = useConstructionPlans({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        partnerId: isPartner ? profile?.id : undefined,
    });
    const { mutate: deletePlanMutation, isPending: isDeleting } = useDeletePlan();

    const plans = plansResponse?.data?.plans || plansResponse?.data || [];
    const planList = Array.isArray(plans) ? plans : [];
    const totalItems = plansResponse?.data?.pagination?.total || planList.length;
    const totalPages = plansResponse?.data?.pagination?.totalPages || 1;

    const handleViewDetails = (plan: IConstructionPlan) => {
        setSelectedPlan(plan);
        setIsEditing(false);
        setIsDetailsDialogOpen(true);
    };

    const handleEditDetails = (plan: IConstructionPlan) => {
        if (isPartner) return;
        setSelectedPlan(plan);
        setIsEditing(true);
        setIsDetailsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (isPartner) return;
        setSelectedPlan(planList.find((p: IConstructionPlan) => p._id === id) || null);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedPlan || isPartner) return;
        return new Promise((resolve, reject) => {
            deletePlanMutation(selectedPlan._id, {
                onSuccess: () => {
                    setSelectedPlan(null);
                    resolve(true);
                },
                onError: reject,
            });
        });
    };

    return (
        <div className="space-y-3 md:space-y-4 bg-darkCardV1  p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Phương án thi công</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="relative w-full flex-1 min-w-[300px]">
                            <Input
                                placeholder="Tìm theo công ty, mô tả..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClear={() => setSearchQuery("")}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>
                        <div className="flex items-center gap-3">
                            {canAdd && (
                                <Button
                                    onClick={() => {
                                        setSelectedPlan(null);
                                        setIsCreateDialogOpen(true);
                                    }}
                                >
                                    <Icon path={mdiPlus} size={0.8} className="flex-shrink-0" />
                                    Thêm phương án
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <ConstructionPlansTable
                            plans={planList}
                            isLoading={isLoading || isFetching}
                            onView={handleViewDetails}
                            onEdit={handleEditDetails}
                            onDelete={handleDelete}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            isPartner={isPartner}
                        />
                    </Card>

                    {totalItems > pageSize && (
                        <div className="flex justify-center mt-4">
                            <Pagination
                                page={currentPage}
                                pageSize={pageSize}
                                total={totalItems}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
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
                title={`Xóa phương án: ${selectedPlan?.description || ""}`}
                description="Bạn có chắc chắn muốn xóa phương án thi công này? Thao tác này không thể hoàn tác."
                confirmText="Xóa phương án"
                successMessage="Xóa phương án thành công"
                errorMessage="Xóa phương án thất bại"
            />

            <CreateConstructionPlanDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
            />

            <ConstructionPlanDetailsDialog
                isOpen={isDetailsDialogOpen}
                onClose={() => {
                    setIsDetailsDialogOpen(false);
                    setSelectedPlan(null);
                    setIsEditing(false);
                }}
                plan={selectedPlan}
                defaultIsEditing={isEditing}
                isPartner={isPartner}
            />
        </div>
    );
}
