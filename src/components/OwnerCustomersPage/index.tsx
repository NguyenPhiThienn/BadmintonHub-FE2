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
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useOwnerBookings } from "@/hooks/useOwner";
import { BookingStatus, IBooking } from "@/types/booking";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiClose,
    mdiEmailOutline,
    mdiHistory,
    mdiMagnify,
    mdiPhoneOutline,
    mdiRefresh,
    mdiStoreOutline,
    mdiTune,
    mdiChevronDown,
    mdiChevronUp
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { OwnerCustomersTable } from "./OwnerCustomersTable";

interface ICustomerSummary {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatarUrl?: string;
    isGuest: boolean;
    totalBookings: number;
    totalSpent: number;
    completedBookings: number;
    noShowBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    lastBookingDate: string;
    bookings: IBooking[];
}

const BookingHistoryCard = ({ booking, getStatusText, getStatusVariant }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="border-darkBorderV1 bg-darkBackgroundV1/10 hover:border-accent/30 transition-colors overflow-hidden">
            {/* Header row */}
            <div 
                className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-darkCardV1/50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-500">Mã đơn:</span>
                        <span className="text-sm font-bold text-neutral-200">#BH{booking._id.slice(-6).toUpperCase()}</span>
                        <Badge variant={getStatusVariant(booking.status)}>
                            {getStatusText(booking.status)}
                        </Badge>
                    </div>
                    
                    <div className="text-sm text-neutral-400 flex flex-wrap gap-x-4 gap-y-2">
                        <span className="flex items-center gap-1">
                            <Icon path={mdiStoreOutline} size={0.6} />
                            <span>{(booking.venueId as any)?.name || "Cơ sở"}</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <Icon path={mdiHistory} size={0.6} />
                            <span>{formatDateWithTime(booking.createdAt)}</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right flex md:flex-col justify-between items-center md:items-end w-full md:w-auto">
                        <span className="text-sm text-neutral-500 md:hidden">Thanh toán:</span>
                        <span className="font-bold text-accent text-base">
                            {(booking.finalPrice || booking.totalPrice).toLocaleString()} đ
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 rounded-full hover:bg-darkBorderV1 hover:text-white shrink-0">
                        <Icon path={isExpanded ? mdiChevronUp : mdiChevronDown} size={0.8} />
                    </Button>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 border-t border-darkBorderV1 bg-darkBackgroundV1/30">
                    <h4 className="text-sm font-semibold text-neutral-300 mb-3">Chi tiết sân & giờ chơi</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {booking.details.map((d: any, idx: number) => {
                            const dateObj = new Date(d.bookingDate);
                            const formattedDate = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('vi-VN') : d.bookingDate;
                            return (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-darkCardV1 border border-darkBorderV1">
                                    <div className="h-8 w-8 rounded bg-accent/20 flex items-center justify-center text-accent font-bold shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-semibold text-neutral-200 text-sm">
                                            {typeof d.courtId === "object" && d.courtId !== null ? d.courtId.name : "Không rõ"}
                                        </p>
                                        <p className="text-neutral-400 text-xs">
                                            Ngày: {formattedDate}
                                        </p>
                                        <Badge variant="neutral" className="mt-1 font-normal bg-darkBackgroundV1 border-darkBorderV1">
                                            {d.startTime} - {d.endTime}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default function OwnerCustomersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [segmentFilter, setSegmentFilter] = useState<"all" | "vip" | "regular" | "guest" | "noshow">("all");
    const [selectedCustomer, setSelectedCustomer] = useState<ICustomerSummary | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Fetch all bookings (using larger limit to aggregate customers)
    const { data: bookingsRes, isLoading, refetch, isFetching } = useOwnerBookings({
        page: 1,
        limit: 1000,
    });

    const bookings = bookingsRes?.data?.bookings || [];

    // Aggregate bookings into unique customers
    const customers = useMemo(() => {
        const map: Record<string, ICustomerSummary> = {};

        bookings.forEach((booking: IBooking) => {
            let customerId = "";
            let name = "Khách vãng lai";
            let phone = "Chưa cung cấp";
            let email = "Chưa cung cấp";
            let avatarUrl = "";
            let isGuest = true;

            if (booking.playerId && typeof booking.playerId === "object") {
                customerId = booking.playerId._id;
                name = booking.playerId.fullName || "Chưa thiết lập";
                phone = booking.playerId.phone || "Chưa cung cấp";
                email = booking.playerId.email || "Chưa cung cấp";
                avatarUrl = booking.playerId.avatarUrl || booking.playerId.avatar || "";
                isGuest = false;
            } else {
                phone = booking.customerPhone || "Chưa cung cấp";
                customerId = `guest-${phone}-${booking.customerName || "noname"}`;
                name = booking.customerName || "Khách vãng lai";
                email = booking.customerEmail || "Chưa cung cấp";
                isGuest = true;
            }

            const amount = booking.finalPrice || booking.totalPrice || 0;

            if (!map[customerId]) {
                map[customerId] = {
                    id: customerId,
                    name,
                    phone,
                    email,
                    avatarUrl,
                    isGuest,
                    totalBookings: 0,
                    totalSpent: 0,
                    completedBookings: 0,
                    noShowBookings: 0,
                    cancelledBookings: 0,
                    pendingBookings: 0,
                    lastBookingDate: booking.createdAt,
                    bookings: [],
                };
            }

            const cust = map[customerId];
            cust.totalBookings += 1;
            cust.bookings.push(booking);

            const isPaid = (booking as any).payment?.status === "SUCCESS";

            if (booking.status === "COMPLETED") {
                cust.completedBookings += 1;
                cust.totalSpent += amount;
            } else if (booking.status === "NO_SHOW") {
                cust.noShowBookings += 1;
                if (isPaid) {
                    cust.totalSpent += amount; // Paid but no-show still counts as revenue
                }
            } else if (booking.status === "CANCELLED") {
                cust.cancelledBookings += 1;
            } else if (booking.status === "PENDING") {
                cust.pendingBookings += 1;
            } else if (booking.status === "CONFIRMED") {
                if (isPaid) {
                    cust.totalSpent += amount; // Confirmed counts towards revenue only if paid
                }
            }

            // Keep track of latest booking
            if (new Date(booking.createdAt) > new Date(cust.lastBookingDate)) {
                cust.lastBookingDate = booking.createdAt;
            }
        });

        return Object.values(map);
    }, [bookings]);

    // Filter and search customers
    const filteredCustomers = useMemo(() => {
        return customers.filter((c) => {
            const matchesSearch =
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.phone.includes(searchQuery);

            let matchesSegment = true;
            if (segmentFilter === "vip") {
                matchesSegment = c.totalSpent >= 1000000;
            } else if (segmentFilter === "regular") {
                matchesSegment = c.completedBookings >= 5 && c.totalSpent < 1000000;
            } else if (segmentFilter === "guest") {
                matchesSegment = c.isGuest;
            } else if (segmentFilter === "noshow") {
                matchesSegment = c.noShowBookings > 0;
            }

            return matchesSearch && matchesSegment;
        });
    }, [customers, searchQuery, segmentFilter]);

    const handleViewDetails = (customer: ICustomerSummary) => {
        setSelectedCustomer(customer);
        setIsDetailsOpen(true);
    };

    const getStatusText = (status: BookingStatus) => {
        switch (status) {
            case "PENDING": return "Chờ xác nhận";
            case "CONFIRMED": return "Đã xác nhận";
            case "COMPLETED": return "Đã hoàn thành";
            case "CANCELLED": return "Đã hủy";
            case "NO_SHOW": return "Khách không đến";
            default: return status;
        }
    };

    const getStatusVariant = (status: BookingStatus) => {
        switch (status) {
            case "PENDING": return "orange";
            case "CONFIRMED": return "green";
            case "COMPLETED": return "blue";
            case "CANCELLED": return "red";
            case "NO_SHOW": return "red";
            default: return "neutral";
        }
    };

    return (
        <TooltipProvider>
            <div className="space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh] text-neutral-200">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Danh sách khách hàng</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-4 w-full">
                        <div className="relative w-full md:w-[350px]">
                            <Icon path={mdiMagnify} size={0.9} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10" />
                            <Input
                                placeholder="Tìm theo tên hoặc SĐT..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-10 py-2.5 w-full bg-darkBackgroundV1 border-darkBorderV1 rounded-xl text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
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
                                    {segmentFilter !== "all" && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[350px] p-5 bg-darkCardV1 border-darkBorderV1 shadow-2xl rounded-2xl" align="start">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-white">Lọc kết quả</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-neutral-400 hover:text-white"
                                            onClick={() => setSegmentFilter("all")}
                                        >
                                            Xóa lọc
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-neutral-400 font-medium text-xs uppercase tracking-wider">Phân khúc khách hàng</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: "all", label: "Tất cả" },
                                                { id: "vip", label: "Khách VIP (Chi >1tr)" },
                                                { id: "regular", label: "Khách quen (Chơi >5 trận)" },
                                                { id: "noshow", label: "Cảnh báo Boom sân" },
                                                { id: "guest", label: "Khách vãng lai" },
                                            ].map(st => (
                                                <Badge
                                                    key={st.id}
                                                    variant="neutral"
                                                    className={`cursor-pointer px-3 py-1.5 transition-colors ${segmentFilter === st.id ? 'bg-accent/20 text-accent border-accent/40' : 'hover:bg-darkBorderV1/80 border-darkBorderV1 bg-darkBackgroundV1 text-neutral-400'}`}
                                                    onClick={() => setSegmentFilter(st.id as any)}
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
                    </div>

                    {/* Table Data */}
                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <OwnerCustomersTable
                            customers={filteredCustomers}
                            isLoading={isLoading}
                            onAction={handleViewDetails}
                        />
                    </Card>
                </motion.div>

                {/* Details history Dialog */}
                {selectedCustomer && (
                    <Dialog open={isDetailsOpen} onOpenChange={(open) => !open && setIsDetailsOpen(false)}>
                        <DialogContent size="medium">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-accent">
                                    <Icon path={mdiHistory} size={0.8} />
                                    <span>Lịch Sử Giao Dịch Khách Hàng</span>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                                {/* Profile Card */}
                                <Card className="p-4 border-darkBorderV1 bg-darkBackgroundV1/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold uppercase border border-accent/30 overflow-hidden">
                                            {selectedCustomer.name.slice(0, 2)}
                                            <img
                                                src={`https://picsum.photos/seed/${encodeURIComponent(selectedCustomer.id)}/150`}
                                                alt={selectedCustomer.name}
                                                className="absolute inset-0 h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h3 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                                                <span>{selectedCustomer.name}</span>
                                                {selectedCustomer.totalSpent >= 1000000 && (
                                                    <Badge variant="orange">Khách VIP</Badge>
                                                )}
                                                {selectedCustomer.completedBookings >= 5 && selectedCustomer.totalSpent < 1000000 && (
                                                    <Badge variant="blue">Khách quen</Badge>
                                                )}
                                            </h3>
                                            <p className="text-sm text-neutral-400 flex items-center gap-1">
                                                <Icon path={mdiPhoneOutline} size={0.6} />
                                                <span>{selectedCustomer.phone}</span>
                                                <span className="mx-1">•</span>
                                                <Icon path={mdiEmailOutline} size={0.6} />
                                                <span className="truncate max-w-[200px]">{selectedCustomer.email}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 border-l border-darkBorderV1 pl-4">
                                        <div className="text-center">
                                            <p className="text-sm text-neutral-400">Đã hoàn thành</p>
                                            <p className="text-lg font-bold text-green-400">{selectedCustomer.completedBookings}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-neutral-400">Boom sân</p>
                                            <p className={`text-lg font-bold ${selectedCustomer.noShowBookings > 0 ? "text-red-400" : "text-neutral-400"}`}>
                                                {selectedCustomer.noShowBookings}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-neutral-400">Tích lũy</p>
                                            <p className="text-lg font-bold text-accent">{selectedCustomer.totalSpent.toLocaleString()}đ</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* List of past bookings */}
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-accent font-semibold whitespace-nowrap">Danh sách đơn đặt ({selectedCustomer.bookings.length})</h3>
                                    <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                </div>
                                <div className="space-y-4">
                                    {selectedCustomer.bookings.map((booking) => (
                                        <BookingHistoryCard 
                                            key={booking._id} 
                                            booking={booking} 
                                            getStatusText={getStatusText} 
                                            getStatusVariant={getStatusVariant} 
                                        />
                                    ))}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                                    <Icon path={mdiClose} size={0.8} />
                                    Đóng
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </TooltipProvider>
    );
}
