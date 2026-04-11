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
import { useMe } from "@/hooks/useAuth";
import { useDeleteJobPlan, useJobPlans } from "@/hooks/useJobPlans";
import { usePartners } from "@/hooks/usePartners";
import { IJobPlan } from "@/interface/jobPlan";
import { mdiMagnify, mdiPlus, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JobPlanDetailsDialog } from "./JobPlanDetailsDialog";
import { JobPlanDialog } from "./JobPlanDialog";
import { JobPlanTable } from "./JobPlanTable";

export default function WorkExchangePage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<IJobPlan | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Filters
    const [partnerFilter, setPartnerFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: profileResponse } = useMe();
    const profile = profileResponse?.data;
    const isPartner = profile?.role === "partner";
    const currentPartnerId = profile?.id;

    // Tự động set partnerFilter nếu là partner
    useEffect(() => {
        if (isPartner && currentPartnerId) {
            setPartnerFilter(currentPartnerId);
        }
    }, [isPartner, currentPartnerId]);

    // Khi là partner, cố định partnerFilter là ID của profile
    const effectivePartnerId = isPartner ? currentPartnerId : (partnerFilter !== "all" ? partnerFilter : undefined);

    const [partnerSearch, setPartnerSearch] = useState("");

    // Fetch lists for filters
    const { data: partnersResponse } = usePartners({ limit: 1000 });
    const partners = Array.isArray(partnersResponse?.data?.partners)
        ? partnersResponse.data.partners
        : (Array.isArray(partnersResponse?.data) ? partnersResponse.data : []);

    const filteredPartners = partners.filter((p: any) =>
        p.partnerName?.toLowerCase().includes(partnerSearch.toLowerCase())
    );

    const {
        data: plansResponse,
        isLoading,
        isFetching,
        refetch,
    } = useJobPlans({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        partnerId: effectivePartnerId,
        status: statusFilter !== "all" ? statusFilter : undefined,
    });

    const handleRefresh = () => {
        setSearchQuery("");
        setPartnerFilter("all");
        setStatusFilter("all");
        setCurrentPage(1);
        refetch();
    };

    const { mutate: deletePlanMutation, isPending: isDeleting } = useDeleteJobPlan();

    const handleViewDetails = (item: IJobPlan) => {
        setSelectedPlanId(item._id);
        setIsDetailsDialogOpen(true);
    };

    const handleEnterWorkspace = (item: IJobPlan) => {
        router.push(`/work-exchange/workspace/${item._id}`);
    };

    const handleEdit = (item: IJobPlan) => {
        setSelectedItem(item);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (item: IJobPlan) => {
        setSelectedItem(item);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        return new Promise((resolve, reject) => {
            deletePlanMutation(selectedItem._id, {
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

    const plans = Array.isArray(plansResponse?.data) ? plansResponse.data : [];
    const pagination = plansResponse?.pagination;
    const totalItems = pagination?.total || 0;
    const totalPages = pagination?.totalPages || 1;

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
                            <BreadcrumbPage>Trao đổi công việc</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col gap-3 md:gap-4">
                        {/* Filter Section */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="relative flex-1 min-w-[280px]">
                                    <Input
                                        placeholder="Tìm theo tên phương án hoặc nội dung..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onClear={() => setSearchQuery("")}
                                        className="pl-8 py-2 w-full"
                                    />
                                    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                </div>
                                {!isPartner && (
                                    <Select
                                        value={partnerFilter}
                                        onValueChange={setPartnerFilter}
                                        onOpenChange={(open) => !open && setPartnerSearch("")}
                                    >
                                        <SelectTrigger className="w-[250px]">
                                            <SelectValue placeholder="Công ty" />
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
                                                filteredPartners.map((p: any) => (
                                                    <SelectItem key={p._id} value={p._id}>{p.partnerName}</SelectItem>
                                                ))
                                            ) : (
                                                partnerSearch && <div className="py-4 text-center text-sm text-neutral-400 italic">Không tìm thấy kết quả</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Mọi trạng thái</SelectItem>
                                        <SelectItem value="Đang trao đổi">Đang trao đổi</SelectItem>
                                        <SelectItem value="Đã duyệt">Đã duyệt</SelectItem>
                                        <SelectItem value="Từ chối">Từ chối</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleRefresh}
                                    disabled={isFetching}
                                    variant="ghost"
                                >
                                    <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                    Reset bộ lọc
                                </Button>
                                {
                                    !isPartner && <Button
                                        onClick={() => {
                                            setSelectedItem(null);
                                            setIsEditDialogOpen(true);
                                        }}
                                    >
                                        <Icon path={mdiPlus} size={0.8} />
                                        Thêm phương án
                                    </Button>
                                }

                            </div>


                        </div>

                        {/* Table Section */}
                        <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                            <JobPlanTable
                                plans={plans}
                                isLoading={isLoading || isFetching}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onViewDetails={handleViewDetails}
                                onEnterWorkspace={handleEnterWorkspace}
                                currentPage={currentPage}
                                pageSize={pageSize}
                                isPartner={isPartner}
                            />
                        </Card>

                        {totalItems > pageSize && (
                            <div className="flex items-center justify-center pt-2">
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
                    title={`Xóa phương án công việc?`}
                    description="Xác nhận xóa phương án này? Mọi dữ liệu trao đổi liên quan sẽ bị mất và không thể khôi phục."
                    confirmText="Xóa dữ liệu"
                    successMessage="Xóa phương án thành công"
                    errorMessage="Xóa phương án thất bại"
                />

                <JobPlanDetailsDialog
                    isOpen={isDetailsDialogOpen}
                    onClose={() => {
                        setIsDetailsDialogOpen(false);
                        setSelectedPlanId(null);
                    }}
                    planId={selectedPlanId}
                />

                <JobPlanDialog
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setSelectedItem(null);
                    }}
                    plan={selectedItem}
                />
            </div>
        </TooltipProvider>
    );
}
