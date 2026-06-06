"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminChartDataV2, useAdminLeaderboards, useAdminOverview, useAdminPendingActions } from "@/hooks/useAdmin";
import { mdiAccountGroup, mdiAlertOctagon, mdiCalendarCheck, mdiChartLine, mdiChevronRight, mdiFinance, mdiMapMarkerRadius, mdiStorefront, mdiTune, mdiAccountCancel, mdiCrown, mdiArrowUpRight, mdiArrowDownRight, mdiFormatListChecks } from "@mdi/js";
import { Icon } from "@mdi/react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";
import { RevenuePredictionDialog } from "@/components/OwnerDashboard/RevenuePredictionDialog";

// Helper to format Date to YYYY-MM-DD
const getFormattedDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

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

export default function AdminDashboardPage() {
  const [rangeType, setRangeType] = useState<string>("30");
  
  const todayStr = getFormattedDate(new Date());
  const thirtyDaysAgoStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return getFormattedDate(d);
  })();

  const [customStartDate, setCustomStartDate] = useState<string>(thirtyDaysAgoStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  const { startDate, endDate } = getRangeDates(rangeType, customStartDate, customEndDate);

  const chartParams = { startDate, endDate };

  // Fetch Data
  const { data: overviewRes, isLoading: isOverviewLoading } = useAdminOverview(chartParams);
  const { data: actionsRes, isLoading: isActionsLoading } = useAdminPendingActions();
  const { data: chartRes, isLoading: isChartLoading } = useAdminChartDataV2(chartParams);
  const { data: leaderboardsRes, isLoading: isLeaderboardsLoading } = useAdminLeaderboards(chartParams);

  const overview = overviewRes?.data || {};
  const pendingActions = actionsRes?.data || {};
  const chartData = chartRes?.data || [];
  const topVenues = leaderboardsRes?.data?.topVenues || [];
  const riskVenues = leaderboardsRes?.data?.riskVenues || [];

  let formattedChartData = chartData.map((item: any) => {
    const dateParts = item.date.split('-');
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : item.date;
    return { name: formattedDate, revenue: item.revenue || 0, bookings: item.bookings || 0 };
  });

  if (formattedChartData.length === 1) {
    formattedChartData.unshift({
      name: `Trước ${formattedChartData[0].name}`,
      revenue: 0,
      bookings: 0
    });
  }

  const isLoading = isOverviewLoading || isActionsLoading || isChartLoading || isLeaderboardsLoading;

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
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-300">Bảng điều khiển hệ thống</h1>
          <p className="text-neutral-400 text-base mt-1">Giám sát tổng thể hoạt động của nền tảng.</p>
        </div>
        <RevenuePredictionDialog />
      </header>

      {/* KHOANG 1: OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <Card className="bg-darkCardV1/40 border-darkBorderV1 hover:border-accent/40 transition-all group overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon path={mdiFinance} size={1} />
              </div>
              {overview.revenueGrowth !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${overview.revenueGrowth >= 0 ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-500'}`}>
                  <Icon path={overview.revenueGrowth >= 0 ? mdiArrowUpRight : mdiArrowDownRight} size={0.5} />
                  {Math.abs(overview.revenueGrowth)}%
                </div>
              )}
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Doanh thu nền tảng</p>
              <h3 className="text-2xl font-bold text-neutral-200 mt-1">
                {(overview.totalRevenue || 0).toLocaleString()} đ
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Lượt đặt */}
        <Card className="bg-darkCardV1/40 border-darkBorderV1 hover:border-blue-500/40 transition-all group overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon path={mdiCalendarCheck} size={1} />
              </div>
              {overview.bookingGrowth !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${overview.bookingGrowth >= 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                  <Icon path={overview.bookingGrowth >= 0 ? mdiArrowUpRight : mdiArrowDownRight} size={0.5} />
                  {Math.abs(overview.bookingGrowth)}%
                </div>
              )}
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Tổng lượt đặt sân</p>
              <h3 className="text-2xl font-bold text-neutral-200 mt-1">
                {(overview.totalBookings || 0).toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Người dùng */}
        <Card className="bg-darkCardV1/40 border-darkBorderV1 hover:border-purple-500/40 transition-all group overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon path={mdiAccountGroup} size={1} />
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Tổng số người dùng</p>
              <h3 className="text-2xl font-bold text-neutral-200 mt-1">
                {(overview.totalUsers?.total || 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                {overview.totalUsers?.players || 0} Khách | {overview.totalUsers?.owners || 0} Chủ sân
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cơ sở hoạt động */}
        <Card className="bg-darkCardV1/40 border-darkBorderV1 hover:border-amber-500/40 transition-all group overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon path={mdiStorefront} size={1} />
              </div>
              {overview.venuesGrowth !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${overview.venuesGrowth >= 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                  <Icon path={overview.venuesGrowth >= 0 ? mdiArrowUpRight : mdiArrowDownRight} size={0.5} />
                  {Math.abs(overview.venuesGrowth)}%
                </div>
              )}
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Cơ sở đang hoạt động</p>
              <h3 className="text-2xl font-bold text-neutral-200 mt-1">
                {(overview.activeVenues || 0).toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KHOANG 2: CHARTS & PENDING ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="bg-darkCardV1/40 border-darkBorderV1 h-[420px] flex flex-col">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4 mx-4 bg-transparent">
              <div className="flex items-center gap-2">
                <Icon path={mdiChartLine} size={0.8} className="text-accent" />
                <CardTitle className="text-lg font-semibold text-accent bg-transparent">Tăng trưởng Doanh thu & Lượt đặt</CardTitle>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-8 h-8 flex items-center justify-center rounded-md bg-darkCardV1 border border-darkBorderV1 hover:bg-darkBorderV1 transition-colors text-neutral-300">
                    <Icon path={mdiTune} size={0.7} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 bg-darkCardV1 border-darkBorderV1 flex flex-col gap-3 rounded-xl shadow-xl z-50">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-400">Thời gian hiển thị</label>
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
                <AreaChart data={formattedChartData}>
                  <defs>
                    <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#41C651" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#41C651" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2F32" vertical={false} />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} dy={10} minTickGap={20} />
                  <YAxis yAxisId="left" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val.toLocaleString()} />
                  <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0A1F22] border border-[#1A2F32] p-3 rounded-xl shadow-lg">
                            <p className="text-neutral-400 text-xs font-semibold mb-1">{data.name}</p>
                            <p className="text-accent text-sm font-bold">
                              Doanh thu: <span className="text-white">{data.revenue?.toLocaleString()} đ</span>
                            </p>
                            <p className="text-blue-400 text-sm font-bold mt-0.5">
                              Lượt đặt: <span className="text-white">{data.bookings?.toLocaleString()}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#41C651" fillOpacity={1} fill="url(#colorAdminRev)" strokeWidth={3} />
                  <Area yAxisId="right" type="monotone" dataKey="bookings" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        <div className="lg:col-span-1">
          <Card className="bg-darkCardV1/40 border-darkBorderV1 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
            <CardHeader className="border-b border-darkBorderV1/50 pb-3 bg-transparent z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <Icon path={mdiFormatListChecks} size={0.7} />
                </div>
                <CardTitle className="text-[16px] font-semibold text-accent">Cần Xử Lý Ngay</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col gap-3 z-10">
              {/* Duyệt mở sân */}
              <Link href="/admin/owner-requests" className="flex items-center justify-between p-3 rounded-xl bg-darkBackgroundV1/50 border border-darkBorderV1 hover:border-accent/40 hover:bg-darkBorderV1/20 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon path={mdiStorefront} size={0.6} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-200">Duyệt mở sân mới</p>
                    <p className="text-[11px] text-neutral-400">Yêu cầu từ Chủ sân</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${pendingActions.pendingOwnerRequests > 0 ? 'text-blue-500' : 'text-neutral-500'}`}>
                    {pendingActions.pendingOwnerRequests || 0}
                  </span>
                  <Icon path={mdiChevronRight} size={0.7} className="text-neutral-500" />
                </div>
              </Link>

              {/* Duyệt đóng sân */}
              <Link href="/admin/venues?status=PENDING" className="flex items-center justify-between p-3 rounded-xl bg-darkBackgroundV1/50 border border-darkBorderV1 hover:border-amber-500/40 hover:bg-darkBorderV1/20 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon path={mdiAlertOctagon} size={0.6} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-200">Yêu cầu đóng sân</p>
                    <p className="text-[11px] text-neutral-400">Cần admin xác nhận</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${pendingActions.pendingClosureRequests > 0 ? 'text-amber-500' : 'text-neutral-500'}`}>
                    {pendingActions.pendingClosureRequests || 0}
                  </span>
                  <Icon path={mdiChevronRight} size={0.7} className="text-neutral-500" />
                </div>
              </Link>

              {/* Báo cáo người dùng */}
              <Link href="/admin/users" className="flex items-center justify-between p-3 rounded-xl bg-darkBackgroundV1/50 border border-darkBorderV1 hover:border-red-500/40 hover:bg-darkBorderV1/20 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon path={mdiAccountCancel} size={0.6} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-200">User vi phạm/bị khóa</p>
                    <p className="text-[11px] text-neutral-400">Danh sách đen</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${pendingActions.flaggedUsers > 0 ? 'text-red-500' : 'text-neutral-500'}`}>
                    {pendingActions.flaggedUsers || 0}
                  </span>
                  <Icon path={mdiChevronRight} size={0.7} className="text-neutral-500" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* KHOANG 3: LEADERBOARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Doanh Thu */}
        <Card className="bg-darkCardV1/40 border-darkBorderV1 h-full flex flex-col">
          <CardHeader className="border-b border-darkBorderV1/50 pb-3 bg-transparent">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                <Icon path={mdiCrown} size={0.7} />
              </div>
              <CardTitle className="text-[16px] font-semibold text-yellow-500">Top 5 Cơ Sở Xuất Sắc</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {topVenues.length === 0 ? (
              <div className="p-6 text-center text-neutral-500 text-sm">Chưa có dữ liệu.</div>
            ) : (
              <div className="flex flex-col">
                {topVenues.map((venue: any, idx: number) => {
                  const topRev = topVenues[0].totalRevenue || 1;
                  const percent = Math.min((venue.totalRevenue / topRev) * 100, 100);
                  return (
                    <div key={idx} className="flex flex-col p-4 border-b border-darkBorderV1/30 last:border-0 hover:bg-darkBorderV1/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-neutral-500 w-4">{idx + 1}.</span>
                          <div>
                            <p className="font-semibold text-[14px] text-white">{venue.venueName || "Sân cầu lông"}</p>
                            <p className="text-[11px] text-neutral-400">Chủ sân: {venue.ownerName || "Đang cập nhật"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[14px] text-accent">{(venue.totalRevenue || 0).toLocaleString()} đ</p>
                          <p className="text-[11px] text-neutral-500">{venue.totalBookings || 0} lượt đặt</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-darkBackgroundV1/60 rounded-full h-1.5 ml-7">
                        <div className="bg-yellow-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Rủi Ro */}
        <Card className="bg-darkCardV1/40 border-darkBorderV1 h-full flex flex-col">
          <CardHeader className="border-b border-darkBorderV1/50 pb-3 bg-transparent">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                <Icon path={mdiAlertOctagon} size={0.7} />
              </div>
              <CardTitle className="text-[16px] font-semibold text-red-500">Cơ Sở Báo Động (Hủy/Bom sân)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {riskVenues.length === 0 ? (
              <div className="p-6 text-center text-neutral-500 text-sm">Tuyệt vời! Không có cơ sở nào rủi ro.</div>
            ) : (
              <div className="flex flex-col">
                {riskVenues.map((venue: any, idx: number) => {
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 border-b border-darkBorderV1/30 last:border-0 hover:bg-darkBorderV1/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-neutral-500 w-4">{idx + 1}.</span>
                        <div>
                          <p className="font-semibold text-[14px] text-white">{venue.venueName || "Sân cầu lông"}</p>
                          <p className="text-[11px] text-neutral-400">{venue.totalCancelled || 0} đơn đã hủy</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[14px] text-red-500">{venue.cancelRate || 0}% tỉ lệ hủy</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
