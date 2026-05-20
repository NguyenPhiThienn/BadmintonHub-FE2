"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAdminRevenueReport } from "@/hooks/useAdmin";
import { useUsers } from "@/hooks/useUsers";
import { useAdminVenues } from "@/hooks/useVenue";
import {
    mdiCalendarRange,
    mdiCash,
    mdiCheck,
    mdiChevronDown,
    mdiCreditCardOutline,
    mdiFilterOutline,
    mdiFinance,
    mdiMagnify,
    mdiRefresh,
    mdiWallet
} from "@mdi/js";
import Icon from "@mdi/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AdminRevenueTable } from "./AdminRevenueTable";

const SearchableSelect = ({
    value,
    onChange,
    placeholder,
    options,
    allLabel
}: {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
    allLabel: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm("");
        }
    }, [isOpen]);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = value === "all" ? allLabel : (selectedOption ? selectedOption.label : placeholder);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-10 w-full items-center justify-between rounded-md border bg-[#0d1e21] px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none transition-all duration-300 ${isOpen ? "border-accent ring-1 ring-accent/30 shadow-[0_0_10px_rgba(0,255,136,0.15)]" : "border-darkBorderV1 hover:border-accent/40"}`}
            >
                <span className="truncate pr-2">{displayValue}</span>
                <Icon path={mdiChevronDown} size={0.8} className={`text-neutral-400 shrink-0 transition-transform duration-300 ${isOpen ? "transform rotate-180 text-accent" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-[999] min-w-[8rem] w-full overflow-hidden rounded-md border border-accent/30 bg-[#091517] shadow-[0_15px_30px_rgba(0,0,0,0.85),_0_0_15px_rgba(0,255,136,0.15)] backdrop-blur-md mt-1.5"
                    >
                        {/* Search Input Box */}
                        <div className="flex items-center border-b border-[#122e33] px-3 py-2 bg-[#060e0f]">
                            <Icon path={mdiMagnify} size={0.6} className="text-accent mr-2 shrink-0" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex h-6 w-full rounded-md bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-500"
                            />
                        </div>

                        {/* Options List */}
                        <div className="max-h-[220px] overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("all");
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center justify-between px-3 py-2 text-sm text-left transition-all ${value === "all" ? "bg-accent/10 text-accent font-semibold" : "text-neutral-300 hover:bg-accent/5 hover:text-accent"}`}
                            >
                                <span className="truncate">{allLabel}</span>
                                {value === "all" && <Icon path={mdiCheck} size={0.5} className="text-accent shrink-0 ml-2" />}
                            </button>
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-3 text-xs text-neutral-500 italic text-center">
                                    Không tìm thấy kết quả
                                </div>
                            ) : (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between px-3 py-2 text-sm text-left transition-all ${value === opt.value ? "bg-accent/10 text-accent font-semibold" : "text-neutral-300 hover:bg-accent/5 hover:text-accent"}`}
                                    >
                                        <span className="truncate pr-2">{opt.label}</span>
                                        {value === opt.value && <Icon path={mdiCheck} size={0.5} className="text-accent shrink-0 ml-2" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function AdminRevenuePage() {
    const [page, setPage] = useState(1);
    const [method, setMethod] = useState("all");
    const [ownerId, setOwnerId] = useState("all");
    const [venueId, setVenueId] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Load filter data (role should be OWNER in MongoDB)
    const { data: ownersResponse } = useUsers({ page: 1, limit: 1000, role: "OWNER" }, { staleTime: 0, refetchOnMount: true });
    const { data: venuesResponse } = useAdminVenues({ page: 1, limit: 1000 }, { staleTime: 0, refetchOnMount: true });


    const owners = ownersResponse?.data?.users || [];
    const venues = venuesResponse?.data?.venues || [];

    const ownerOptions = owners.map((owner: any) => ({
        value: owner._id,
        label: owner.fullName || owner.email
    }));

    // Dynamic Dependent Filtering: filter venues based on the selected ownerId
    const filteredVenues = ownerId !== "all"
        ? venues.filter((venue: any) => {
            const venueOwnerId = typeof venue.ownerId === 'object' ? venue.ownerId?._id : venue.ownerId;
            return venueOwnerId === ownerId;
        })
        : venues;

    const venueOptions = filteredVenues.map((venue: any) => ({
        value: venue._id,
        label: venue.name
    }));

    // Auto reset selected venue if it is not owned by the selected owner
    useEffect(() => {
        if (ownerId !== "all" && venueId !== "all") {
            const selectedVenueExists = filteredVenues.some((v: any) => v._id === venueId);
            if (!selectedVenueExists) {
                setVenueId("all");
            }
        }
    }, [ownerId, filteredVenues, venueId]);

    // Load revenue report
    const {
        data: reportResponse,
        isLoading,
        isFetching,
        refetch
    } = useAdminRevenueReport({
        page,
        limit: 10,
        method: method !== "all" ? method : undefined,
        ownerId: ownerId !== "all" ? ownerId : undefined,
        venueId: venueId !== "all" ? venueId : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    });

    const reportData = reportResponse?.data || {};
    const transactions = reportData.transactions || [];
    const stats = reportData.stats || {
        totalRevenue: 0,
        count: 0,
        cashRevenue: 0,
        vnpayRevenue: 0,
        momoRevenue: 0
    };
    // Normalize cash revenue: backend might use cashRevenue, cashTotal, or CASH key
    const cashRevenue = stats.cashRevenue ?? stats.cashTotal ?? stats.CASH ?? 0;
    const vnpayRevenue = stats.vnpayRevenue ?? stats.vnpayTotal ?? stats.VNPAY ?? 0;
    const momoRevenue = stats.momoRevenue ?? stats.momoTotal ?? stats.MOMO ?? 0;
    const pagination = reportData.pagination || {
        total: 0,
        totalPages: 1
    };

    const handleResetFilters = () => {
        setMethod("all");
        setOwnerId("all");
        setVenueId("all");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    return (
        <TooltipProvider>
            <div className="space-y-6 bg-darkCardV1 p-4 md:p-6 rounded-2xl border border-darkBorderV1 min-h-[85vh]">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Quản lý doanh thu</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <h1 className="text-2xl font-bold text-accent tracking-tight mt-1">Báo cáo & Phân tích doanh thu</h1>
                        <p className="text-sm text-neutral-400">Theo dõi, lọc và thống kê chi tiết mọi giao dịch trong hệ thống.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="text-neutral-400 hover:text-white"
                        >
                            <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin mr-2" : "mr-2"} />
                            Làm mới
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleResetFilters}
                            className="border-darkBorderV1 text-neutral-400 hover:text-white"
                        >
                            Đặt lại bộ lọc
                        </Button>
                    </div>
                </div>

                {/* Filters Panel */}
                <div className="bg-darkBackgroundV1/50 border border-darkBorderV1 rounded-xl p-4 md:p-5 space-y-4">
                    <div className="flex items-center gap-2 text-accent font-medium">
                        <Icon path={mdiFilterOutline} size={0.8} />
                        <span>Bộ lọc tìm kiếm nâng cao</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Phương thức */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-400 font-medium">Phương thức thanh toán</label>
                            <Select value={method} onValueChange={(val) => { setMethod(val); setPage(1); }}>
                                <SelectTrigger className="w-full bg-darkCardV1 border-darkBorderV1">
                                    <SelectValue placeholder="Tất cả phương thức" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả phương thức</SelectItem>
                                    <SelectItem value="CASH">Tiền mặt</SelectItem>
                                    <SelectItem value="VNPAY">VNPay</SelectItem>
                                    <SelectItem value="MOMO">Ví MoMo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Chủ sân */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-400 font-medium">Chủ sân sở hữu</label>
                            <SearchableSelect
                                value={ownerId}
                                onChange={(val) => { setOwnerId(val); setPage(1); }}
                                placeholder="Tất cả chủ sân"
                                options={ownerOptions}
                                allLabel="Tất cả chủ sân"
                            />
                        </div>

                        {/* Cơ sở sân */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-400 font-medium">Cơ sở sân</label>
                            <SearchableSelect
                                value={venueId}
                                onChange={(val) => { setVenueId(val); setPage(1); }}
                                placeholder="Tất cả cơ sở"
                                options={venueOptions}
                                allLabel="Tất cả cơ sở"
                            />
                        </div>

                        {/* Từ ngày */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-400 font-medium">Từ ngày</label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                    className="bg-darkCardV1 border-darkBorderV1 w-full pl-9 pr-3 text-neutral-300"
                                />
                                <Icon path={mdiCalendarRange} size={0.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Đến ngày */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-400 font-medium">Đến ngày</label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                    className="bg-darkCardV1 border-darkBorderV1 w-full pl-9 pr-3 text-neutral-300"
                                />
                                <Icon path={mdiCalendarRange} size={0.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Tổng doanh thu */}
                    <motion.div whileHover={{ y: -4 }} className="h-full">
                        <Card className="bg-gradient-to-br from-accent/5 to-transparent bg-darkCardV1/40 border-darkBorderV1 hover:border-accent/40 transition-all h-full">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Tổng doanh thu</p>
                                    <h3 className="text-xl font-bold text-neutral-200">{(stats.totalRevenue || 0).toLocaleString()} đ</h3>
                                    <p className="text-xs text-neutral-400 italic">{stats.count || 0} lượt thanh toán</p>
                                </div>
                                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                                    <Icon path={mdiFinance} size={1} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Card 2: Tiền mặt */}
                    <motion.div whileHover={{ y: -4 }} className="h-full">
                        <Card className="bg-gradient-to-br from-green-500/5 to-transparent bg-darkCardV1/40 border-darkBorderV1 hover:border-green-500/40 transition-all h-full">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Doanh thu Tiền mặt</p>
                                    <h3 className="text-xl font-bold text-green-400">{(cashRevenue).toLocaleString()} đ</h3>
                                    <p className="text-xs text-neutral-400 italic">Thanh toán trực tiếp tại quầy</p>
                                </div>
                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                                    <Icon path={mdiCash} size={1} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Card 3: VNPay */}
                    <motion.div whileHover={{ y: -4 }} className="h-full">
                        <Card className="bg-gradient-to-br from-blue-500/5 to-transparent bg-darkCardV1/40 border-darkBorderV1 hover:border-blue-500/40 transition-all h-full">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Doanh thu VNPay</p>
                                    <h3 className="text-xl font-bold text-blue-400">{(vnpayRevenue).toLocaleString()} đ</h3>
                                    <p className="text-xs text-neutral-400 italic">Thẻ ATM / QR VNPay</p>
                                </div>
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                    <Icon path={mdiCreditCardOutline} size={1} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Card 4: MoMo */}
                    <motion.div whileHover={{ y: -4 }} className="h-full">
                        <Card className="bg-gradient-to-br from-pink-500/5 to-transparent bg-darkCardV1/40 border-darkBorderV1 hover:border-pink-500/40 transition-all h-full">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Doanh thu Ví MoMo</p>
                                    <h3 className="text-xl font-bold text-pink-400">{(momoRevenue).toLocaleString()} đ</h3>
                                    <p className="text-xs text-neutral-400 italic">Cổng thanh toán MoMo</p>
                                </div>
                                <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                                    <Icon path={mdiWallet} size={1} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Table Section */}
                <AdminRevenueTable
                    transactions={transactions}
                    isLoading={isLoading || isFetching}
                    page={page}
                    pageSize={10}
                />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                        <Pagination
                            page={page}
                            pageSize={10}
                            total={pagination.total}
                            totalPages={pagination.totalPages}
                            onPageChange={(p) => setPage(p)}
                        />
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
