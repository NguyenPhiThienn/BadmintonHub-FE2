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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useResponsive } from "@/hooks/use-mobile";
import { useUpdateBookingStatus } from "@/hooks/useBooking";
import { useOwnerBookings } from "@/hooks/useOwner";
import { useMyVenues } from "@/hooks/useVenue";
import { BookingStatus, IBooking } from "@/interface/booking";
import { mdiMagnify, mdiPlus, mdiRefresh, mdiClose, mdiTune } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "react-toastify";
import { BookingDetailsDialog } from "./BookingDetailsDialog";
import { BookingTable } from "./BookingTable";
import { CheckinDialog } from "./CheckinDialog";
import { ManualBookingDialog } from "./ManualBookingDialog";
import { Skeleton } from "@/components/ui/skeleton";

const BookingPageContent = () => {
    const searchParams = useSearchParams();
    const bookingIdFromQuery = searchParams.get('bookingId');
    
    const [searchQuery, setSearchQuery] = useState(bookingIdFromQuery || "");
    const [debouncedSearch, setDebouncedSearch] = useState(bookingIdFromQuery || "");
    const [venueFilter, setVenueFilter] = useState<string>("all");
    const [venueStatusFilter, setVenueStatusFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
    const [isCheckinOpen, setIsCheckinOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
    const [hasAutoOpened, setHasAutoOpened] = useState(false);

    const { isMobile, isTablet } = useResponsive();

    // Sync search query when URL param changes (e.g. clicking another notification while on page)
    useEffect(() => {
        if (bookingIdFromQuery) {
            setSearchQuery(bookingIdFromQuery);
            setHasAutoOpened(false); // allow re-opening for the new id
        }
    }, [bookingIdFromQuery]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch venues for filter - filter by status if selected
    const { data: venuesRes } = useMyVenues({ limit: 100, status: venueStatusFilter !== "all" ? venueStatusFilter as any : undefined });
    const venues = venuesRes?.data?.venues || [];

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [venueFilter, statusFilter]);

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
        status: statusFilter !== "all" ? (statusFilter as BookingStatus) : undefined,
        search: debouncedSearch || undefined,
    });

    const { mutate: updateStatus } = useUpdateBookingStatus();

    const handleRefresh = () => {
        setCurrentPage(1);
        setStatusFilter("all");
        setVenueFilter("all");
        setSearchQuery("");
        setDebouncedSearch("");
        refetch();
    };

    const handleAction = (booking: IBooking) => {
        setSelectedBooking(booking);
        setIsDetailsOpen(true);
    };

    const handleUpdateStatus = (id: string, status: BookingStatus, paymentStatus?: string, cancelReason?: string) => {
        const payload: any = { status: status as any };
        if (paymentStatus) {
            payload.paymentStatus = paymentStatus;
        }
        if (cancelReason) {
            payload.cancelReason = cancelReason;
        }
        updateStatus({ id, data: payload }, {
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

    // Auto-open details if we came from a notification link
    useEffect(() => {
        if (bookingIdFromQuery && !hasAutoOpened && bookings.length > 0) {
            // Find the booking in the results (since we filtered by it, it should be the first one, or at least in the array)
            const targetBooking = bookings.find((b: IBooking) => b._id === bookingIdFromQuery);
            if (targetBooking) {
                setSelectedBooking(targetBooking);
                setIsDetailsOpen(true);
                setHasAutoOpened(true);
            }
        }
    }, [bookingIdFromQuery, bookings, hasAutoOpened]);

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
                            <div className="relative w-full md:w-[260px]">
                                <Input
                                    placeholder="Tìm kiếm mã đơn..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-10 py-2 w-full"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setDebouncedSearch("");
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
                                        {(statusFilter !== "all" || venueFilter !== "all") && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[380px] p-5 bg-darkCardV1 border-darkBorderV1 shadow-2xl" align="start">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-white">Lọc kết quả</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-neutral-400 hover:text-white"
                                                onClick={() => {
                                                    setStatusFilter("all");
                                                    setVenueFilter("all");
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
                                                    { id: "COMPLETED", label: "Đã hoàn thành" },
                                                    { id: "CANCELLED", label: "Đã hủy" },
                                                    { id: "NO_SHOW", label: "Khách không đến" },
                                                ].map(st => (
                                                    <Badge
                                                        key={st.id}
                                                        variant="neutral"
                                                        className={`cursor-pointer px-3 py-1.5 transition-colors ${statusFilter === st.id ? 'bg-accent/20 text-accent border-accent/40' : 'hover:bg-darkBorderV1/80 border-darkBorderV1 bg-darkBackgroundV1 text-neutral-400'}`}
                                                        onClick={() => setStatusFilter(st.id)}
                                                    >
                                                        {st.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-neutral-400 font-medium text-xs uppercase tracking-wider">Cơ sở</Label>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge
                                                    variant="neutral"
                                                    className={`cursor-pointer px-3 py-1.5 transition-colors ${venueFilter === 'all' ? 'bg-accent/20 text-accent border-accent/40' : 'hover:bg-darkBorderV1/80 border-darkBorderV1 bg-darkBackgroundV1 text-neutral-400'}`}
                                                    onClick={() => setVenueFilter('all')}
                                                >
                                                    Tất cả
                                                </Badge>
                                                {venues.map((v: any) => (
                                                    <Badge
                                                        key={v._id}
                                                        variant="neutral"
                                                        className={`cursor-pointer px-3 py-1.5 transition-colors ${venueFilter === v._id ? 'bg-accent/20 text-accent border-accent/40' : 'hover:bg-darkBorderV1/80 border-darkBorderV1 bg-darkBackgroundV1 text-neutral-400'}`}
                                                        onClick={() => setVenueFilter(v._id)}
                                                    >
                                                        {v.name}
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
                        <div className="flex items-center gap-2">
                            {/* <Button
                                onClick={() => setIsCheckinOpen(true)}
                                variant="outline"
                                className="border-accent text-accent hover:bg-accent/10 flex items-center gap-1.5"
                            >
                                <Icon path={mdiQrcodeScan} size={0.8} />
                                {!isMobile && "Check-in nhanh"}
                            </Button> */}
                            <Button
                                onClick={() => setIsManualBookingOpen(true)}
                                className="flex items-center gap-1.5"
                            >
                                <Icon path={mdiPlus} size={0.8} />
                                {!isMobile && "Đặt sân thủ công"}
                            </Button>
                        </div>
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

                <CheckinDialog
                    isOpen={isCheckinOpen}
                    onClose={() => setIsCheckinOpen(false)}
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

export default function BookingPage() {
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
            <BookingPageContent />
        </Suspense>
    );
}
