"use client";


import { Footer } from "@/components/Landing/Footer";
import { Header } from "@/components/Landing/Header";
import { Badge } from "@/components/ui/badge";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/mdi-icon";
import { Pagination } from "@/components/ui/pagination";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/useUserContext";
import { useMyBookings, useMyStatistics, useRequestRefund, useUpdateBookingStatus } from "@/hooks/useBooking";
import { IBooking } from "@/types/booking";
import {
    mdiAccountOutline,
    mdiAlertCircleOutline,
    mdiBank,
    mdiCalendarCheckOutline,
    mdiClose,
    mdiHome,
    mdiIdentifier,
    mdiInformationOutline,
    mdiMagnify,
    mdiRefresh,
    mdiTune
} from "@mdi/js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [paymentFilter, setPaymentFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: statsRes, isLoading: isStatsLoading } = useMyStatistics();
    const stats = statsRes?.data || null;

    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, statusFilter, typeFilter, paymentFilter]);

    const { data: bookingsRes, isLoading, isFetching, refetch } = useMyBookings({
        page: currentPage,
        limit: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: debouncedSearchQuery || undefined,
        isWeekly: typeFilter === "all" ? undefined : typeFilter === "weekly",
        paymentMethod: paymentFilter === "all" ? undefined : paymentFilter,
    });

    const updateStatusMutation = useUpdateBookingStatus();

    const bookings = bookingsRes?.data?.bookings || [];
    const totalItems = bookingsRes?.data?.pagination?.total || 0;
    const totalPages = bookingsRes?.data?.pagination?.totalPages || 1;



    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [otherCancelReason, setOtherCancelReason] = useState("");

    const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
    const [bookingToRefund, setBookingToRefund] = useState<string | null>(null);
    const [refundForm, setRefundForm] = useState({
        bankName: "",
        accountNumber: "",
        accountName: "",
        reason: ""
    });
    const [otherBank, setOtherBank] = useState("");
    const [otherReason, setOtherReason] = useState("");

    const requestRefundMutation = useRequestRefund();

    const handleRefresh = () => {
        setCurrentPage(1);
        setStatusFilter("all");
        setTypeFilter("all");
        setPaymentFilter("all");
        setSearchQuery("");
        setDebouncedSearchQuery("");
        refetch();
    };

    const handleCancelBooking = (booking: IBooking) => {
        const isPaidVNPay = booking.status === "CONFIRMED" && booking.payment?.method === "VNPAY" && booking.payment?.status === "SUCCESS";

        if (isPaidVNPay) {
            setBookingToRefund(booking._id);
            setRefundForm({
                bankName: "",
                accountNumber: "",
                accountName: "",
                reason: ""
            });
            setOtherBank("");
            setOtherReason("");
            setIsRefundDialogOpen(true);
        } else {
            setBookingToCancel(booking._id);
            setCancelReason("");
            setOtherCancelReason("");
            setIsCancelDialogOpen(true);
        }
    };

    const submitRefundRequest = () => {
        if (!bookingToRefund) return;

        const finalBankName = refundForm.bankName === "OTHER" ? otherBank.trim() : refundForm.bankName;
        const finalReason = refundForm.reason === "OTHER" ? otherReason.trim() : refundForm.reason;

        if (!finalBankName || !refundForm.accountNumber || !refundForm.accountName || !finalReason) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        requestRefundMutation.mutate(
            { id: bookingToRefund, data: { ...refundForm, bankName: finalBankName, reason: finalReason } },
            {
                onSuccess: () => {
                    toast.success("Đã gửi yêu cầu hoàn tiền thành công");
                    setIsRefundDialogOpen(false);
                    setBookingToRefund(null);
                    refetch();
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || "Không thể gửi yêu cầu hoàn tiền lúc này");
                }
            }
        );
    };

    const confirmCancelBooking = () => {
        if (!bookingToCancel) return;

        const finalReason = cancelReason === "OTHER" ? otherCancelReason.trim() : cancelReason;
        if (!finalReason) {
            toast.error("Vui lòng chọn hoặc nhập lý do hủy sân");
            return;
        }

        updateStatusMutation.mutate(
            { id: bookingToCancel, data: { status: "CANCELLED", cancelReason: finalReason } },
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
                    <Button asChild>
                        <Link href="/">
                            <Icon path={mdiHome} size={0.8} />
                            Quay lại trang chủ
                        </Link>
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-darkBackgroundV1">
            <Header />

            <main className="flex-1 max-w-[95%] xl:max-w-[1550px] mx-auto w-full px-4 pt-24 pb-8 space-y-4">
                {/* Breadcrumbs */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Lịch sử đặt sân</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Alert when player is blocked */}
                {profile?.data?.status === 'BLOCKED' && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
                        <Icon path={mdiAlertCircleOutline} size={1.2} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-amber-400">Tài khoản của bạn đã bị khóa!</p>
                            <p className="text-sm text-neutral-400 mt-1">
                                Lý do: {profile?.data?.blockedReason || 'Vui lòng kiểm tra hộp thư thông báo hoặc liên hệ Admin để biết nguyên nhân chi tiết.'}
                            </p>
                            <p className="text-sm text-neutral-400 mt-1">
                                Bạn không thể đặt sân. Liên hệ 0963785612 để được hỗ trợ mở khóa.
                            </p>
                        </div>
                    </div>
                )}

                {/* Right Column: Booking Table */}
                <div className="w-full space-y-4">
                    <section className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-6 space-y-5 shadow-2xl min-h-[600px] flex flex-col">
                        <h3 className="text-accent font-semibold flex items-center gap-2">
                            <Icon path={mdiCalendarCheckOutline} size={0.8} />
                            Lịch sử đặt sân
                        </h3>

                        {/* Search and Filter */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3 flex-1">
                                <div className="relative w-full md:w-[260px]">
                                    <Input
                                        placeholder="Tìm kiếm theo tên sân..."
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
                                                setDebouncedSearchQuery("");
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
                                            {(statusFilter !== "all" || typeFilter !== "all" || paymentFilter !== "all") && (
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
                                                        setTypeFilter("all");
                                                        setPaymentFilter("all");
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
                                                        { id: "PENDING", label: "Chờ thanh toán/Duyệt" },
                                                        { id: "CONFIRMED", label: "Đã xác nhận" },
                                                        { id: "IN_PROGRESS", label: "Đang chơi" },
                                                        { id: "COMPLETED", label: "Hoàn thành" },
                                                        { id: "LATE_ARRIVAL", label: "Khách đến trễ" },
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
                                                <Label className="text-neutral-400 font-medium text-xs uppercase tracking-wider">Loại lịch đặt</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { id: "all", label: "Tất cả" },
                                                        { id: "single", label: "Lịch đơn" },
                                                        { id: "weekly", label: "Cố định tuần" },
                                                    ].map(st => (
                                                        <Badge
                                                            key={st.id}
                                                            variant="neutral"
                                                            className={`cursor-pointer px-3 py-1.5 transition-colors ${typeFilter === st.id ? 'bg-accent/20 text-accent border-accent/40' : 'hover:bg-darkBorderV1/80 border-darkBorderV1 bg-darkBackgroundV1 text-neutral-400'}`}
                                                            onClick={() => setTypeFilter(st.id)}
                                                        >
                                                            {st.label}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-neutral-400 font-medium text-xs uppercase tracking-wider">Phương thức thanh toán</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { id: "all", label: "Tất cả" },
                                                        { id: "VNPAY", label: "Thẻ/VNPay" },
                                                        { id: "CASH", label: "Tiền mặt tại sân" },
                                                    ].map(st => (
                                                        <Badge
                                                            key={st.id}
                                                            variant="neutral"
                                                            className={`cursor-pointer px-3 py-1.5 transition-colors ${paymentFilter === st.id ? 'bg-accent/20 text-accent border-accent/40' : 'hover:bg-darkBorderV1/80 border-darkBorderV1 bg-darkBackgroundV1 text-neutral-400'}`}
                                                            onClick={() => setPaymentFilter(st.id)}
                                                        >
                                                            {st.label}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <Button
                                onClick={handleRefresh}
                                disabled={isFetching}
                                variant="outline"
                                size="icon"
                                className="ml-auto"
                            >
                                <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                            </Button>
                        </div>

                        {/* Table Section */}
                        <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent flex-1">
                            <MyBookingsTable
                                bookings={bookings}
                                isLoading={isLoading}
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

            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent className="max-w-[400px] sm:max-w-[400px] md:max-w-[400px] md:w-[400px] bg-darkCardV1 border-darkBorderV1 p-0 overflow-hidden shadow-2xl">
                    <div className="pt-6 px-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
                                <Icon path={mdiAlertCircleOutline} size={1} />
                                Hủy đặt sân
                            </DialogTitle>
                            <DialogDescription className="text-neutral-400 mt-2 text-sm leading-relaxed">
                                Bạn có chắc muốn hủy đặt sân này không?
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6">
                        <div className="space-y-2">
                            <Label htmlFor="cancelReason" className="text-neutral-300 font-medium flex items-center gap-1.5 text-xs uppercase tracking-wide">
                                <Icon path={mdiInformationOutline} size={0.7} className="text-destructive" /> Lý do hủy sân
                            </Label>
                            <Select
                                value={cancelReason}
                                onValueChange={setCancelReason}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn lý do hủy đơn..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bận việc đột xuất">Bận việc đột xuất</SelectItem>
                                    <SelectItem value="Lịch trình thay đổi">Lịch trình thay đổi</SelectItem>
                                    <SelectItem value="Sức khỏe không đảm bảo">Sức khỏe không đảm bảo</SelectItem>
                                    <SelectItem value="Thời tiết xấu">Thời tiết xấu</SelectItem>
                                    <SelectItem value="Đổi sân khác">Đổi sân khác</SelectItem>
                                    <SelectItem value="OTHER">Lý do khác...</SelectItem>
                                </SelectContent>
                            </Select>

                            {cancelReason === "OTHER" && (
                                <Textarea
                                    placeholder="Vui lòng cho biết lý do chi tiết..."
                                    value={otherCancelReason}
                                    onChange={(e) => setOtherCancelReason(e.target.value)}
                                    className="bg-darkBackgroundV1 border-darkBorderV1 text-white min-h-[100px] placeholder:text-neutral-500 resize-none mt-2"
                                />
                            )}
                        </div>
                    </div>

                    <div className="bg-darkBackgroundV1 p-4 border-t border-darkBorderV1 flex justify-end gap-3 rounded-b-lg">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsCancelDialogOpen(false);
                                setBookingToCancel(null);
                            }}
                            className="text-neutral-400 hover:text-white"
                        >
                            Quay lại
                        </Button>
                        <Button
                            onClick={confirmCancelBooking}
                            disabled={updateStatusMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90 text-white font-semibold min-w-[120px]"
                        >
                            {updateStatusMutation.isPending ? "Đang xử lý..." : "Hủy đơn"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-darkCardV1 border-darkBorderV1 p-0 overflow-hidden shadow-2xl">
                    <div className="bg-accent/10 p-6 border-b border-darkBorderV1">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-accent flex items-center gap-2">
                                <Icon path={mdiBank} size={1} />
                                Yêu cầu hoàn tiền
                            </DialogTitle>
                            <DialogDescription className="text-neutral-400 mt-2 text-sm leading-relaxed">
                                Đơn của bạn đã được thanh toán qua VNPay. Vui lòng cung cấp chính xác thông tin tài khoản ngân hàng để chúng tôi tiến hành hoàn tiền cho bạn (Thời gian xử lý: 1-3 ngày làm việc).
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 grid gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="bankName" className="text-neutral-300 font-medium flex items-center gap-1.5 text-xs uppercase tracking-wide">
                                <Icon path={mdiBank} size={0.7} className="text-accent" /> Ngân hàng thụ hưởng
                            </Label>
                            <Select
                                value={refundForm.bankName}
                                onValueChange={(val) => setRefundForm(prev => ({ ...prev, bankName: val }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn ngân hàng của bạn..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Vietcombank">Vietcombank</SelectItem>
                                    <SelectItem value="Techcombank">Techcombank</SelectItem>
                                    <SelectItem value="MBBank">MBBank (Quân Đội)</SelectItem>
                                    <SelectItem value="BIDV">BIDV</SelectItem>
                                    <SelectItem value="VietinBank">VietinBank</SelectItem>
                                    <SelectItem value="Agribank">Agribank</SelectItem>
                                    <SelectItem value="ACB">ACB</SelectItem>
                                    <SelectItem value="TPBank">TPBank</SelectItem>
                                    <SelectItem value="VPBank">VPBank</SelectItem>
                                    <SelectItem value="Sacombank">Sacombank</SelectItem>
                                    <SelectItem value="VIB">VIB</SelectItem>
                                    <SelectItem value="HDBank">HDBank</SelectItem>
                                    <SelectItem value="SHB">SHB</SelectItem>
                                    <SelectItem value="SeABank">SeABank</SelectItem>
                                    <SelectItem value="MSB">MSB (Hàng Hải)</SelectItem>
                                    <SelectItem value="OCB">OCB (Phương Đông)</SelectItem>
                                    <SelectItem value="LienVietPostBank">LienVietPostBank</SelectItem>
                                    <SelectItem value="OTHER">Ngân hàng khác...</SelectItem>
                                </SelectContent>
                            </Select>

                            {refundForm.bankName === "OTHER" && (
                                <Input
                                    placeholder="Nhập tên ngân hàng của bạn..."
                                    value={otherBank}
                                    onChange={(e) => setOtherBank(e.target.value)}
                                    className="bg-darkBackgroundV1 border-darkBorderV1 text-white placeholder:text-neutral-500 h-10 mt-2"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="accountNumber" className="text-neutral-300 font-medium flex items-center gap-1.5 text-xs uppercase tracking-wide">
                                    <Icon path={mdiIdentifier} size={0.7} className="text-accent" /> Số tài khoản
                                </Label>
                                <Input
                                    id="accountNumber"
                                    placeholder="Ví dụ: 0123456789"
                                    value={refundForm.accountNumber}
                                    onChange={(e) => setRefundForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                                    className="bg-darkBackgroundV1 border-darkBorderV1 text-white placeholder:text-neutral-500 h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accountName" className="text-neutral-300 font-medium flex items-center gap-1.5 text-xs uppercase tracking-wide">
                                    <Icon path={mdiAccountOutline} size={0.7} className="text-accent" /> Tên chủ tài khoản
                                </Label>
                                <Input
                                    id="accountName"
                                    placeholder="Ví dụ: NGUYEN VAN A"
                                    value={refundForm.accountName}
                                    onChange={(e) => setRefundForm(prev => ({ ...prev, accountName: e.target.value.toUpperCase() }))}
                                    className="bg-darkBackgroundV1 border-darkBorderV1 text-white uppercase placeholder:text-neutral-500 h-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-neutral-300 font-medium flex items-center gap-1.5 text-xs uppercase tracking-wide">
                                <Icon path={mdiInformationOutline} size={0.7} className="text-accent" /> Lý do hủy sân
                            </Label>
                            <Select
                                value={refundForm.reason}
                                onValueChange={(val) => setRefundForm(prev => ({ ...prev, reason: val }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn lý do hủy đơn..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bận việc đột xuất">Bận việc đột xuất</SelectItem>
                                    <SelectItem value="Lịch trình thay đổi">Lịch trình thay đổi</SelectItem>
                                    <SelectItem value="Sức khỏe không đảm bảo">Sức khỏe không đảm bảo</SelectItem>
                                    <SelectItem value="Thời tiết xấu">Thời tiết xấu</SelectItem>
                                    <SelectItem value="OTHER">Lý do khác...</SelectItem>
                                </SelectContent>
                            </Select>

                            {refundForm.reason === "OTHER" && (
                                <Textarea
                                    placeholder="Vui lòng cho biết lý do chi tiết bạn muốn hủy đơn..."
                                    value={otherReason}
                                    onChange={(e) => setOtherReason(e.target.value)}
                                    className="bg-darkBackgroundV1 border-darkBorderV1 text-white min-h-[100px] placeholder:text-neutral-500 resize-none mt-2"
                                />
                            )}
                        </div>
                    </div>

                    <div className="bg-darkBackgroundV1 p-4 border-t border-darkBorderV1 flex justify-end gap-3 rounded-b-lg">
                        <Button
                            variant="ghost"
                            onClick={() => setIsRefundDialogOpen(false)}
                            className="text-neutral-400 hover:text-white"
                        >
                            Đóng
                        </Button>
                        <Button
                            onClick={submitRefundRequest}
                            disabled={requestRefundMutation.isPending}
                            className="bg-accent hover:bg-accent/90 text-white font-semibold min-w-[140px]"
                        >
                            {requestRefundMutation.isPending ? "Đang xử lý..." : "Gửi yêu cầu hoàn tiền"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
