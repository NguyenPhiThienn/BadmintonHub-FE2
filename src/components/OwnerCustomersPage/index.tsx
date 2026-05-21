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
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useOwnerBookings } from "@/hooks/useOwner";
import { BookingStatus, IBooking } from "@/interface/booking";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiClose,
    mdiEmailOutline,
    mdiHistory,
    mdiMagnify,
    mdiPhoneOutline,
    mdiRefresh,
    mdiStoreOutline
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

export default function OwnerCustomersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [segmentFilter, setSegmentFilter] = useState<"all" | "vip" | "guest" | "noshow">("all");
    const [selectedCustomer, setSelectedCustomer] = useState<ICustomerSummary | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
                avatarUrl = booking.playerId.avatar || "";
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
                matchesSegment = c.totalBookings >= 3;
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
                            <BreadcrumbPage>Quản lý khách hàng</BreadcrumbPage>
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
                                    placeholder="Tìm theo tên hoặc SĐT..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 py-2 w-full"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                            </div>

                            <Select value={segmentFilter} onValueChange={(val: any) => setSegmentFilter(val)}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Phân khúc khách hàng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả khách hàng</SelectItem>
                                    <SelectItem value="vip">Khách VIP</SelectItem>
                                    <SelectItem value="noshow">Cảnh báo No-Show</SelectItem>
                                    <SelectItem value="guest">Khách vãng lai</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={() => refetch()}
                                disabled={isFetching}
                                variant="ghost"
                            >
                                <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin text-accent" : ""} />
                                Làm mới
                            </Button>
                        </div>
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
                                                {selectedCustomer.totalBookings >= 3 && (
                                                    <Badge variant="orange">VIP</Badge>
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
                                    {selectedCustomer.bookings.map((booking) => {
                                        return (
                                            <Card key={booking._id} className="p-4 border-darkBorderV1 bg-darkBackgroundV1/10 hover:border-accent/30 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="space-y-4">
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
                                                    <div className="flex flex-wrap gap-2">
                                                        {booking.details.map((d: any, idx: number) => (
                                                            <Badge key={idx} variant="neutral">
                                                                {typeof d.courtId === "object" && d.courtId !== null ? d.courtId.name : "Không rõ"}: {d.bookingDate} ({d.startTime} - {d.endTime})
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right self-stretch md:self-auto border-t md:border-t-0 border-darkBorderV1 pt-4 md:pt-0 flex md:flex-col justify-between items-center md:items-end">
                                                    <span className="text-sm text-neutral-500 md:hidden">Thanh toán:</span>
                                                    <span className="font-bold text-accent text-base">
                                                        {(booking.finalPrice || booking.totalPrice).toLocaleString()} đ
                                                    </span>
                                                </div>
                                            </Card>
                                        );
                                    })}
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
