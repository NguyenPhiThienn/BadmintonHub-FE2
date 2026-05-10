"use client";

import { bookingApi } from "@/api/booking";
import { Footer } from "@/components/Landing/Footer";
import { Header } from "@/components/Landing/Header";
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
import { useUser } from "@/context/useUserContext";
import { useMyBookings, useUpdateBookingStatus } from "@/hooks/useBooking";
import {
    mdiCalendarCheckOutline,
    mdiMagnify,
    mdiRefresh
} from "@mdi/js";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { ConfirmDialog } from "../ui/confirm-dialog";
import { MyBookingsTable } from "./MyBookingsTable";

interface UserStats {
    totalHours: number;
    totalBookings: number;
    totalSpent: number;
}

export default function MyBookingsPage() {
    const { user, profile } = useUser();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [stats, setStats] = useState<UserStats | null>(null);

    const { data: bookingsRes, isLoading, isFetching, refetch } = useMyBookings({
        page: currentPage,
        limit: pageSize,
    });

    const updateStatusMutation = useUpdateBookingStatus();

    const bookings = bookingsRes?.data?.bookings || [];
    const totalItems = bookingsRes?.data?.pagination?.total || 0;
    const totalPages = bookingsRes?.data?.pagination?.totalPages || 1;

    useEffect(() => {
        const loadStats = async () => {
            try {
                const statsRes = await bookingApi.getMyStatistics();
                if (statsRes.success) {
                    setStats(statsRes.data);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsStatsLoading(false);
            }
        };

        if (user) {
            loadStats();
        }
    }, [user]);

    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

    const handleRefresh = () => {
        setCurrentPage(1);
        setStatusFilter("all");
        setSearchQuery("");
        refetch();
    };

    const handleCancelBooking = (id: string) => {
        setBookingToCancel(id);
        setIsCancelDialogOpen(true);
    };

    const confirmCancelBooking = () => {
        if (!bookingToCancel) return;

        updateStatusMutation.mutate(
            { id: bookingToCancel, data: { status: "CANCELLED" } },
            {
                onSuccess: () => {
                    toast.success("Hủy đặt sân thành công");
                    setIsCancelDialogOpen(false);
                    setBookingToCancel(null);
                    refetch();
                },
                onError: () => {
                    toast.error("Không thể hủy đặt sân vào lúc này");
                },
            }
        );
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col bg-darkBackgroundV1">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Icon path={mdiCalendarCheckOutline} size={1.5} className="text-neutral-400 opacity-20" />
                    <p className="text-neutral-400 italic">Vui lòng đăng nhập để xem lịch sử đặt sân.</p>
                    <Button variant="accent" onClick={() => window.location.href = "/"}>
                        Quay lại trang chủ
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-darkBackgroundV1">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-24 pb-8 space-y-4">
                {/* Breadcrumbs */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Lịch của tôi</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                {/* Right Column: Booking Table */}
                <div className="lg:col-span-8 space-y-4">
                    <section className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4 shadow-lg min-h-[600px] flex flex-col">
                        <h3 className="text-accent font-semibold flex items-center gap-2">
                            <Icon path={mdiCalendarCheckOutline} size={0.8} />
                            Lịch sử đặt sân
                        </h3>

                        {/* Search and Filter */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="relative w-full md:flex-1">
                                <Input
                                    placeholder="Tìm kiếm theo tên sân..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 py-2 w-full"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[200px]">
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
                        <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent flex-1">
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
                    </section>
                </div>
            </main>
            <Footer />

            <ConfirmDialog
                isOpen={isCancelDialogOpen}
                onClose={() => {
                    setIsCancelDialogOpen(false);
                    setBookingToCancel(null);
                }}
                onConfirm={confirmCancelBooking}
                title="Hủy đặt sân"
                description="Bạn có chắc chắn muốn hủy đơn đặt sân này không? Hành động này không thể hoàn tác."
                confirmText="Hủy đặt sân"
                cancelText="Quay lại"
                variant="destructive"
                isPending={updateStatusMutation.isPending}
            />
        </div>
    );
}
