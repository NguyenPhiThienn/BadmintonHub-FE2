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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/context/useUserContext";
import { useResponsive } from "@/hooks/use-mobile";
import { useAdminVenues, useCreateVenue, useDeleteVenue, useMyVenues, useUpdateVenue, useUpdateVenueStatus, useRequestClosure, useApproveClosure, useCancelClosure, useRequestReopen } from "@/hooks/useVenue";
import { IVenue } from "@/interface/venue";
import { mdiAlertCircleOutline, mdiChevronRight, mdiMagnify, mdiPlus, mdiRefresh, mdiClose, mdiTune } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LegalDocumentPreview } from "./LegalDocumentPreview";
import { VenueDetailsDialog } from "./VenueDetailsDialog";
import { VenueDialog } from "./VenueDialog";
import { VenueTable } from "./VenueTable";
import { useMe } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface VenuePageProps {
    type?: "admin" | "owner";
}

const VenuePageContent = ({ type = "admin" }: VenuePageProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: me } = useMe({ refetchInterval: 4000 });
    
    const isOwnerBlocked = me?.data?.status === 'BLOCKED';
    console.log("me: ", me);
    console.log('isOwnerBlocked: ', isOwnerBlocked);

    const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
    const [statusFilter, setStatusFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(Number(searchParams?.get("page")) || 1);
    const [pageSize] = useState(10);
    const [previewVenue, setPreviewVenue] = useState<IVenue | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isVenueDialogOpen, setIsVenueDialogOpen] = useState(false);
    const [closureConfirmId, setClosureConfirmId] = useState<string | null>(null);
    const [closureApproveId, setClosureApproveId] = useState<string | null>(null);
    const [closureRejectId, setClosureRejectId] = useState<string | null>(null);
    const [closureCancelId, setClosureCancelId] = useState<string | null>(null);
    const [reopenConfirmId, setReopenConfirmId] = useState<string | null>(null);
    const [venueDialogMode, setVenueDialogMode] = useState<"create" | "edit">("create");
    const [selectedVenue, setSelectedVenue] = useState<IVenue | null>(null);

    const { isMobile } = useResponsive();
    const isFirstRender = useRef(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setCurrentPage(1);
    }, [debouncedSearchQuery, statusFilter]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (debouncedSearchQuery) {
            params.set("search", debouncedSearchQuery);
        } else {
            params.delete("search");
        }

        if (currentPage > 1) {
            params.set("page", currentPage.toString());
        } else {
            params.delete("page");
        }

        const queryString = params.toString();
        router.push(pathname + (queryString ? `?${queryString}` : ""), { scroll: false });
    }, [debouncedSearchQuery, currentPage, pathname, router, searchParams]);

    const adminQuery = useAdminVenues({
        page: currentPage || 1,
        limit: pageSize || 10,
        search: debouncedSearchQuery,
        sortBy: "desc",
        status: type === "admin" && statusFilter !== "all" ? statusFilter : undefined
    }, { enabled: type === "admin" });

    const ownerQuery = useMyVenues({
        page: currentPage || 1,
        limit: pageSize || 10,
        search: debouncedSearchQuery,
        sortBy: "desc",
        status: type === "owner" && statusFilter !== "all" ? statusFilter : undefined
    }, { enabled: type === "owner" });

    const venuesQuery = type === "admin" ? adminQuery : ownerQuery;
    const { data: venuesRes, isLoading, isFetching, refetch } = venuesQuery;

    const { mutate: updateStatus } = useUpdateVenueStatus();
    const { mutate: deleteVenueMutation, isPending: isDeleting } = useDeleteVenue();
    const { mutate: createVenue, isPending: isCreating } = useCreateVenue();
    const { mutate: updateVenue, isPending: isUpdating } = useUpdateVenue();
    const { mutate: requestClosure, isPending: isRequestingClosure } = useRequestClosure();
    const { mutate: approveClosure, isPending: isApprovingClosure } = useApproveClosure();
    const { mutate: cancelClosure, isPending: isCancelingClosure } = useCancelClosure();
    const { mutate: requestReopen, isPending: isRequestingReopen } = useRequestReopen();

    const handleRequestClosure = (id: string) => {
        setClosureConfirmId(id);
    };

    const confirmRequestClosure = () => {
        if (!closureConfirmId) return;
        requestClosure(closureConfirmId, {
            onSuccess: () => {
                toast.success("Đã gửi yêu cầu đóng cơ sở. Đang chờ duyệt.");
                setClosureConfirmId(null);
            },
            onError: () => {
                toast.error("Có lỗi xảy ra khi gửi yêu cầu.");
            }
        });
    };

    const handleApproveClosure = (id: string) => {
        setClosureApproveId(id);
    };

    const confirmApproveClosure = () => {
        if (!closureApproveId) return;
        approveClosure(closureApproveId, {
            onSuccess: () => {
                toast.success("Đã duyệt đóng cơ sở và xử lý hoàn tiền.");
                setClosureApproveId(null);
            },
            onError: () => {
                toast.error("Có lỗi xảy ra khi duyệt đóng cơ sở.");
            }
        });
    };

    const handleRejectClosure = (id: string) => {
        setClosureRejectId(id);
    };

    const confirmRejectClosure = () => {
        if (!closureRejectId) return;
        updateStatus({
            id: closureRejectId,
            data: { status: 'ACTIVE', reason: "Yêu cầu đóng cơ sở không được phê duyệt." }
        }, {
            onSuccess: () => {
                toast.success("Đã từ chối yêu cầu đóng cơ sở.");
                setClosureRejectId(null);
            },
            onError: () => {
                toast.error("Có lỗi xảy ra khi từ chối yêu cầu.");
            }
        });
    };

    const handleCancelClosure = (id: string) => {
        setClosureCancelId(id);
    };

    const confirmCancelClosure = () => {
        if (!closureCancelId) return;
        cancelClosure(closureCancelId, {
            onSuccess: () => {
                toast.success("Đã hủy yêu cầu đóng cơ sở thành công.");
                setClosureCancelId(null);
            },
            onError: () => {
                toast.error("Có lỗi xảy ra khi hủy yêu cầu.");
            }
        });
    };

    const handleRequestReopen = (id: string) => {
        setReopenConfirmId(id);
    };

    const confirmRequestReopen = () => {
        if (!reopenConfirmId) return;
        requestReopen(reopenConfirmId, {
            onSuccess: () => {
                toast.success("Đã gửi yêu cầu mở lại cơ sở thành công. Vui lòng chờ Admin duyệt.");
                setReopenConfirmId(null);
            },
            onError: () => {
                toast.error("Có lỗi xảy ra khi gửi yêu cầu mở lại.");
            }
        });
    };

    const venues = venuesRes?.data?.venues || [];
    const pagination = venuesRes?.data?.pagination;

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
            setVenueDialogMode("edit");
            setIsVenueDialogOpen(true);
        }
    };

    const handleCreateVenue = () => {
        setSelectedVenue(null);
        setVenueDialogMode("create");
        setIsVenueDialogOpen(true);
    };

    const handleVenueSubmit = async (data: any) => {
        const sanitizedCourts = (data.courts || []).map((c: any) => ({
            name: c.name,
            type: c.type || "Sàn gỗ",
            status: c.status || "AVAILABLE"
        }));

        const payload = {
            name: data.name,
            address: data.address,
            lat: data.coordinates?.coordinates?.[1] ? Number(data.coordinates.coordinates[1]) : undefined,
            lng: data.coordinates?.coordinates?.[0] ? Number(data.coordinates.coordinates[0]) : undefined,
            description: data.description || "",
            openTime: data.openTime,
            closeTime: data.closeTime,
            pricePerHour: Number(data.pricePerHour),
            courts: sanitizedCourts
        };

        if (venueDialogMode === "create") {
            createVenue(payload, {
                onSuccess: () => {
                    toast.success("Tạo cơ sở sân mới thành công!");
                    setIsVenueDialogOpen(false);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || "Tạo cơ sở sân thất bại.");
                }
            });
        } else if (selectedVenue) {
            updateVenue({ id: selectedVenue._id, data: payload }, {
                onSuccess: () => {
                    toast.success("Cập nhật cơ sở sân thành công!");
                    setIsVenueDialogOpen(false);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || "Cập nhật cơ sở sân thất bại.");
                }
            });
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
                <div className="flex items-center justify-between">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-gray-500">Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator>
                                <Icon path={mdiChevronRight} size={0.6} />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Quản lý cơ sở sân</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>


                </div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Alert when owner is blocked */}
                    {type === "owner" && isOwnerBlocked && (
                        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
                            <Icon path={mdiAlertCircleOutline} size={1.2} className="text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-400">Cơ sở của bạn đã bị Ẩn khỏi trang đặt sân!</p>
                                <p className="text-sm text-neutral-400 mt-1">
                                    Lý do: {me?.data?.blockedReason || 'Không có lý do được cung cấp'}
                                </p>
                                <p className="text-sm text-neutral-400 mt-1">
                                    Liên hệ 0963785612 để được hỗ trợ mở khóa.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            <div className="relative w-full md:w-[300px]">
                                <Input
                                    placeholder="Tìm theo tên sân hoặc chủ sở hữu..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-10 py-2 w-full italic"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setDebouncedSearchQuery("");
                                        }}
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
                                        {statusFilter !== "all" && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[320px] p-5 bg-darkCardV1 border-darkBorderV1 shadow-2xl" align="start">
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-white">Lọc kết quả</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-neutral-400 hover:text-white"
                                                onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
                                            >
                                                Xóa lọc
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-neutral-400 font-medium text-xs uppercase tracking-wider">Trạng thái cơ sở</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { id: "all", label: "Tất cả" },
                                                    { id: "ACTIVE", label: "Hoạt động" },
                                                    { id: "INACTIVE", label: "Không hoạt động" },
                                                    { id: "PENDING", label: "Chờ duyệt" },
                                                    { id: "REJECTED", label: "Từ chối" },
                                                    { id: "SUSPENDED", label: "Đình chỉ" },
                                                ].map(st => (
                                                    <Badge
                                                        key={st.id}
                                                        variant="neutral"
                                                        className={`cursor-pointer px-3 py-1.5 transition-colors ${statusFilter === st.id ? 'bg-accent/20 text-accent border-accent/40' : 'hover:bg-darkBorderV1/80 border-darkBorderV1 bg-darkBackgroundV1 text-neutral-400'}`}
                                                        onClick={() => { setStatusFilter(st.id); setCurrentPage(1); }}
                                                    >
                                                        {st.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button
                                onClick={() => refetch()}
                                disabled={isFetching}
                                title="Làm mới"
                                variant="outline"
                                size="icon"
                            >
                                <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin text-neutral-400" : "text-neutral-400"} />
                            </Button>
                            
                            <Button variant="accent" onClick={handleCreateVenue}>
                                <Icon path={mdiPlus} size={0.8} />
                                Thêm cơ sở sân mới
                            </Button>
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <VenueTable
                            venues={venues}
                            isLoading={isLoading}
                            onApprove={type === "admin" ? handleApprove : undefined}
                            onReject={type === "admin" ? handleReject : undefined}
                            onRequestClosure={handleRequestClosure}
                            onApproveClosure={handleApproveClosure}
                            onRejectClosure={handleRejectClosure}
                            onCancelClosure={handleCancelClosure}
                            onRequestReopen={handleRequestReopen}
                            onAction={handleAction}
                            onDelete={handleDelete}
                            onViewLegal={handleViewLegal}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            showAdminActions={type === "admin"}
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

                <VenueDialog
                    isOpen={isVenueDialogOpen}
                    onClose={() => {
                        setIsVenueDialogOpen(false);
                        setSelectedVenue(null);
                    }}
                    onSubmit={handleVenueSubmit}
                    initialData={selectedVenue}
                    mode={venueDialogMode}
                    isSubmitting={isCreating || isUpdating}
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

                <Dialog open={!!closureConfirmId} onOpenChange={() => setClosureConfirmId(null)}>
                    <DialogContent className="!max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-2">
                                <Icon path={mdiAlertCircleOutline} size={1} />
                                Xin đóng cơ sở
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-4 bg-darkBorderV1/30 rounded-lg mt-2 border border-darkBorderV1">
                            <p className="text-sm text-neutral-300">
                                Bạn có chắc chắn muốn xin đóng cơ sở này? Yêu cầu sẽ được Admin duyệt trong tối đa 3 ngày.
                            </p>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setClosureConfirmId(null)} disabled={isRequestingClosure} className="flex-1">
                                Hủy
                            </Button>
                            <Button variant="destructive" onClick={confirmRequestClosure} disabled={isRequestingClosure} className="flex-1">
                                {isRequestingClosure ? "Đang gửi..." : "Xác nhận đóng"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!closureApproveId} onOpenChange={() => setClosureApproveId(null)}>
                    <DialogContent className="!max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-2">
                                <Icon path={mdiAlertCircleOutline} size={1} />
                                Duyệt đóng cơ sở
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-4 bg-darkBorderV1/30 rounded-lg mt-2 border border-darkBorderV1">
                            <p className="text-sm text-neutral-300">
                                Bạn có chắc chắn muốn duyệt đóng cơ sở này? Hệ thống sẽ tự động Hủy các đơn đang chờ và hoàn tiền qua VNPAY cho khách hàng.
                            </p>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setClosureApproveId(null)} disabled={isApprovingClosure} className="flex-1">
                                Hủy
                            </Button>
                            <Button variant="destructive" onClick={confirmApproveClosure} disabled={isApprovingClosure} className="flex-1">
                                {isApprovingClosure ? "Đang xử lý..." : "Duyệt & Hoàn tiền"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!closureRejectId} onOpenChange={() => setClosureRejectId(null)}>
                    <DialogContent className="!max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-2">
                                <Icon path={mdiAlertCircleOutline} size={1} />
                                Từ chối đóng cơ sở
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-4 bg-darkBorderV1/30 rounded-lg mt-2 border border-darkBorderV1">
                            <p className="text-sm text-neutral-300">
                                Bạn có chắc chắn muốn từ chối yêu cầu đóng cơ sở này? Cơ sở sẽ tiếp tục hoạt động và nhận khách bình thường.
                            </p>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setClosureRejectId(null)} className="flex-1">
                                Hủy
                            </Button>
                            <Button variant="destructive" onClick={confirmRejectClosure} className="flex-1">
                                Xác nhận từ chối
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!closureCancelId} onOpenChange={() => setClosureCancelId(null)}>
                    <DialogContent className="!max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-2">
                                <Icon path={mdiAlertCircleOutline} size={1} />
                                Hủy yêu cầu đóng cơ sở
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-4 bg-darkBorderV1/30 rounded-lg mt-2 border border-darkBorderV1">
                            <p className="text-sm text-neutral-300">
                                Bạn có chắc chắn muốn hủy yêu cầu đóng cơ sở này không? Cơ sở của bạn sẽ được hiển thị lại với khách hàng ngay lập tức.
                            </p>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setClosureCancelId(null)} disabled={isCancelingClosure} className="flex-1">
                                Quay lại
                            </Button>
                            <Button variant="destructive" onClick={confirmCancelClosure} disabled={isCancelingClosure} className="flex-1">
                                {isCancelingClosure ? "Đang xử lý..." : "Xác nhận hủy yêu cầu"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!reopenConfirmId} onOpenChange={() => setReopenConfirmId(null)}>
                    <DialogContent className="!max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle className="text-primary flex items-center gap-2">
                                <Icon path={mdiAlertCircleOutline} size={1} />
                                Yêu cầu mở lại cơ sở
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-4 bg-darkBorderV1/30 rounded-lg mt-2 border border-darkBorderV1">
                            <p className="text-sm text-neutral-300">
                                Bạn muốn xin mở lại cơ sở này? Trạng thái sẽ chuyển về "Chờ duyệt" và cần Quản trị viên (Admin) phê duyệt trước khi cơ sở có thể nhận khách trở lại.
                            </p>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setReopenConfirmId(null)} disabled={isRequestingReopen} className="flex-1">
                                Hủy
                            </Button>
                            <Button variant="green" onClick={confirmRequestReopen} disabled={isRequestingReopen} className="flex-1 text-white">
                                {isRequestingReopen ? "Đang xử lý..." : "Gửi yêu cầu"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}

export default function VenuePage(props: VenuePageProps) {
    return (
        <Suspense fallback={
            <div className="space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                <Skeleton className="h-8 w-64 bg-darkBackgroundV1" />
                <div className="space-y-3">
                    <Skeleton className="h-12 w-full bg-darkBackgroundV1" />
                    <Skeleton className="h-64 w-full bg-darkBackgroundV1" />
                </div>
            </div>
        }>
            <VenuePageContent {...props} />
        </Suspense>
    );
}
