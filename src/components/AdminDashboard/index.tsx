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
import { IChartData, ISummaryStats } from "@/interface/admin";

const StatCard = ({ title, value, subValue, icon, color, isCurrency, unit, delay = 0 }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="bg-darkCardV1/40 border-darkBorderV1 hover:border-accent/40 transition-all group h-full overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl bg-${color}/10 text-${color} border border-${color}/20 shadow-lg shadow-${color}/5 group-hover:scale-110 transition-transform duration-300`}>
              <Icon path={icon} size={1} />
            </div>
            {isCurrency && (
              <div className="text-[10px] font-semibold text-accent/60 bg-accent/5 px-2 py-0.5 rounded-full border border-accent/10">
                VNĐ
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-neutral-400 text-sm font-medium tracking-wide uppercase">{title}</p>
            <div className="flex flex-col gap-1">
              <h3 className="text-3xl font-semibold text-neutral-300 tracking-tight">
                {isCurrency ? (value / 1000000).toFixed(1) + "M" : value?.toLocaleString()}
                {unit === "%" ? "%" : ""}
              </h3>
              {subValue && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-accent/40" />
                  <p className="text-sm text-neutral-400 font-medium italic">
                    {subValue}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StatCardsGrid = ({ summary }: { summary: ISummaryStats | undefined }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Doanh thu"
        value={summary?.revenue || 0}
        icon={mdiFinance}
        color="accent"
        isCurrency={true}
        delay={0.1}
      />
      <StatCard
        title="Lượt đặt"
        value={summary?.bookings || 0}
        icon={mdiCalendarCheck}
        color="accent"
        delay={0.2}
      />
      <StatCard
        title="Người dùng"
        value={summary?.users?.total || 0}
        icon={mdiAccountGroup}
        color="accent"
        subValue={`Players: ${summary?.users?.players || 0} - Owners: ${summary?.users?.owners || 0}`}
        delay={0.3}
      />
      <StatCard
        title="Tỉ lệ lấp đầy"
        value={summary?.occupancyRate || 0}
        icon={mdiMapMarkerRadius}
        color="accent"
        unit="%"
        delay={0.4}
      />
    </div>
  );
};

const RevenueFlowChart = ({ chartData }: { chartData: IChartData | undefined }) => {
  const formattedData = chartData?.map((item: any) => ({
    name: item._id,
    value: item.value,
  })) || [];

  return (
    <Card className="bg-darkCardV1/40 border-darkBorderV1 h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Biểu đồ doanh thu (Tháng)</CardTitle>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <div className="w-3 h-3 rounded-full bg-accent" /> Thực tế
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full pb-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#41C651" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#41C651" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              stroke="#525252"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                const parts = val.split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}` : val;
              }}
            />
            <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val.toLocaleString()} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0A1F22", border: "1px solid #1A2F32", borderRadius: "12px" }}
              itemStyle={{ color: "#fff" }}
              labelFormatter={(label) => `Ngày: ${label}`}
              formatter={(value: number) => [`${value?.toLocaleString()} đ`, "Doanh thu"]}
            />
            <Area type="monotone" dataKey="value" stroke="#41C651" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
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
        <CardTitle className="text-lg font-semibold">Top 5 Sân có doanh thu cao nhất</CardTitle>
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
                <TableCell className="text-center font-semibold">{i + 1}</TableCell>
                <TableCell className="text-left font-medium text-neutral-300">{venue.name}</TableCell>
                <TableCell>{venue.bookings}</TableCell>
                <TableCell className="text-accent font-semibold">{venue.revenue}</TableCell>
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
        <CardTitle className="text-lg font-semibold">Phân bố người dùng Real-time</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-[300px]">
        {/* Placeholder for Map distribution */}
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 bg-accent/10 rounded-full animate-ping opacity-20" />
          <div className="absolute inset-4 bg-accent/20 rounded-full animate-pulse opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h4 className="text-4xl font-semibold text-accent">152</h4>
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Online Now</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 w-full px-4">
          <div className="bg-darkBackgroundV1/60 p-3 rounded-xl border border-darkBorderV1">
            <p className="text-sm text-neutral-400 uppercase font-semibold">TP. Hồ Chí Minh</p>
            <p className="text-lg font-semibold text-neutral-300">82%</p>
          </div>
          <div className="bg-darkBackgroundV1/60 p-3 rounded-xl border border-darkBorderV1">
            <p className="text-sm text-neutral-400 uppercase font-semibold">Khu vực khác</p>
            <p className="text-lg font-semibold text-neutral-300">18%</p>
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
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl font-semibold text-neutral-300">Bảng điều khiển tổng quan</h1>
        <p className="text-neutral-400 mt-1">Dữ liệu được cập nhật mới nhất theo thời gian thực.</p>
      </header>

      <div>
        <StatCardsGrid summary={summaryData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueFlowChart chartData={chartData} />
        </div>
        <div>
          <ActiveUsersMap />
        </div>
      </div>

      {/* Ranking & Secondary Data */}
      <div className="grid grid-cols-1 gap-4">
        <TopPerformingVenues />
      </div>
    </div>
  );
}
