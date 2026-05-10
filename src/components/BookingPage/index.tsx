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
import { useResponsive } from "@/hooks/use-mobile";
import { useUpdateBookingStatus } from "@/hooks/useBooking";
import { useOwnerBookings } from "@/hooks/useOwner";
import { useMyVenues } from "@/hooks/useVenue";
import { BookingStatus, IBooking } from "@/interface/booking";
import { mdiMagnify, mdiPlus, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-toastify";
import { BookingDetailsDialog } from "./BookingDetailsDialog";
import { BookingTable } from "./BookingTable";
import { ManualBookingDialog } from "./ManualBookingDialog";

export default function BookingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [venueFilter, setVenueFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

    const { isMobile, isTablet } = useResponsive();

    // Fetch venues for filter
    const { data: venuesRes } = useMyVenues({ limit: 100 });
    const venues = venuesRes?.data?.venues || [];

    // Fetch bookings
    const {
        data: bookingsRes,
        isLoading,
        isFetching,
        refetch
    } = useOwnerBookings({
        page: currentPage,
        limit: pageSize,
        venueId: venueFilter !== "all" ? venueFilter : undefined,
        status: statusFilter !== "all" ? (statusFilter as BookingStatus) : undefined
    });

    const { mutate: updateStatus } = useUpdateBookingStatus();

    const handleRefresh = () => {
        setCurrentPage(1);
        refetch();
    };

    const handleAction = (booking: IBooking) => {
        setSelectedBooking(booking);
        setIsDetailsOpen(true);
    };

    const handleUpdateStatus = (id: string, status: BookingStatus) => {
        updateStatus({ id, data: { status: status as any } }, {
            onSuccess: () => {
                toast.success(`Đã cập nhật trạng thái đơn đặt sân thành ${status}`);
            },
            onError: () => {
                toast.error("Cập nhật trạng thái thất bại");
            }
        });
    };

    const bookings = bookingsRes?.data?.bookings || [];
    const pagination = bookingsRes?.data?.pagination;

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
                            <BreadcrumbPage>Quản lý đơn đặt sân</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            <div className="relative w-full md:w-64 flex-1">
                                <Input
                                    placeholder="Tìm kiếm mã đơn..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 py-2 w-full"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                                    <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                                    <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={handleRefresh}
                                disabled={isFetching}
                                variant="ghost"
                                size={isMobile ? "icon" : "default"}
                            >
                                <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                {!isMobile && "Làm mới"}
                            </Button>
                        </div>
                        <Button
                            onClick={() => setIsManualBookingOpen(true)}
                        >
                            <Icon path={mdiPlus} size={0.8} />
                            {!isMobile && "Đặt sân thủ công"}
                        </Button>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <BookingTable
                            bookings={bookings}
                            isLoading={isLoading}
                            onAction={handleAction}
                            onUpdateStatus={handleUpdateStatus}
                            currentPage={currentPage}
                            pageSize={pageSize}
                        />
                    </Card>

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
                </motion.div>

                <ManualBookingDialog
                    isOpen={isManualBookingOpen}
                    onClose={() => setIsManualBookingOpen(false)}
                    venues={venues}
                />

                <BookingDetailsDialog
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    booking={selectedBooking}
                />
            </div>
        </TooltipProvider>
    );
}
