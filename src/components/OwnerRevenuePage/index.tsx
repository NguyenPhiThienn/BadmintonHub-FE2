"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useMe } from "@/hooks/useAuth";
import { useOwnerRevenueReport } from "@/hooks/useOwner";
import { useMyVenues } from "@/hooks/useVenue";
import {
    mdiCash,
    mdiChevronRight,
    mdiCreditCardOutline,
    mdiFinance,
    mdiMagnify,
    mdiRefresh
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { OwnerRevenueTable } from "./OwnerRevenueTable";

export default function OwnerRevenuePage() {
    const [page, setPage] = useState(1);
    const [method, setMethod] = useState("all");
    const [venueId, setVenueId] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const { isMobile } = useResponsive();
    const isFirstRender = useRef(true);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            if (!isFirstRender.current) setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        isFirstRender.current = false;
    }, []);

    const { data: meRes } = useMe();
    const ownerId = meRes?.data?.id;

    const { data: venuesRes } = useMyVenues({ limit: 200 });
    const venues = venuesRes?.data?.venues || [];

    const {
        data: reportResponse,
        isLoading,
        isFetching,
        refetch,
    } = useOwnerRevenueReport({
        page,
        limit: 10,
        method: method !== "all" ? method : undefined,
        venueId: venueId !== "all" ? venueId : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        ownerId,
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
    const pagination = reportData.pagination || { total: 0, totalPages: 1 };
    return (
        <TooltipProvider>
            <div className="space-y-4 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-gray-500">Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator>
                                <Icon path={mdiChevronRight} size={0.6} />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Quản lý doanh thu</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Tổng doanh thu */}
                        <motion.div whileHover={{ y: -4 }} className="col-span-2 md:col-span-1">
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

                        {/* Tiền mặt */}
                        <motion.div whileHover={{ y: -4 }}>
                            <Card className="bg-gradient-to-br from-green-500/5 to-transparent bg-darkCardV1/40 border-darkBorderV1 hover:border-green-500/40 transition-all h-full">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Tiền mặt</p>
                                        <h3 className="text-xl font-bold text-green-400">{(cashRevenue).toLocaleString()} đ</h3>
                                        <p className="text-xs text-neutral-400 italic">Thanh toán tại quầy</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                                        <Icon path={mdiCash} size={1} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* VNPay */}
                        <motion.div whileHover={{ y: -4 }}>
                            <Card className="bg-gradient-to-br from-blue-500/5 to-transparent bg-darkCardV1/40 border-darkBorderV1 hover:border-blue-500/40 transition-all h-full">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">VNPay</p>
                                        <h3 className="text-xl font-bold text-blue-400">{(vnpayRevenue).toLocaleString()} đ</h3>
                                        <p className="text-xs text-neutral-400 italic">Thẻ ATM / QR VNPay</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                        <Icon path={mdiCreditCardOutline} size={1} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Filter + Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            {/* Search */}
                            <div className="relative w-full md:w-60 flex-1">
                                <Input
                                    placeholder="Tìm mã giao dịch, khách hàng..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 py-2 w-full"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                            </div>

                            {/* Phương thức */}
                            <Select value={method} onValueChange={(val) => { setMethod(val); setPage(1); }}>
                                <SelectTrigger className="w-full md:w-[250px]">
                                    <SelectValue placeholder="Phương thức" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả phương thức</SelectItem>
                                    <SelectItem value="CASH">Tiền mặt</SelectItem>
                                    <SelectItem value="VNPAY">VNPay</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Cơ sở sân */}
                            <Select value={venueId} onValueChange={(val) => { setVenueId(val); setPage(1); }}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Cơ sở sân" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả cơ sở</SelectItem>
                                    {venues.map((v: any) => (
                                        <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            title="Làm mới"
                        >
                            <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                            {!isMobile && "Làm mới"}
                        </Button>
                    </div>

                    {/* Table */}
                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <OwnerRevenueTable
                            transactions={transactions}
                            isLoading={isLoading || isFetching}
                            page={page}
                            pageSize={10}
                        />
                    </Card>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center pt-2">
                            <Pagination
                                page={page}
                                pageSize={10}
                                total={pagination.total}
                                totalPages={pagination.totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </motion.div>
            </div>
        </TooltipProvider>
    );
}
