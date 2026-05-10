"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/useAuth";
import { useOccupancyStats, useRevenueStats } from "@/hooks/useOwner";
import { useVenues } from "@/hooks/useVenue";
import { IOccupancyData } from "@/interface/owner";
import { mdiCalendarCheck, mdiChartBar, mdiChartLine, mdiFinance, mdiSoccerField } from "@mdi/js";
import { Icon } from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const StatCard = ({ title, value, icon, color, delay = 0 }: any) => {
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
          <div className={`w-fit p-2 rounded-lg bg-${color}/10 text-${color} border border-${color}/20 group-hover:scale-105 transition-transform duration-300 mb-3`}>
            <Icon path={icon} size={0.8} />
          </div>

          <div className="flex items-center justify-between gap-4 overflow-hidden">
            <p className="text-neutral-400 text-sm font-medium uppercase truncate">{title}</p>
            <h3 className="text-xl font-semibold text-neutral-300 tracking-tight whitespace-nowrap">
              {value}
            </h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function OwnerDashboard() {
  const { data: profileRes } = useMe();
  const userId = profileRes?.data?._id;

  const [selectedVenueId, setSelectedVenueId] = useState<string>("all");

  const { data: venuesRes } = useVenues({ ownerId: userId });
  const venues = venuesRes?.data?.venues || [];

  const revenueParams = selectedVenueId !== "all" ? { venueId: selectedVenueId } : {};
  const { data: revenueRes, isLoading: isRevenueLoading } = useRevenueStats(revenueParams);
  const { data: occupancyRes, isLoading: isOccupancyLoading } = useOccupancyStats(revenueParams);

  const revenueSummary = revenueRes?.data?.summary;
  const revenueDetails = revenueRes?.data?.details || [];
  const occupancyData = occupancyRes?.data?.occupancyData || [];

  const formattedRevenueData = revenueDetails.map((item: any) => ({
    name: `${item._id.day}/${item._id.month}`,
    value: item.totalRevenue,
  }));

  const formattedOccupancyData = occupancyData.map((item: IOccupancyData) => ({
    name: item.date.split('-').slice(1).join('/'),
    rate: item.occupancyRate,
  }));

  if (isRevenueLoading || isOccupancyLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-darkCardV1/40" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full bg-darkCardV1/40" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-300">Tổng quan kinh doanh</h1>
          <p className="text-neutral-400 text-sm mt-1">Theo dõi hiệu suất và doanh thu của các cơ sở sân.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon path={mdiSoccerField} size={0.8} className="text-accent" />
            <span className="text-sm text-neutral-300 font-medium">Cơ sở:</span>
          </div>
          <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
            <SelectTrigger className="w-[200px] bg-darkCardV1/60 border-darkBorderV1">
              <SelectValue placeholder="Chọn cơ sở" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cơ sở</SelectItem>
              {venues.map((v: any) => (
                <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng doanh thu"
          value={`${revenueSummary?.totalRevenue?.toLocaleString() || 0} đ`}
          icon={mdiFinance}
          color="accent"
          delay={0.1}
        />
        <StatCard
          title="Tổng lượt đặt"
          value={revenueSummary?.totalBookings || 0}
          icon={mdiCalendarCheck}
          color="accent"
          delay={0.2}
        />
        <StatCard
          title="Tỷ lệ lấp đầy TB"
          value={`${(occupancyData.reduce((acc: number, curr: any) => acc + curr.occupancyRate, 0) / (occupancyData.length || 1)).toFixed(1)}%`}
          icon={mdiChartBar}
          color="accent"
          delay={0.3}
        />
        <StatCard
          title="Số lượng cơ sở"
          value={venues.length}
          icon={mdiSoccerField}
          color="accent"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-darkCardV1/40 border-darkBorderV1">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-neutral-800 pb-4 mx-4">
            <Icon path={mdiChartLine} size={0.8} className="text-accent" />
            <CardTitle className="text-lg font-semibold text-accent">Biểu đồ doanh thu</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedRevenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#41C651" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#41C651" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2F32" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#525252"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#525252"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0A1F22", border: "1px solid #1A2F32", borderRadius: "12px" }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number) => [`${value?.toLocaleString()} đ`, "Doanh thu"]}
                />
                <Area type="monotone" dataKey="value" stroke="#41C651" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-darkCardV1/40 border-darkBorderV1">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-neutral-800 pb-4 mx-4">
            <Icon path={mdiChartBar} size={0.8} className="text-accent" />
            <CardTitle className="text-lg font-semibold text-accent">Tỷ lệ lấp đầy (7 ngày)</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2F32" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#525252"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#525252"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0A1F22", border: "1px solid #1A2F32", borderRadius: "12px" }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number) => [`${value}%`, "Tỷ lệ lấp đầy"]}
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
