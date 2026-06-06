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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useCoupons, useCreateCoupon, useDeleteCoupon, useUpdateCoupon } from "@/hooks/useCoupon";
import { ICoupon, CouponStatus, CouponDiscountType } from "@/types/coupon";
import { mdiChevronRight, mdiPlus, mdiRefresh, mdiMagnify, mdiTune, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { CouponDialog } from "./CouponDialog";
import { CouponTable } from "./CouponTable";

export const OwnerCouponsPage = () => {
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);

    const isFirstRender = useRef(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            if (!isFirstRender.current) setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        isFirstRender.current = false;
    }, []);

    const { data: couponsRes, isLoading, isFetching, refetch } = useCoupons({
        page: currentPage,
        limit: pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: debouncedSearch || undefined
    });

    const { mutate: deleteMutation, isPending: isDeleting } = useDeleteCoupon();
    const { mutate: createMutation, isPending: isCreating } = useCreateCoupon();
    const { mutate: updateMutation, isPending: isUpdating } = useUpdateCoupon();

    const coupons = couponsRes?.data?.coupons || [];
    const pagination = couponsRes?.data ? {
        total: couponsRes.data.total,
        page: couponsRes.data.page,
        totalPages: couponsRes.data.totalPages
    } : undefined;

    const handleCreate = () => {
        setSelectedCoupon(null);
        setDialogMode("create");
        setIsDialogOpen(true);
    };

    const handleEdit = (coupon: ICoupon) => {
        setSelectedCoupon(coupon);
        setDialogMode("edit");
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        const coupon = coupons.find((c: ICoupon) => c._id === id);
        if (coupon) {
            setSelectedCoupon(coupon);
            setIsDeleteDialogOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!selectedCoupon) return;
        return new Promise((resolve, reject) => {
            deleteMutation(selectedCoupon._id, {
                onSuccess: () => {
                    setSelectedCoupon(null);
                    toast.success(`Đã xóa mã khuyến mãi: ${selectedCoupon.code}`);
                    resolve(true);
                },
                onError: (error) => reject(error)
            });
        });
    };

    const handleSubmit = (data: any) => {
        const payload: any = {
            ...data,
            venueId: data.venueId === "all" ? null : data.venueId,
            startDate: new Date(data.startDate).toISOString(),
            endDate: new Date(data.endDate).toISOString(),
        };

        if (!payload.minOrderValue) delete payload.minOrderValue;
        if (!payload.maxDiscountAmount || payload.discountType === CouponDiscountType.FIXED_AMOUNT) {
            delete payload.maxDiscountAmount;
        }
        
        if (dialogMode === "create") {
            delete payload.status;
            delete payload._id;
            delete payload.usedCount;
        }

        const handleError = (error: any) => {
            const msg = error?.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg[0] : (msg || "Có lỗi xảy ra."));
        };

        if (dialogMode === "create") {
            createMutation(payload, {
                onSuccess: () => {
                    toast.success("Tạo mã khuyến mãi mới thành công!");
                    setIsDialogOpen(false);
                },
                onError: handleError
            });
        } else if (selectedCoupon) {
            updateMutation({ id: selectedCoupon._id, data: payload }, {
                onSuccess: () => {
                    toast.success("Cập nhật mã khuyến mãi thành công!");
                    setIsDialogOpen(false);
                },
                onError: handleError
            });
        }
    };

    return (
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
                            <BreadcrumbPage>Quản lý khuyến mãi</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-4 w-full">
                    <div className="relative w-full md:w-[350px]">
                        <Icon path={mdiMagnify} size={0.9} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10" />
                        <Input
                            placeholder="Tìm kiếm mã khuyến mãi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 py-2.5 w-full bg-darkBackgroundV1 border-darkBorderV1 rounded-xl text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setCurrentPage(1);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors z-10"
                            >
                                <Icon path={mdiClose} size={0.8} />
                            </button>
                        )}
                    </div>

                    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="relative shrink-0 h-[42px] w-[42px] border-darkBorderV1 bg-darkBackgroundV1/50 rounded-xl">
                                <Icon path={mdiTune} size={0.8} className="text-neutral-400" />
                                {statusFilter !== "all" && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[380px] p-5 bg-darkCardV1 border-darkBorderV1 shadow-2xl rounded-2xl" align="start">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-white">Lọc kết quả</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-neutral-400 hover:text-white"
                                        onClick={() => {
                                            setStatusFilter("all");
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Xóa lọc
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-neutral-400 font-medium text-xs uppercase tracking-wider">Trạng thái mã</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: "all", label: "Tất cả" },
                                            { id: CouponStatus.ACTIVE, label: "Hoạt động" },
                                            { id: CouponStatus.INACTIVE, label: "Tạm ngưng" },
                                            { id: CouponStatus.DELETED, label: "Đã xóa" },
                                        ].map(st => (
                                            <Badge
                                                key={st.id}
                                                variant="neutral"
                                                className={`cursor-pointer px-3 py-1.5 transition-colors ${statusFilter === st.id ? 'bg-accent/20 text-accent border-accent/40' : 'hover:bg-darkBorderV1/80 border-darkBorderV1 bg-darkBackgroundV1 text-neutral-400'}`}
                                                onClick={() => {
                                                    setStatusFilter(st.id);
                                                    setCurrentPage(1);
                                                }}
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
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Làm mới"
                        variant="outline"
                        size="icon"
                        className="h-[42px] w-[42px] shrink-0 border-darkBorderV1 bg-darkBackgroundV1/50 rounded-xl hover:bg-darkCardV1 transition-colors sm:ml-auto self-end sm:self-auto"
                    >
                        <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin text-accent" : "text-neutral-400"} />
                    </Button>
                    
                    <Button variant="accent" onClick={handleCreate} className="h-[42px] shrink-0 rounded-xl w-full sm:w-auto mt-2 sm:mt-0">
                        <Icon path={mdiPlus} size={0.8} className="mr-1" />
                        Thêm mã khuyến mãi
                    </Button>
                </div>

                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                    <CouponTable
                        coupons={coupons}
                        isLoading={isLoading || isFetching}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
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

            <CouponDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedCoupon}
                mode={dialogMode}
                isSubmitting={isCreating || isUpdating}
            />

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                isDeleting={isDeleting}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={`Xóa mã khuyến mãi: ${selectedCoupon?.code || ""}`}
                description="Bạn có chắc chắn muốn xóa mã khuyến mãi này không? Nếu đã có người sử dụng, mã sẽ được đổi sang trạng thái Đã xóa (DELETED) thay vì xóa hoàn toàn khỏi hệ thống."
                confirmText="Xóa mã"
                errorMessage="Xóa mã khuyến mãi thất bại"
            />
        </div>
    );
};
