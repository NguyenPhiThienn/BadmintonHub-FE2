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
import { useAdminVenues, useDeleteVenue, useUpdateVenueStatus } from "@/hooks/useVenue";
import { IVenue } from "@/interface/venue";
import { mdiChevronRight, mdiMagnify, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-toastify";
import { LegalDocumentPreview } from "./LegalDocumentPreview";
import { VenueTable } from "./VenueTable";
import { VenueDetailsDialog } from "./VenueDetailsDialog";

export default function VenuePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [locationFilter, setLocationFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [previewVenue, setPreviewVenue] = useState<IVenue | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState<IVenue | null>(null);

    const { isMobile } = useResponsive();

    const {
        data: pendingRes,
        isLoading,
        isFetching,
        refetch
    } = useAdminVenues({
        page: currentPage,
        limit: pageSize
    });

    const { mutate: updateStatus } = useUpdateVenueStatus();
    const { mutate: deleteVenueMutation, isPending: isDeleting } = useDeleteVenue();

    const venues = pendingRes?.data?.venues || [];
    const pagination = pendingRes?.data?.pagination;

    const handleApprove = (venue: IVenue) => {
        updateStatus({
            id: venue._id,
            data: { status: 'ACTIVE', reason: "Hồ sơ hợp lệ và đầy đủ." }
        }, {
            onSuccess: () => toast.success(`Đã phê duyệt sân: ${venue.name}`)
        });
    };

    const handleReject = (venue: IVenue) => {
        const reason = prompt("Nhập lý do từ chối phê duyệt:");
        if (reason === null) return; // Cancelled

        updateStatus({
            id: venue._id,
            data: { status: 'REJECTED', reason: reason || "Hồ sơ không hợp lệ." }
        }, {
            onSuccess: () => toast.warning(`Đã từ chối sân: ${venue.name}`)
        });
    };

    const handleViewLegal = (venue: IVenue) => {
        setPreviewVenue(venue);
        setIsPreviewOpen(true);
    };

    const handleAction = (venue: IVenue, mode: "view" | "edit") => {
        setSelectedVenue(venue);
        if (mode === "view") {
            setIsDetailsDialogOpen(true);
        } else {
            toast.info(`Tính năng cập nhật sân ${venue.name} đang được phát triển.`);
        }
    };

    const handleDelete = (id: string) => {
        const venue = venues.find((v: IVenue) => v._id === id);
        if (venue) {
            setSelectedVenue(venue);
            setIsDeleteDialogOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!selectedVenue) return;
        return new Promise((resolve, reject) => {
            deleteVenueMutation(selectedVenue._id, {
                onSuccess: () => {
                    setSelectedVenue(null);
                    toast.success(`Đã xóa cơ sở sân: ${selectedVenue.name}`);
                    resolve(true);
                },
                onError: (error) => {
                    reject(error);
                }
            });
        });
    };

    return (
        <TooltipProvider>
            <div className="space-y-4 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-neutral-500">Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <Icon path={mdiChevronRight} size={0.6} />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Quản lý cơ sở sân</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="relative w-full md:flex-1">
                            <Input
                                placeholder="Tìm theo tên sân hoặc chủ sở hữu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Sắp xếp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Mới nhất trước</SelectItem>
                                    <SelectItem value="asc">Cũ nhất trước</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={locationFilter} onValueChange={setLocationFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Khu vực" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toàn quốc</SelectItem>
                                    <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                                    <SelectItem value="hn">Hà Nội</SelectItem>
                                    <SelectItem value="dn">Đà Nẵng</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={() => refetch()}
                                disabled={isFetching}
                                title="Làm mới"
                                variant="ghost"
                            >
                                <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                {!isMobile && "Làm mới"}
                            </Button>
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <VenueTable
                            venues={venues}
                            isLoading={isLoading || isFetching}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onAction={handleAction}
                            onDelete={handleDelete}
                            onViewLegal={handleViewLegal}
                            currentPage={currentPage}
                            pageSize={pageSize}
                        />
                    </Card>
                </motion.div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center pt-4">
                        <Pagination
                            page={currentPage}
                            pageSize={pageSize}
                            total={pagination.total}
                            totalPages={pagination.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}

                <LegalDocumentPreview
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    venue={previewVenue}
                />

                <VenueDetailsDialog
                    isOpen={isDetailsDialogOpen}
                    onClose={() => {
                        setIsDetailsDialogOpen(false);
                        setSelectedVenue(null);
                    }}
                    venue={selectedVenue}
                />

                <DeleteDialog
                    isOpen={isDeleteDialogOpen}
                    isDeleting={isDeleting}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title={`Xóa cơ sở sân: ${selectedVenue?.name || ""}`}
                    description="Bạn có chắc chắn muốn xóa cơ sở sân này không? Hành động này không thể hoàn tác."
                    confirmText="Xóa cơ sở"
                    errorMessage="Xóa cơ sở sân thất bại"
                />
            </div>
        </TooltipProvider>
    );
}
