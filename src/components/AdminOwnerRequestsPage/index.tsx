"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useResponsive } from "@/hooks/use-mobile";
import {
    useAllOwnerRequests,
    useReviewOwnerRequest,
    useSendOwnerStatusMail
} from "@/hooks/useOwnerRequest";
import {
    mdiClose,
    mdiMagnify,
    mdiRefresh
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-toastify";

// Split sub-components
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { OwnerRequestDetailsDialog } from "./OwnerRequestDetailsDialog";
import { OwnerRequestsTable } from "./OwnerRequestsTable";

export default function AdminOwnerRequestsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>("PENDING");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Rejection inputs
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isReviewing, setIsReviewing] = useState(false);

    // Image preview modal state
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { isMobile } = useResponsive();

    // Query requests
    const {
        data: requestsResponse,
        isLoading,
        isFetching,
        refetch
    } = useAllOwnerRequests({
        page: currentPage,
        limit: pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined
    });

    // Mutation hooks
    const reviewRequestMutation = useReviewOwnerRequest();
    const sendStatusMailMutation = useSendOwnerStatusMail();

    const handleRefresh = () => {
        setSearchQuery("");
        setStatusFilter("PENDING");
        setCurrentPage(1);
        refetch();
    };

    const handleViewDetails = (request: any) => {
        setSelectedRequest(request);
        setRejectReason("");
        setShowRejectForm(false);
        setIsDetailsOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        setIsReviewing(true);
        const toastId = toast.loading("Đang duyệt hồ sơ và nâng cấp tài khoản...");
        try {
            // 1. Update status to APPROVED in DB and promote role
            const res = await reviewRequestMutation.mutateAsync({
                id: selectedRequest._id,
                data: { status: "APPROVED" }
            });

            if (res.statusCode === 200) {
                toast.update(toastId, {
                    render: "Duyệt hồ sơ đăng ký thành công!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });

                // 2. Trigger mail notification in Frontend background
                try {
                    await sendStatusMailMutation.mutateAsync({
                        email: selectedRequest.userId?.email,
                        fullName: selectedRequest.userId?.fullName,
                        status: "APPROVED"
                    });
                } catch (mailError) {
                    console.error("Failed to send approval email:", mailError);
                }

                setIsDetailsOpen(false);
                setSelectedRequest(null);
            } else {
                toast.update(toastId, {
                    render: res.message || "Duyệt hồ sơ thất bại",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (error: any) {
            toast.update(toastId, {
                render: error.message || "Có lỗi xảy ra",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setIsReviewing(false);
        }
    };

    const handleRejectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectReason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
        }

        setIsReviewing(true);
        const toastId = toast.loading("Đang từ chối hồ sơ và gửi email thông báo...");
        try {
            // 1. Update status to REJECTED in DB
            const res = await reviewRequestMutation.mutateAsync({
                id: selectedRequest._id,
                data: {
                    status: "REJECTED",
                    rejectReason
                }
            });

            if (res.statusCode === 200) {
                toast.update(toastId, {
                    render: "Từ chối hồ sơ thành công!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });

                // 2. Trigger mail notification in Frontend background
                try {
                    await sendStatusMailMutation.mutateAsync({
                        email: selectedRequest.userId?.email,
                        fullName: selectedRequest.userId?.fullName,
                        status: "REJECTED",
                        rejectReason
                    });
                } catch (mailError) {
                    console.error("Failed to send rejection email:", mailError);
                }

                setIsDetailsOpen(false);
                setSelectedRequest(null);
                setShowRejectForm(false);
                setRejectReason("");
            } else {
                toast.update(toastId, {
                    render: res.message || "Xử lý từ chối thất bại",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (error: any) {
            toast.update(toastId, {
                render: error.message || "Có lỗi xảy ra",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setIsReviewing(false);
        }
    };

    const requests = requestsResponse?.data?.requests || [];
    const totalItems = requestsResponse?.data?.pagination?.total || requests.length || 0;
    const totalPages = requestsResponse?.data?.pagination?.totalPages || Math.ceil(totalItems / pageSize) || 1;

    return (
        <div className="space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Duyệt đăng ký chủ sân</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
            >
                {/* Search/Filters bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative w-full flex-1">
                        <Input
                            placeholder="Tìm kiếm theo tên, email, sđt, địa chỉ..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-9 pr-9 py-2 w-full"
                        />
                        <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setCurrentPage(1);
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                            >
                                <Icon path={mdiClose} size={0.6} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Select
                            value={statusFilter}
                            onValueChange={(val) => {
                                setStatusFilter(val);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Trạng thái hồ sơ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="PENDING">Chờ xét duyệt</SelectItem>
                                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                                <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleRefresh}
                            disabled={isFetching}
                            variant="ghost"
                        >
                            <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin text-accent" : ""} />
                            {!isMobile && "Làm mới"}
                        </Button>
                    </div>
                </div>

                {/* Owner Requests Table */}
                <OwnerRequestsTable
                    requests={requests}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onViewDetails={handleViewDetails}
                />

                {/* Pagination */}
                {totalItems > pageSize && (
                    <div className="flex items-center justify-center mt-4">
                        <Pagination
                            page={currentPage}
                            pageSize={pageSize}
                            total={totalItems}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </motion.div>

            {/* Request Details Dialog */}
            <OwnerRequestDetailsDialog
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                selectedRequest={selectedRequest}
                isReviewing={isReviewing}
                showRejectForm={showRejectForm}
                setShowRejectForm={setShowRejectForm}
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
                handleApprove={handleApprove}
                handleRejectSubmit={handleRejectSubmit}
                onPreviewImage={setPreviewImage}
            />

            {/* Full-size Image Preview Overlay */}
            <ImagePreviewDialog
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                src={previewImage}
            />
        </div>
    );
}
