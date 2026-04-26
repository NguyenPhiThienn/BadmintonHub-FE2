"use client";

import { useChartData, useSummaryStats } from "@/hooks/useAdmin";
import { mdiTrendingDown, mdiTrendingUp, mdiMapMarkerRadius, mdiCalendarCheck, mdiAccountGroup, mdiFinance, mdiPlaylistRemove } from "@mdi/js";
import { Icon } from "@mdi/react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// --- Sub-components ---

const StatCard = ({ title, data, icon, color }: any) => {
  const isUp = data?.trend === "up";
  const sparklineData = data?.sparkline?.map((val: number, i: number) => ({ value: val, index: i }));

  return (
    <Card className="bg-darkCardV1/40 border-darkBorderV1 hover:border-accent/40 transition-all group h-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
            <Icon path={icon} size={1} />
          </div>
          <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isUp ? "#41C651" : "#F87171"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <p className="text-neutral-400 text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-white">
              {data?.currency === "VND" ? (data?.value / 1000000).toFixed(1) + "M" : data?.value?.toLocaleString()}
              {data?.unit === "percent" ? "%" : ""}
            </h3>
            <div className={`flex items-center text-xs font-bold ${isUp ? "text-accent" : "text-red-400"}`}>
              <Icon path={isUp ? mdiTrendingUp : mdiTrendingDown} size={0.6} />
              {Math.abs(data?.growth || 0)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatCardsGrid = ({ summary }: { summary: any }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Doanh thu" data={summary?.totalRevenue} icon={mdiFinance} color="accent" />
      <StatCard title="Lượt đặt" data={summary?.totalBookings} icon={mdiCalendarCheck} color="blue-400" />
      <StatCard title="Người dùng" data={summary?.newUsers} icon={mdiAccountGroup} color="purple-400" />
      <StatCard title="Tỉ lệ lấp đầy" data={summary?.occupancyRate} icon={mdiMapMarkerRadius} color="orange-400" />
    </div>
  );
};

const RevenueFlowChart = ({ chartData }: { chartData: any }) => {
  const formattedData = chartData?.labels?.map((label: string, i: number) => ({
    name: label,
    actual: chartData.datasets[0].data[i],
    forecast: chartData.datasets[1].data[i],
  }));

  return (
    <Card className="bg-darkCardV1/40 border-darkBorderV1 h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">Biểu đồ doanh thu & Dự báo AI</CardTitle>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <div className="w-3 h-3 rounded-full bg-accent" /> Thực tế
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <div className="w-3 h-3 rounded-full bg-yellow-400" /> Dự báo AI
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full pb-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#41C651" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#41C651" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000000}M`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0A1F22", border: "1px solid #1A2F32", borderRadius: "12px" }}
              itemStyle={{ color: "#fff" }}
            />
            <Area type="monotone" dataKey="actual" stroke="#41C651" fillOpacity={1} fill="url(#colorActual)" strokeWidth={3} />
            <Area type="monotone" dataKey="forecast" stroke="#FACC15" fill="transparent" strokeDasharray="5 5" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const TopPerformingVenues = () => {
  // Mock data as not provided in API yet, but required by design
  const topVenues = [
    { name: "Sân Cầu Lông Thống Nhất", bookings: 450, revenue: "27.5M", growth: "+12%" },
    { name: "Badminton Hub Quận 7", bookings: 380, revenue: "22.0M", growth: "+8%" },
    { name: "Sân Thành Công Gò Vấp", bookings: 310, revenue: "18.6M", growth: "+15%" },
    { name: "Sân ABC Bình Thạnh", bookings: 290, revenue: "17.2M", growth: "-3%" },
    { name: "Viking Badminton Center", bookings: 250, revenue: "15.0M", growth: "+5%" },
  ];

  return (
    <Card className="bg-darkCardV1/40 border-darkBorderV1">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Top 5 Sân có doanh thu cao nhất</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left w-[50px]">STT</TableHead>
              <TableHead className="text-left">Tên sân</TableHead>
              <TableHead>Lượt đặt</TableHead>
              <TableHead>Doanh thu</TableHead>
              <TableHead>Tăng trưởng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topVenues.map((venue, i) => (
              <TableRow key={i}>
                <TableCell className="text-center font-bold">{i + 1}</TableCell>
                <TableCell className="text-left font-medium text-white">{venue.name}</TableCell>
                <TableCell>{venue.bookings}</TableCell>
                <TableCell className="text-accent font-bold">{venue.revenue}</TableCell>
                <TableCell>
                  <Badge variant={venue.growth.startsWith("+") ? "green" : "neutral"} className="px-2 py-0.5">
                    {venue.growth}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const ActiveUsersMap = () => {
  return (
    <Card className="bg-darkCardV1/40 border-darkBorderV1 h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Phân bố người dùng Real-time</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-[300px]">
        {/* Placeholder for Map distribution */}
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 bg-accent/10 rounded-full animate-ping opacity-20" />
          <div className="absolute inset-4 bg-accent/20 rounded-full animate-pulse opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h4 className="text-4xl font-bold text-accent">152</h4>
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Online Now</p>
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 w-full px-4">
          <div className="bg-darkBackgroundV1/60 p-3 rounded-xl border border-darkBorderV1">
            <p className="text-[10px] text-neutral-500 uppercase font-bold">TP. Hồ Chí Minh</p>
            <p className="text-lg font-bold text-white">82%</p>
          </div>
          <div className="bg-darkBackgroundV1/60 p-3 rounded-xl border border-darkBorderV1">
            <p className="text-[10px] text-neutral-500 uppercase font-bold">Khu vực khác</p>
            <p className="text-lg font-bold text-white">18%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main Page Component ---

export default function AdminDashboardPage() {
  const { data: summaryRes, isLoading: isSummaryLoading } = useSummaryStats();
  const { data: chartRes, isLoading: isChartLoading } = useChartData();

  if (isSummaryLoading || isChartLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <LoadingSpinner />
        <p className="text-neutral-400 text-sm animate-pulse">Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  const summaryData = summaryRes?.data;
  const chartData = chartRes?.data;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Bảng điều khiển tổng quan</h1>
        <p className="text-neutral-400 mt-1">Dữ liệu được cập nhật mới nhất theo thời gian thực.</p>
      </header>

      {/* Analytics Cards */}
      <StatCardsGrid summary={summaryData} />

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueFlowChart chartData={chartData} />
        </div>
        <div>
          <ActiveUsersMap />
        </div>
      </div>

      {/* Ranking & Secondary Data */}
      <div className="grid grid-cols-1 gap-6">
        <TopPerformingVenues />
      </div>
    </div>
  );
}
