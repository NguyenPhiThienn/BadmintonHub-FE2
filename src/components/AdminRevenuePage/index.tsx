"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePickerInput } from "@/components/ui/date-picker-input";
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
    mdiTune,
    mdiClose
} from "@mdi/js";
import Icon from "@mdi/react";
import { AnimatePresence, motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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
        search: searchQuery || undefined,
    });

    const reportData = reportResponse?.data || {};
    const transactions = reportData.transactions || [];
    const stats = reportData.stats || {
        totalRevenue: 0,
        count: 0,
        cashRevenue: 0,
        vnpayRevenue: 0,
    };
    const cashRevenue = stats.cashRevenue ?? stats.cashTotal ?? stats.CASH ?? 0;
    const vnpayRevenue = stats.vnpayRevenue ?? stats.vnpayTotal ?? stats.VNPAY ?? 0;
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
        setSearchQuery("");
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

                    {/* Removed buttons from here */}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <div className="relative w-full md:w-[350px]">
                        <Icon path={mdiMagnify} size={0.9} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10" />
                        <Input
                            placeholder="Tìm theo mã GD, SĐT hoặc tên khách hàng..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="pl-10 pr-10 py-2.5 w-full bg-darkBackgroundV1 border-darkBorderV1 rounded-xl text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setPage(1);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors z-10"
                            >
                                <Icon path={mdiClose} size={0.8} />
                            </button>
                        )}
                    </div>

                    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="relative shrink-0 gap-2 h-[42px] border-darkBorderV1 bg-darkBackgroundV1/50 rounded-xl">
                                <Icon path={mdiTune} size={0.8} />
                                <span className="font-medium">Lọc nâng cao</span>
                                {(method !== "all" || ownerId !== "all" || venueId !== "all" || startDate || endDate) && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent border-2 border-darkCardV1" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-5 bg-darkCardV1 border-darkBorderV1 shadow-2xl rounded-2xl" align="start">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-darkBorderV1 pb-3">
                                    <h4 className="font-semibold text-white">Bộ lọc tìm kiếm</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-neutral-400 hover:text-white"
                                        onClick={handleResetFilters}
                                    >
                                        Xóa tất cả
                                    </Button>
                                </div>

                                {/* Phương thức */}
                                <div className="space-y-1.5">
                                    <label className="text-xs text-neutral-400 font-medium">Phương thức thanh toán</label>
                                    <Select value={method} onValueChange={(val) => { setMethod(val); setPage(1); }}>
                                        <SelectTrigger className="w-full bg-darkBackgroundV1 border-darkBorderV1">
                                            <SelectValue placeholder="Tất cả phương thức" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả phương thức</SelectItem>
                                            <SelectItem value="CASH">Tiền mặt</SelectItem>
                                            <SelectItem value="VNPAY">VNPay</SelectItem>
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

                                {/* Từ ngày - Đến ngày */}
                                <div className="space-y-2">
                                    <label className="text-xs text-neutral-400 font-medium">Khoảng thời gian</label>
                                    <div className="flex flex-col gap-2 w-full">
                                        <DatePickerInput
                                            value={startDate}
                                            onChange={(val) => { setStartDate(val); setPage(1); }}
                                            placeholder="Từ ngày"
                                            className="w-full"
                                        />
                                        <DatePickerInput
                                            value={endDate}
                                            onChange={(val) => { setEndDate(val); setPage(1); }}
                                            placeholder="Đến ngày"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="h-[42px] w-[42px] shrink-0 border-darkBorderV1 bg-darkBackgroundV1/50 rounded-xl hover:bg-darkCardV1 transition-colors sm:ml-auto self-end sm:self-auto"
                        title="Làm mới dữ liệu"
                    >
                        <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin text-accent" : "text-neutral-400"} />
                    </Button>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1: Tổng doanh thu */}
                    <motion.div whileHover={{ y: -4 }} className="h-full">
                        <Card className="bg-gradient-to-br from-accent/5 to-transparent bg-darkCardV1/40 border-darkBorderV1 hover:border-accent/40 transition-all h-full">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Tổng doanh thu</p>
                                    <h3 className="text-2xl font-bold text-neutral-100">{(stats.totalRevenue || 0).toLocaleString()} đ</h3>
                                    <p className="text-xs text-neutral-400 italic">Từ {stats.count || 0} lượt giao dịch</p>
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
                                    <h3 className="text-2xl font-bold text-green-400">{(cashRevenue).toLocaleString()} đ</h3>
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
                                    <h3 className="text-2xl font-bold text-blue-400">{(vnpayRevenue).toLocaleString()} đ</h3>
                                    <p className="text-xs text-neutral-400 italic">Thanh toán Online / QR VNPay</p>
                                </div>
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                    <Icon path={mdiCreditCardOutline} size={1} />
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
