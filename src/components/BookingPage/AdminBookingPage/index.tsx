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
import { useAdminBookings, useUpdateBookingStatus } from "@/hooks/useBooking";
import { IBooking, BookingStatus } from "@/interface/booking";
import { mdiMagnify, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { BookingDetailsDialog } from "../BookingDetailsDialog";
import { BookingTable } from "../BookingTable";
import { useResponsive } from "@/hooks/use-mobile";

export default function AdminBookingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const { isMobile, isTablet } = useResponsive();

    const {
        data: bookingResponse,
        isLoading,
        isFetching,
        refetch,
    } = useAdminBookings({
        page: currentPage,
        limit: pageSize,
        status: statusFilter !== "all" ? statusFilter as BookingStatus : undefined,
    });

    const { mutate: updateStatus } = useUpdateBookingStatus();

    const handleRefresh = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setCurrentPage(1);
        refetch();
    };

    const handleView = (booking: IBooking) => {
        setSelectedBooking(booking);
        setIsDetailsDialogOpen(true);
    };

    const handleUpdateStatus = (id: string, status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
        updateStatus({ id, data: { status } });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const allBookings: IBooking[] = bookingResponse?.data?.bookings || [];

    const filteredBookings = searchQuery
        ? allBookings.filter((b) => {
            const player = typeof b.playerId === 'object' ? b.playerId : null;
            const venue = typeof b.venueId === 'object' ? b.venueId : null;
            const query = searchQuery.toLowerCase();
            return (
                player?.fullName?.toLowerCase().includes(query) ||
                player?.email?.toLowerCase().includes(query) ||
                venue?.name?.toLowerCase().includes(query)
            );
        })
        : allBookings;

    const totalItems = bookingResponse?.data?.pagination?.total || 0;
    const totalPages = bookingResponse?.data?.pagination?.totalPages || 1;

    return (
        <TooltipProvider>
            <div className="space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Quản lý đặt sân</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Search & Filter Bar */}
                    {isMobile ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRefresh}
                                    disabled={isFetching}
                                >
                                    <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                </Button>
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Tìm kiếm đơn đặt sân..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 py-2 w-full"
                                    />
                                    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                                    <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                                    <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                                    <SelectItem value="CANCELLED">Đã huỷ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ) : isTablet ? (
                        <div className="flex flex-col gap-3 mb-4">
                            <div className="relative w-full">
                                <Input
                                    placeholder="Tìm kiếm đơn đặt sân..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 py-2 w-full"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                                        <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                                        <SelectItem value="CANCELLED">Đã huỷ</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button size="icon" variant="outline" onClick={handleRefresh} disabled={isFetching}>
                                    <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="relative w-full flex-1">
                                <Input
                                    placeholder="Tìm kiếm theo tên người đặt, cơ sở..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 py-2 w-full"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                                        <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                                        <SelectItem value="CANCELLED">Đã huỷ</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleRefresh} disabled={isFetching} variant="ghost">
                                    <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                    Làm mới
                                </Button>
                            </div>
                        </div>
                    )}

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <BookingTable
                            bookings={filteredBookings}
                            isLoading={isLoading || isFetching}
                            isSearching={!!searchQuery}
                            onView={handleView}
                            onUpdateStatus={handleUpdateStatus}
                            currentPage={currentPage}
                            pageSize={pageSize}
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
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}

                <BookingDetailsDialog
                    isOpen={isDetailsDialogOpen}
                    onClose={() => {
                        setIsDetailsDialogOpen(false);
                        setSelectedBooking(null);
                    }}
                    booking={selectedBooking}
                />
            </div>
        </TooltipProvider>
    );
}
