"use client";

import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useResponsive } from "@/hooks/use-mobile";
import {
    useAllOwnerRequests,
    useReviewOwnerRequest,
    useSendOwnerStatusMail
} from "@/hooks/useOwnerRequest";
import {
    mdiAlertCircleOutline,
    mdiCheckBold,
    mdiClose,
    mdiCloseOctagonOutline,
    mdiEyeOutline,
    mdiFaceManProfile,
    mdiFileDocumentOutline,
    mdiPlaylistRemove,
    mdiRefresh,
    mdiStorefrontOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

export default function AdminOwnerRequestsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>("PENDING");
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
        status: statusFilter !== "all" ? statusFilter : undefined
    });

    // Mutation hooks
    const reviewRequestMutation = useReviewOwnerRequest();
    const sendStatusMailMutation = useSendOwnerStatusMail();

    const handleRefresh = () => {
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
        const confirmApprove = window.confirm(
            `Bạn có chắc chắn muốn duyệt đăng ký chủ sân cho người dùng: ${selectedRequest.userId?.fullName}?`
        );
        if (!confirmApprove) return;

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
                    <div className="flex items-center gap-2">
                        <Icon path={mdiStorefrontOutline} size={1} className="text-accent" />
                        <h2 className="text-xl font-bold text-white">Danh sách hồ sơ đăng ký chủ sân</h2>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Select
                            value={statusFilter}
                            onValueChange={(val) => {
                                setStatusFilter(val);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[180px] bg-darkBackgroundV1/50 border-darkBorderV1 text-white">
                                <SelectValue placeholder="Trạng thái hồ sơ" />
                            </SelectTrigger>
                            <SelectContent className="bg-darkCardV1 border-darkBorderV1 text-white">
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
                            className="text-neutral-400 hover:text-white"
                        >
                            <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin text-accent" : ""} />
                            {!isMobile && "Làm mới"}
                        </Button>
                    </div>
                </div>

                {/* Requests Table */}
                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                    <div className="w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-darkBorderV1">
                                    <TableHead className="w-[50px] text-center text-neutral-400 font-bold">STT</TableHead>
                                    <TableHead className="w-[70px] text-center text-neutral-400 font-bold">Ảnh</TableHead>
                                    <TableHead className="text-neutral-400 font-bold">Họ và Tên</TableHead>
                                    <TableHead className="text-neutral-400 font-bold">Email</TableHead>
                                    <TableHead className="text-neutral-400 font-bold">Số điện thoại</TableHead>
                                    <TableHead className="text-neutral-400 font-bold">CCCD</TableHead>
                                    <TableHead className="text-neutral-400 font-bold">Địa chỉ sân</TableHead>
                                    <TableHead className="text-center text-neutral-400 font-bold">Trạng thái</TableHead>
                                    <TableHead className="text-right text-neutral-400 font-bold">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading || isFetching ? (
                                    [...Array(pageSize)].map((_, i) => (
                                        <TableRow key={i} className="border-b border-darkBorderV1/40">
                                            <TableCell><Skeleton className="h-5 w-8 mx-auto bg-darkBorderV1/50" /></TableCell>
                                            <TableCell><Skeleton className="h-9 w-9 rounded-full mx-auto bg-darkBorderV1/50" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-28 bg-darkBorderV1/50" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-36 bg-darkBorderV1/50" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24 bg-darkBorderV1/50" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24 bg-darkBorderV1/50" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-40 bg-darkBorderV1/50" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20 mx-auto bg-darkBorderV1/50" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto bg-darkBorderV1/50" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9}>
                                            <div className="text-center text-neutral-400 text-sm py-8 italic flex items-center justify-center gap-2">
                                                <Icon path={mdiPlaylistRemove} size={1} />
                                                Không có đơn đăng ký chủ sân nào.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map((request: any, index: number) => {
                                        const rowNumber = (currentPage - 1) * pageSize + index + 1;
                                        const userObj = request.userId || {};
                                        const fullName = userObj.fullName || "Người dùng";
                                        const avatar = userObj.avatarUrl || userObj.avatar;
                                        const phone = userObj.phone || "-";
                                        const status = request.status;

                                        return (
                                            <TableRow
                                                key={request._id}
                                                className="cursor-pointer hover:bg-darkBorderV1/30 transition-colors border-b border-darkBorderV1/40"
                                                onClick={() => handleViewDetails(request)}
                                            >
                                                <TableCell className="text-center">{rowNumber}</TableCell>
                                                <TableCell>
                                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-darkBackgroundV1 border border-darkBorderV1 flex items-center justify-center mx-auto">
                                                        {avatar ? (
                                                            <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Icon path={mdiFaceManProfile} size={0.6} className="text-neutral-400" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-white">{fullName}</TableCell>
                                                <TableCell className="text-neutral-300">{userObj.email || "-"}</TableCell>
                                                <TableCell className="text-neutral-300">{phone}</TableCell>
                                                <TableCell className="font-mono text-neutral-300">{request.identityCard}</TableCell>
                                                <TableCell className="max-w-[200px] truncate text-neutral-300" title={request.courtAddress}>
                                                    {request.courtAddress}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={
                                                            status === "APPROVED"
                                                                ? "green"
                                                                : status === "REJECTED"
                                                                    ? "red"
                                                                    : "yellow"
                                                        }
                                                    >
                                                        {status === "APPROVED"
                                                            ? "Đã duyệt"
                                                            : status === "REJECTED"
                                                                ? "Đã từ chối"
                                                                : "Chờ xét duyệt"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleViewDetails(request)}
                                                        className="text-accent hover:text-accent/80 hover:bg-accent/10"
                                                    >
                                                        <Icon path={mdiEyeOutline} size={0.7} className="mr-1" />
                                                        Chi tiết
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

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

            {/* REQUEST DETAILS DIALOG */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent size="medium" className="bg-darkCardV1 border-darkBorderV1 text-white">
                    <DialogHeader className="bg-darkBackgroundV1 border-b border-darkBorderV1">
                        <DialogTitle className="text-white text-lg flex items-center gap-2">
                            <Icon path={mdiFileDocumentOutline} size={0.9} className="text-accent" />
                            Chi tiết hồ sơ đăng ký chủ sân
                        </DialogTitle>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* User Account info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-darkBackgroundV1/40 p-4 rounded-xl border border-darkBorderV1">
                                <div className="flex items-center gap-3 md:col-span-2">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-darkBorderV1 bg-darkCardV1 flex items-center justify-center">
                                        {selectedRequest.userId?.avatarUrl ? (
                                            <img src={selectedRequest.userId.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <Icon path={mdiFaceManProfile} size={0.8} className="text-neutral-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-base">{selectedRequest.userId?.fullName}</h4>
                                        <p className="text-xs text-neutral-400">{selectedRequest.userId?.email}</p>
                                    </div>
                                </div>
                                <div className="flex md:flex-col justify-between md:justify-center md:items-end gap-1 border-t md:border-t-0 md:border-l border-darkBorderV1 pt-3 md:pt-0 md:pl-4">
                                    <span className="text-xs text-neutral-400">Số điện thoại:</span>
                                    <span className="text-sm font-semibold text-white">{selectedRequest.userId?.phone || "-"}</span>
                                </div>
                            </div>

                            {/* Submitted Documents Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-neutral-400 block font-bold">Số Căn cước công dân (CCCD)</span>
                                    <p className="text-sm text-white font-mono bg-darkBackgroundV1/50 border border-darkBorderV1 p-3 rounded-lg">
                                        {selectedRequest.identityCard}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs text-neutral-400 block font-bold">Địa chỉ cơ sở đăng ký</span>
                                    <p className="text-sm text-white bg-darkBackgroundV1/50 border border-darkBorderV1 p-3 rounded-lg">
                                        {selectedRequest.courtAddress}
                                    </p>
                                </div>
                            </div>

                            {/* Real Court Images */}
                            <div className="space-y-2">
                                <span className="text-xs text-neutral-400 block font-bold">Hình ảnh sân cầu lông thực tế</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {selectedRequest.courtImages?.map((url: string, idx: number) => (
                                        <div
                                            key={idx}
                                            className="relative aspect-video rounded-lg overflow-hidden border border-darkBorderV1 bg-darkBackgroundV1/50 cursor-zoom-in hover:opacity-80 transition-opacity"
                                            onClick={() => setPreviewImage(url)}
                                        >
                                            <Image src={url} alt={`Court Image ${idx + 1}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Business License */}
                            <div className="space-y-2">
                                <span className="text-xs text-neutral-400 block font-bold">Giấy phép hoạt động kinh doanh</span>
                                <div
                                    className="relative aspect-video max-w-sm rounded-lg overflow-hidden border border-darkBorderV1 bg-darkBackgroundV1/50 cursor-zoom-in hover:opacity-80 transition-opacity"
                                    onClick={() => setPreviewImage(selectedRequest.businessLicense)}
                                >
                                    <Image src={selectedRequest.businessLicense} alt="Business License" fill className="object-cover" />
                                </div>
                            </div>

                            {/* Status and rejection reasons */}
                            {selectedRequest.status === "REJECTED" && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 flex gap-3">
                                    <Icon path={mdiAlertCircleOutline} size={0.9} className="flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-sm">Lý do từ chối hồ sơ</p>
                                        <p className="text-xs text-neutral-300 italic mt-1">"{selectedRequest.rejectReason}"</p>
                                    </div>
                                </div>
                            )}

                            {/* Rejection input form */}
                            {showRejectForm && (
                                <form onSubmit={handleRejectSubmit} className="space-y-3 bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                                    <div className="space-y-1">
                                        <label htmlFor="rejectReason" className="text-xs text-red-400 font-bold block">
                                            Nhập lý do từ chối <span className="text-red-500">*</span>
                                        </label>
                                        <Textarea
                                            id="rejectReason"
                                            placeholder="Ví dụ: Giấy phép kinh doanh mờ, không khớp thông tin cơ sở..."
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            rows={3}
                                            className="bg-darkBackgroundV1 border-red-500/30 text-white focus:border-red-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setShowRejectForm(false)}
                                            className="text-neutral-400"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className="bg-red-500 hover:bg-red-600 text-white"
                                            disabled={isReviewing}
                                        >
                                            Xác nhận từ chối
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    <DialogFooter className="bg-darkBackgroundV1 border-t border-darkBorderV1">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDetailsOpen(false)}
                            className="text-neutral-400 hover:text-white"
                        >
                            Đóng
                        </Button>

                        {selectedRequest && selectedRequest.status === "PENDING" && !showRejectForm && (
                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowRejectForm(true)}
                                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                                    disabled={isReviewing}
                                >
                                    <Icon path={mdiCloseOctagonOutline} size={0.7} className="mr-1.5" />
                                    Từ chối
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    className="bg-green-600 text-white hover:bg-green-700 font-bold shadow-lg shadow-green-600/10"
                                    disabled={isReviewing}
                                >
                                    <Icon path={mdiCheckBold} size={0.7} className="mr-1.5" />
                                    Duyệt hồ sơ
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* FULL SIZE IMAGE PREVIEW OVERLAY */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[1100] bg-black/95 flex items-center justify-center cursor-zoom-out p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-5xl w-full h-[85vh]">
                        <Image src={previewImage} alt="Large Preview" fill className="object-contain" />
                    </div>
                    <button
                        className="absolute right-4 top-4 bg-darkCardV1 border border-darkBorderV1 rounded-full p-2 text-neutral-300 hover:text-white"
                        onClick={() => setPreviewImage(null)}
                    >
                        <Icon path={mdiClose} size={0.8} />
                    </button>
                </div>
            )}
        </div>
    );
}
