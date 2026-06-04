"use client";

import { Card, CardContent } from "@/components/ui/card";
import { mdiCalendarCheck, mdiChartBar, mdiFinance, mdiSoccerField, mdiTrendingUp, mdiTrendingDown, mdiMinus } from "@mdi/js";
import { Icon } from "@mdi/react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon, color, trend, trendLabel, delay = 0 }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="bg-darkCardV1/40 border-darkBorderV1 hover:border-accent/40 transition-all group h-full overflow-hidden flex flex-col justify-between">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-1">
            <div className={`w-fit p-2 rounded-lg bg-${color}/10 text-${color} border border-${color}/20 group-hover:scale-105 transition-transform duration-300 mb-2`}>
              <Icon path={icon} size={0.8} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-200 mb-1 truncate">
            {value}
          </h3>
          <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider truncate">{title}</p>
          {trend !== undefined && trend !== null && (
            <div className="mt-3 flex items-center gap-1.5 bg-darkBackgroundV1/50 w-fit px-2 py-1 rounded-md border border-darkBorderV1/50">
               {trend > 0 ? (
                 <Icon path={mdiTrendingUp} size={0.6} className="text-green-500" />
               ) : trend < 0 ? (
                 <Icon path={mdiTrendingDown} size={0.6} className="text-red-500" />
               ) : (
                 <Icon path={mdiMinus} size={0.6} className="text-neutral-500" />
               )}
               <span className={`text-xs font-semibold ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-neutral-500'}`}>
                 {trend > 0 ? '+' : ''}{trend}%
               </span>
               <span className="text-xs text-neutral-500">{trendLabel || 'so với tháng trước'}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const DashboardOverviewCards = ({ data }: { data: any }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Doanh thu tháng này"
        value={`${data?.totalRevenue?.toLocaleString() || 0} đ`}
        trend={data?.revenueTrend}
        icon={mdiFinance}
        color="accent"
        delay={0.1}
      />
      <StatCard
        title="Tổng số đơn đặt"
        value={data?.totalBookings || 0}
        trend={data?.bookingsTrend}
        icon={mdiCalendarCheck}
        color="accent"
        delay={0.2}
      />
      <StatCard
        title="Hiệu suất khai thác"
        value={`${data?.occupancyRate || 0}%`}
        trend={data?.occupancyTrend}
        icon={mdiChartBar}
        color="accent"
        delay={0.3}
      />
      <StatCard
        title="Số lượng cơ sở"
        value={data?.totalVenues || 0}
        icon={mdiSoccerField}
        color="accent"
        delay={0.4}
      />
    </div>
  );
};
