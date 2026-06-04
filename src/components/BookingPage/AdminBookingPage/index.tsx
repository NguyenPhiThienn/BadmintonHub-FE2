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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useResponsive } from "@/hooks/use-mobile";
import { useAdminBookings, useUpdateBookingStatus, useConfirmRefundSuccess } from "@/hooks/useBooking";
import { toast } from "react-toastify";
import { BookingStatus, IBooking } from "@/interface/booking";
import { mdiMagnify, mdiRefresh, mdiClose, mdiTune } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { BookingDetailsDialog } from "../BookingDetailsDialog";
import { BookingTable } from "../BookingTable";
import { Skeleton } from "@/components/ui/skeleton";

const AdminBookingContent = () => {
    const searchParams = useSearchParams();
    const bookingIdFromQuery = searchParams.get('bookingId');

    const [searchQuery, setSearchQuery] = useState(bookingIdFromQuery || "");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
    const [hasAutoOpened, setHasAutoOpened] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const { isMobile, isTablet } = useResponsive();

    // Sync search query when URL param changes
    useEffect(() => {
        if (bookingIdFromQuery) {
            setSearchQuery(bookingIdFromQuery);
            setHasAutoOpened(false);
        }
    }, [bookingIdFromQuery]);

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
    const { mutate: confirmRefund } = useConfirmRefundSuccess();

    const handleConfirmRefund = (id: string) => {
        confirmRefund(id, {
            onSuccess: () => {
                toast.success("Đã xác nhận hoàn tiền thành công!");
                refetch();
            },
            onError: (error: any) => {
                console.error("LỖI HOÀN TIỀN TỪ BACKEND:", error);
                const msg = error?.message || "Có lỗi xảy ra khi xác nhận hoàn tiền.";
                toast.error(msg);
            }
        });
    };

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

    const handleUpdateStatus = (id: string, status: BookingStatus) => {
        if (status === 'PENDING') return;
        updateStatus({ id, data: { status: status as 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' } });
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
                venue?.name?.toLowerCase().includes(query) ||
                b._id.toLowerCase().includes(query)
            );
        })
        : allBookings;

    // Auto-open details if we came from a notification link
    useEffect(() => {
        if (bookingIdFromQuery && !hasAutoOpened && filteredBookings.length > 0) {
            const targetBooking = filteredBookings.find((b: IBooking) => b._id === bookingIdFromQuery);
            if (targetBooking) {
                setSelectedBooking(targetBooking);
                setIsDetailsDialogOpen(true);
                setHasAutoOpened(true);
            }
        }
    }, [bookingIdFromQuery, filteredBookings, hasAutoOpened]);

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
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            <div className="relative w-full md:w-[260px]">
                                <Input
                                    placeholder="Tìm kiếm theo tên người đặt, cơ sở..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-10 pr-10 py-2 w-full"
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
                                <PopoverContent className="w-[300px] p-5 bg-darkCardV1 border-darkBorderV1 shadow-2xl" align="start">
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
                                            <Label className="text-neutral-400 font-medium text-xs uppercase tracking-wider">Trạng thái đơn</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { id: "all", label: "Tất cả" },
                                                    { id: "PENDING", label: "Chờ xác nhận" },
                                                    { id: "CONFIRMED", label: "Đã xác nhận" },
                                                    { id: "COMPLETED", label: "Hoàn thành" },
                                                    { id: "CANCELLED", label: "Đã huỷ" },
                                                    { id: "NO_SHOW", label: "Không đến" },
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
                                onClick={handleRefresh}
                                disabled={isFetching}
                                variant="outline"
                                size="icon"
                            >
                                <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin text-neutral-400" : "text-neutral-400"} />
                            </Button>
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <BookingTable
                            bookings={filteredBookings}
                            isLoading={isLoading}
                            isFetching={isFetching}
                            onAction={handleView}
                            onUpdateStatus={handleUpdateStatus}
                            onConfirmRefund={handleConfirmRefund}
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

export default function AdminBookingPage() {
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
            <AdminBookingContent />
        </Suspense>
    );
}
