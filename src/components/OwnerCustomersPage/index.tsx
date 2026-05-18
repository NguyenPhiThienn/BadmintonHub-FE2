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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useOwnerBookings } from "@/hooks/useOwner";
import { IBooking, BookingStatus } from "@/interface/booking";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiAccount,
    mdiAccountCircle,
    mdiAccountMultipleOutline,
    mdiAlertCircle,
    mdiAlertCircleOutline,
    mdiCashMultiple,
    mdiClose,
    mdiEmailOutline,
    mdiEyeOutline,
    mdiHistory,
    mdiMagnify,
    mdiPhoneOutline,
    mdiRefresh,
    mdiStar,
    mdiStoreOutline,
    mdiPlaylistRemove
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

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
            let phone = "N/A";
            let email = "N/A";
            let avatarUrl = "";
            let isGuest = true;

            if (booking.playerId && typeof booking.playerId === "object") {
                customerId = booking.playerId._id;
                name = booking.playerId.fullName || "Chưa thiết lập";
                phone = booking.playerId.phone || "N/A";
                email = booking.playerId.email || "N/A";
                avatarUrl = booking.playerId.avatar || "";
                isGuest = false;
            } else {
                phone = booking.customerPhone || "N/A";
                customerId = `guest-${phone}-${booking.customerName || "noname"}`;
                name = booking.customerName || "Khách vãng lai";
                email = booking.customerEmail || "N/A";
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

    // Statistics calculated on the fly
    const stats = useMemo(() => {
        let totalVIP = 0;
        let totalNoShowWarnings = 0;
        let totalSpent = 0;

        customers.forEach((c) => {
            if (c.totalBookings >= 3) totalVIP += 1;
            if (c.noShowBookings > 0) totalNoShowWarnings += 1;
            totalSpent += c.totalSpent;
        });

        return {
            totalCustomers: customers.length,
            totalVIP,
            totalNoShowWarnings,
            totalSpent,
        };
    }, [customers]);

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
                <Breadcrumb>
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

                {/* Dashboard Analytics grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 bg-darkBackgroundV1/30 border-darkBorderV1 flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-xl text-accent">
                            <Icon path={mdiAccountMultipleOutline} size={1.2} />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 font-medium">Tổng số khách</p>
                            <h3 className="text-xl font-bold text-neutral-100">{stats.totalCustomers}</h3>
                        </div>
                    </Card>

                    <Card className="p-4 bg-darkBackgroundV1/30 border-darkBorderV1 flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                            <Icon path={mdiStar} size={1.2} />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 font-medium">Thành viên VIP (≥3 đơn)</p>
                            <h3 className="text-xl font-bold text-neutral-100">{stats.totalVIP}</h3>
                        </div>
                    </Card>

                    <Card className="p-4 bg-darkBackgroundV1/30 border-darkBorderV1 flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                            <Icon path={mdiAlertCircle} size={1.2} />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 font-medium">Cảnh báo No-Show</p>
                            <h3 className="text-xl font-bold text-neutral-100">{stats.totalNoShowWarnings}</h3>
                        </div>
                    </Card>

                    <Card className="p-4 bg-darkBackgroundV1/30 border-darkBorderV1 flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                            <Icon path={mdiCashMultiple} size={1.2} />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 font-medium">Doanh thu tích lũy</p>
                            <h3 className="text-xl font-bold text-green-400">{stats.totalSpent.toLocaleString()} đ</h3>
                        </div>
                    </Card>
                </div>

                {/* Filters Action panel */}
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant={segmentFilter === "all" ? "default" : "outline"}
                            onClick={() => setSegmentFilter("all")}
                            size="sm"
                        >
                            Tất cả
                        </Button>
                        <Button
                            variant={segmentFilter === "vip" ? "default" : "outline"}
                            onClick={() => setSegmentFilter("vip")}
                            className={segmentFilter === "vip" ? "" : "border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"}
                            size="sm"
                        >
                            Khách VIP
                        </Button>
                        <Button
                            variant={segmentFilter === "noshow" ? "default" : "outline"}
                            onClick={() => setSegmentFilter("noshow")}
                            className={segmentFilter === "noshow" ? "" : "border-red-500/30 text-red-400 hover:bg-red-500/10"}
                            size="sm"
                        >
                            Cảnh báo No-Show
                        </Button>
                        <Button
                            variant={segmentFilter === "guest" ? "default" : "outline"}
                            onClick={() => setSegmentFilter("guest")}
                            size="sm"
                        >
                            Khách vãng lai
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 flex-1 md:max-w-xs">
                        <div className="relative w-full">
                            <Input
                                placeholder="Tìm theo tên hoặc SĐT..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 py-1.5 w-full bg-darkBackgroundV1/50 border-darkBorderV1"
                            />
                            <Icon path={mdiMagnify} size={0.7} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                        </div>
                        <Button
                            onClick={() => refetch()}
                            disabled={isFetching}
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                        >
                            <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin text-accent" : ""} />
                        </Button>
                    </div>
                </div>

                {/* Table Data */}
                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center">STT</TableHead>
                                <TableHead>Họ tên</TableHead>
                                <TableHead>Số điện thoại</TableHead>
                                <TableHead className="text-center">Số đơn đặt</TableHead>
                                <TableHead className="text-center">Đã chơi / Boom sân</TableHead>
                                <TableHead className="text-right">Doanh thu mang lại</TableHead>
                                <TableHead>Lần đặt cuối</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="h-12 bg-darkBackgroundV1/20 animate-pulse" colSpan={8} />
                                    </TableRow>
                                ))
                            ) : filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <div className="text-center text-neutral-400 py-10 italic flex flex-col items-center justify-center gap-2">
                                            <Icon path={mdiPlaylistRemove} size={1.5} className="text-neutral-500" />
                                            <span>Không tìm thấy khách hàng nào khớp bộ lọc.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCustomers.map((cust, idx) => {
                                    return (
                                        <TableRow
                                            key={cust.id}
                                            className="cursor-pointer hover:bg-darkBorderV1/45 transition-colors"
                                            onClick={() => handleViewDetails(cust)}
                                        >
                                            <TableCell className="text-center">{idx + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 text-accent font-semibold uppercase">
                                                        {cust.name.slice(0, 2)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-neutral-200">{cust.name}</span>
                                                        <div className="flex gap-1.5 mt-0.5">
                                                            {cust.totalBookings >= 3 && (
                                                                <Badge variant="orange" className="text-[10px] py-0 px-1.5 flex items-center gap-0.5">
                                                                    <Icon path={mdiStar} size={0.35} />
                                                                    <span>VIP</span>
                                                                </Badge>
                                                            )}
                                                            {cust.noShowBookings > 0 && (
                                                                <Badge variant="red" className="text-[10px] py-0 px-1.5 flex items-center gap-0.5">
                                                                    <Icon path={mdiAlertCircle} size={0.35} />
                                                                    <span>No-Show x{cust.noShowBookings}</span>
                                                                </Badge>
                                                            )}
                                                            {cust.isGuest && (
                                                                <Badge variant="neutral" className="text-[10px] py-0 px-1.5">
                                                                    Khách vãng lai
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-neutral-300">{cust.phone}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="neutral" className="font-bold">{cust.totalBookings}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-xs">
                                                    <span className="text-green-400 font-semibold">{cust.completedBookings}</span>
                                                    <span className="text-neutral-500">/</span>
                                                    <span className={cust.noShowBookings > 0 ? "text-red-400 font-bold" : "text-neutral-400"}>
                                                        {cust.noShowBookings}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-400">
                                                {cust.totalSpent.toLocaleString()} đ
                                            </TableCell>
                                            <TableCell className="text-neutral-400 text-xs">
                                                {formatDateWithTime(cust.lastBookingDate)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(cust);
                                                    }}
                                                    className="hover:bg-accent/10 text-accent"
                                                >
                                                    <Icon path={mdiEyeOutline} size={0.8} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Details history Dialog */}
                {selectedCustomer && (
                    <Dialog open={isDetailsOpen} onOpenChange={(open) => !open && setIsDetailsOpen(false)}>
                        <DialogContent size="large" className="bg-darkCardV1 border-darkBorderV1 text-neutral-200">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-accent text-xl">
                                    <Icon path={mdiHistory} size={1} />
                                    <span>Lịch Sử Giao Dịch Khách Hàng</span>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-1">
                                {/* Profile Card */}
                                <Card className="p-4 border-darkBorderV1 bg-darkBackgroundV1/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold uppercase border border-accent/30">
                                            {selectedCustomer.name.slice(0, 2)}
                                        </div>
                                        <div className="space-y-0.5">
                                            <h3 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                                                <span>{selectedCustomer.name}</span>
                                                {selectedCustomer.totalBookings >= 3 && (
                                                    <Badge variant="orange" className="text-xs">VIP</Badge>
                                                )}
                                            </h3>
                                            <p className="text-xs text-neutral-400 flex items-center gap-1">
                                                <Icon path={mdiPhoneOutline} size={0.5} />
                                                <span>{selectedCustomer.phone}</span>
                                                <span className="mx-1">•</span>
                                                <Icon path={mdiEmailOutline} size={0.5} />
                                                <span className="truncate max-w-[200px]">{selectedCustomer.email}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 border-l border-darkBorderV1 pl-4">
                                        <div className="text-center">
                                            <p className="text-xs text-neutral-400">Đã hoàn thành</p>
                                            <p className="text-lg font-bold text-green-400">{selectedCustomer.completedBookings}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-neutral-400">Boom sân</p>
                                            <p className={`text-lg font-bold ${selectedCustomer.noShowBookings > 0 ? "text-red-400" : "text-neutral-400"}`}>
                                                {selectedCustomer.noShowBookings}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-neutral-400">Tích lũy</p>
                                            <p className="text-lg font-bold text-accent">{selectedCustomer.totalSpent.toLocaleString()}đ</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* List of past bookings */}
                                <h4 className="text-sm font-bold text-accent uppercase tracking-wider border-b border-darkBorderV1 pb-2">Danh sách đơn đặt ({selectedCustomer.bookings.length})</h4>
                                <div className="space-y-2">
                                    {selectedCustomer.bookings.map((booking) => {
                                        return (
                                            <Card key={booking._id} className="p-3.5 border-darkBorderV1 bg-darkBackgroundV1/10 hover:border-accent/30 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-neutral-500">Mã đơn:</span>
                                                        <span className="text-sm font-bold text-neutral-200">#BH{booking._id.slice(-6).toUpperCase()}</span>
                                                        <Badge variant={getStatusVariant(booking.status)} className="text-[10px] py-0 px-2">
                                                            {getStatusText(booking.status)}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-neutral-400 flex flex-wrap gap-x-3 gap-y-1">
                                                        <span className="flex items-center gap-1">
                                                            <Icon path={mdiStoreOutline} size={0.5} />
                                                            <span>{(booking.venueId as any)?.name || "Cơ sở"}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Icon path={mdiHistory} size={0.5} />
                                                            <span>{formatDateWithTime(booking.createdAt)}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {booking.details.map((d: any, idx: number) => (
                                                            <Badge key={idx} variant="neutral" className="text-[10px] py-0 px-1.5">
                                                                {typeof d.courtId === "object" ? d.courtId.name : "N/A"}: {d.bookingDate} ({d.startTime} - {d.endTime})
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right self-stretch md:self-auto border-t md:border-t-0 border-darkBorderV1 pt-2 md:pt-0 flex md:flex-col justify-between items-center md:items-end">
                                                    <span className="text-xs text-neutral-500 md:hidden">Thanh toán:</span>
                                                    <span className="font-bold text-accent text-base">
                                                        {(booking.finalPrice || booking.totalPrice).toLocaleString()} đ
                                                    </span>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                            <DialogFooter className="border-t border-darkBorderV1 pt-4">
                                <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="gap-2">
                                    <Icon path={mdiClose} size={0.8} />
                                    <span>Đóng</span>
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </TooltipProvider>
    );
}
