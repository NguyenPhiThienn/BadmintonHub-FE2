"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/mdi-icon";
import { Pagination } from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useMyBookings, useUpdateBookingStatus } from "@/hooks/useBooking";
import {
    mdiMagnify,
    mdiRefresh
} from "@mdi/js";
import { useState } from "react";
import { toast } from "react-toastify";

import { MyBookingsTable } from "./MyBookingsTable";

export default function MyBookingsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: bookingsRes, isLoading, isFetching, refetch } = useMyBookings({
        page: currentPage,
        limit: pageSize,
    });

    const updateStatusMutation = useUpdateBookingStatus();

    const bookings = bookingsRes?.data?.bookings || [];
    const totalItems = bookingsRes?.data?.pagination?.total || 0;
    const totalPages = bookingsRes?.data?.pagination?.totalPages || 1;

    const handleRefresh = () => {
        setCurrentPage(1);
        setStatusFilter("all");
        setSearchQuery("");
        refetch();
    };

    const handleCancelBooking = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy đơn đặt sân này không?")) {
            updateStatusMutation.mutate(
                { id, data: { status: "CANCELLED" } },
                {
                    onSuccess: () => {
                        toast.success("Hủy đặt sân thành công");
                        refetch();
                    },
                    onError: () => {
                        toast.error("Không thể hủy đặt sân vào lúc này");
                    },
                }
            );
        }
    };

    return (
        <div className="min-h-screen bg-darkBackgroundV1 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6 bg-darkCardV1 p-4 md:p-6 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                {/* Breadcrumbs */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbLink href="/">
                            Trang chủ
                        </BreadcrumbLink>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Lịch của tôi</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                {/* Search and Filter */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative w-full md:flex-1">
                        <Input
                            placeholder="Tìm kiếm theo tên sân..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 py-2 w-full"
                        />
                        <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                                <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleRefresh}
                            disabled={isFetching}
                            variant="ghost"
                        >
                            <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                            Làm mới
                        </Button>
                    </div>
                </div>

                {/* Table Section */}
                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                    <MyBookingsTable
                        bookings={bookings}
                        isLoading={isLoading || isFetching}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onCancel={handleCancelBooking}
                    />
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
            </div>
        </div>
    );
}

