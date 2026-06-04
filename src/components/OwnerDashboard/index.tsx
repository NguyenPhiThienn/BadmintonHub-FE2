"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/useAuth";
import { useOccupancyStats, useRevenueChart, useOverviewStats, useRecentBookings, useTopCustomers, usePeakHours } from "@/hooks/useOwner";
import { useMyVenues } from "@/hooks/useVenue";
import { IOccupancyData } from "@/interface/owner";
import { mdiChartBar, mdiChartLine, mdiTune } from "@mdi/js";
import { Icon } from "@mdi/react";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RevenuePredictionDialog } from "./RevenuePredictionDialog";
import { DashboardOverviewCards } from "./DashboardOverviewCards";
import { DashboardRecentBookings } from "./DashboardRecentBookings";
import { DashboardTopCustomers } from "./DashboardTopCustomers";
import { DashboardPeakHours } from "./DashboardPeakHours";

// Helper to format Date to YYYY-MM-DD
const getFormattedDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Helper to compute start and end dates based on range selection
const getRangeDates = (type: string, customStart: string, customEnd: string) => {
  const end = new Date();
  const start = new Date();
  
  if (type === "7") {
    start.setDate(end.getDate() - 7);
  } else if (type === "month") {
    start.setDate(1); // Start of month
  } else if (type === "custom") {
    return { startDate: customStart, endDate: customEnd };
  } else {
    start.setDate(end.getDate() - 30);
  }
  
  return {
    startDate: getFormattedDate(start),
    endDate: getFormattedDate(end),
  };
};

export default function OwnerDashboard() {
  const { data: profileRes } = useMe();
  const userId = profileRes?.data?._id;

  const [selectedVenueId, setSelectedVenueId] = useState<string>("all");
  const [rangeType, setRangeType] = useState<string>("30");
  const [paymentMethod, setPaymentMethod] = useState<string>("all");

  const todayStr = getFormattedDate(new Date());
  const thirtyDaysAgoStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return getFormattedDate(d);
  })();

  const [customStartDate, setCustomStartDate] = useState<string>(thirtyDaysAgoStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  const { data: venuesRes } = useMyVenues({ page: 1, limit: 100 });
  const venues = venuesRes?.data?.venues || [];

  const { startDate, endDate } = getRangeDates(rangeType, customStartDate, customEndDate);

  const globalParams = selectedVenueId !== "all" ? { venueId: selectedVenueId } : {};

  // Fetch New API Data
  const { data: overviewRes, isLoading: isOverviewLoading } = useOverviewStats(globalParams);
  const { data: recentRes, isLoading: isRecentLoading } = useRecentBookings(globalParams);
  const { data: topCustRes, isLoading: isTopCustLoading } = useTopCustomers(globalParams);
  const { data: peakRes, isLoading: isPeakLoading } = usePeakHours(globalParams);

  // Fetch Chart Data
  const chartParams = { ...globalParams, startDate, endDate };
  const revenueChartParams = { ...chartParams, ...(paymentMethod !== "all" ? { method: paymentMethod } : {}) };

  const { data: occupancyRes, isLoading: isOccupancyLoading } = useOccupancyStats(chartParams);
  const { data: revenueChartRes, isLoading: isRevenueChartLoading } = useRevenueChart(revenueChartParams);

  // Computed Values
  const overviewData = overviewRes?.data || {};
  const recentBookings = recentRes?.data || [];
  const topVIPs = topCustRes?.data?.topVIPs || [];
  const topRisks = topCustRes?.data?.topRisks || [];
  
  const rawPeakData = peakRes?.data || [];
  const peakData = Array.isArray(rawPeakData) ? rawPeakData : [];

  const occupancyData = occupancyRes?.data?.occupancyData || [];
  const revenueChartData = revenueChartRes?.data || [];

  let formattedRevenueData = revenueChartData.map((item: any) => {
    const dateParts = item.date.split('-');
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : item.date;
    return { name: formattedDate, value: item.revenue || 0, count: item.count || 0 };
  });

  if (formattedRevenueData.length === 1) {
    // Add a dummy point so the AreaChart renders a line instead of just a dot
    formattedRevenueData.unshift({
      name: `Trước ${formattedRevenueData[0].name}`,
      value: 0,
      count: 0
    });
  }

  const formattedOccupancyData = occupancyData.map((item: IOccupancyData) => {
    const dateParts = item.date.split('-');
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : item.date;
    return { name: formattedDate, rate: Math.round((item.occupancyRate || 0) * 10) / 10 };
  });

  // Inject computed occupancy into overviewData if not provided by BE
  const avgOccupancy = occupancyData.length 
    ? (occupancyData.reduce((acc: number, curr: any) => acc + (curr.occupancyRate || 0), 0) / occupancyData.length).toFixed(1)
    : 0;
  if (!overviewData.occupancyRate) {
    overviewData.occupancyRate = avgOccupancy;
  }

  const isLoading = isOverviewLoading || isOccupancyLoading || isRevenueChartLoading || isRecentLoading || isTopCustLoading || isPeakLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full bg-darkCardV1/40 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Skeleton className="lg:col-span-2 h-[400px] bg-darkCardV1/40 rounded-2xl" />
           <Skeleton className="h-[400px] bg-darkCardV1/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER TỔNG QUAN VÀ BỘ LỌC CHUNG */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-300">Tổng quan kinh doanh</h1>
          <p className="text-neutral-400 text-base mt-1">Theo dõi hiệu suất và doanh thu của các cơ sở sân.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Chọn cơ sở" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cơ sở</SelectItem>
              {venues.map((v: any) => (
                <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <RevenuePredictionDialog venueId={selectedVenueId} />
        </div>
      </header>

      {/* KHOANG 1: TỔNG QUAN KPI CÓ TREND */}
      <DashboardOverviewCards data={overviewData} />

      {/* KHOANG 2: PHÂN TÍCH CHUYÊN SÂU (BIỂU ĐỒ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ doanh thu - chiếm 2 cột */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="bg-darkCardV1/40 border-darkBorderV1 h-[420px] flex flex-col">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4 mx-4 bg-transparent">
              <div className="flex items-center gap-2">
                <Icon path={mdiChartLine} size={0.8} className="text-accent" />
                <CardTitle className="text-lg font-semibold text-accent bg-transparent">Biểu đồ doanh thu</CardTitle>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-8 h-8 flex items-center justify-center rounded-md bg-darkCardV1 border border-darkBorderV1 hover:bg-darkBorderV1 transition-colors text-neutral-300">
                    <Icon path={mdiTune} size={0.7} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 bg-darkCardV1 border-darkBorderV1 flex flex-col gap-3 rounded-xl shadow-xl z-50">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-400">Phương thức thanh toán</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="w-full h-8 bg-darkBackgroundV1/50 border-darkBorderV1/50 text-[13px] text-neutral-300">
                        <SelectValue placeholder="Phương thức" />
                      </SelectTrigger>
                      <SelectContent className="bg-darkCardV1 border-darkBorderV1 text-[13px] text-neutral-200">
                        <SelectItem value="all">Tất cả thanh toán</SelectItem>
                        <SelectItem value="VNPAY">VNPAY</SelectItem>
                        <SelectItem value="CASH">Tiền mặt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-400">Thời gian</label>
                    <Select value={rangeType} onValueChange={setRangeType}>
                      <SelectTrigger className="w-full h-8 bg-darkBackgroundV1/50 border-darkBorderV1/50 text-[13px] text-neutral-300">
                        <SelectValue placeholder="Thời gian" />
                      </SelectTrigger>
                      <SelectContent className="bg-darkCardV1 border-darkBorderV1 text-[13px] text-neutral-200">
                        <SelectItem value="7">7 ngày qua</SelectItem>
                        <SelectItem value="30">30 ngày qua</SelectItem>
                        <SelectItem value="month">Tháng này</SelectItem>
                        <SelectItem value="custom">Tùy chỉnh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {rangeType === "custom" && (
                    <div className="flex flex-col gap-1.5 pt-1 border-t border-darkBorderV1/30">
                      <label className="text-xs font-semibold text-neutral-400">Khoảng ngày</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="flex-1 bg-darkBackgroundV1/50 border border-darkBorderV1/50 text-neutral-300 text-[12px] h-8 px-2 rounded-md focus:outline-none custom-date-input"
                        />
                        <span className="text-neutral-500 text-[11px]">-</span>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="flex-1 bg-darkBackgroundV1/50 border border-darkBorderV1/50 text-neutral-300 text-[12px] h-8 px-2 rounded-md focus:outline-none custom-date-input"
                        />
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#41C651" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#41C651" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2F32" vertical={false} />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} dy={10} minTickGap={20} />
                  <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val.toLocaleString()} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0A1F22] border border-[#1A2F32] p-3 rounded-xl shadow-lg">
                            <p className="text-neutral-400 text-xs font-semibold mb-1">{data.name}</p>
                            <p className="text-accent text-sm font-bold">
                              Doanh thu: <span className="text-white">{data.value?.toLocaleString()} đ</span>
                            </p>
                            <p className="text-neutral-300 text-xs mt-0.5">
                              Số lượng đặt: <span className="font-semibold">{data.count} đơn</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#41C651" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Biểu đồ lấp đầy giờ vàng (MỚI) - chiếm 1 cột */}
        <div className="lg:col-span-1">
          <DashboardPeakHours data={peakData} />
        </div>
      </div>

      {/* KHOANG 3: VÙNG HÀNH ĐỘNG NHANH & HOẠT ĐỘNG GẦN ĐÂY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Khách Hàng (VIP & Báo Động) - chiếm 2 cột */}
        <div className="lg:col-span-2">
          <DashboardTopCustomers topVIPs={topVIPs} topRisks={topRisks} />
        </div>
        {/* Đơn hàng gần đây - chiếm 1 cột */}
        <div className="lg:col-span-1">
          <DashboardRecentBookings bookings={recentBookings} />
        </div>
      </div>

      {/* KHOANG 4: BIỂU ĐỒ HIỆU SUẤT KHAI THÁC DÀI */}
      <div className="grid grid-cols-1">
        <Card className="bg-darkCardV1/40 border-darkBorderV1">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-neutral-800 pb-4 mx-4 bg-transparent">
            <Icon path={mdiChartBar} size={0.8} className="text-accent" />
            <CardTitle className="text-lg font-semibold text-accent bg-transparent">Hiệu suất khai thác theo ngày</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2F32" vertical={false} />
                <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} dy={10} minTickGap={20} />
                <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0A1F22", border: "1px solid #1A2F32", borderRadius: "12px" }}
                  itemStyle={{ color: "#a3a3a3" }}
                  formatter={(value: number) => [`${value}%`, "Hiệu suất khai thác"]}
                />
                <Bar dataKey="rate" fill="#41C651" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
