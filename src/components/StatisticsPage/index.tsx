"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInspectionDue } from "@/hooks/useEquipment";
import { useNotifications, useStatistics } from "@/hooks/useReports";
import { useOverdueTasks } from "@/hooks/useTasks";
import {
  mdiAccountGroup,
  mdiAlertCircle,
  mdiArrowRightThin,
  mdiBellRing,
  mdiCalendarAlert,
  mdiClipboardText,
  mdiHandshake,
  mdiTools,
} from "@mdi/js";
import { Icon } from "@mdi/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "../ui/badge";

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  href: string;
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  href,
}: MetricCardProps) {
  return (
    <Link href={href} className="h-full block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <Card className="h-full bg-gradient-to-br from-darkCardV1 via-darkCardV1 to-accent/10 border-accent/20 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex flex-col gap-2">
                <p className="text-sm uppercase text-nowrap truncate font-medium text-neutral-300">
                  {title}
                </p>
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold mt-2">{value}</h3>
                  <div className="p-3 rounded-full bg-darkBorderV1 text-neutral-300">
                    {icon}
                  </div>
                </div>
                {subtitle && <p className="text-sm text-accent">{subtitle}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-b-darkBorderV1 py-3">
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function StatisticsPage() {
  const { data: statisticsRes, isLoading: isLoadingStats } = useStatistics();
  const { data: inspectionDueRes, isLoading: isLoadingInspection } = useInspectionDue(30);
  const { data: overdueRes, isLoading: isLoadingOverdue } = useOverdueTasks();
  const { data: notificationsRes, isLoading: isLoadingNotif } = useNotifications({
    limit: 15,
    page: 1,
  });

  const isLoading =
    isLoadingStats || isLoadingInspection || isLoadingOverdue || isLoadingNotif;

  if (isLoading) return <DashboardSkeleton />;

  const stats = statisticsRes?.data ?? statisticsRes ?? {};
  const employees = stats.employees ?? stats.totalEmployees ?? 0;
  const equipment = stats.equipment ?? stats.totalEquipment ?? 0;
  const partners = stats.partners ?? stats.totalPartners ?? 0;
  const tasks = stats.tasks ?? stats.totalTasks ?? 0;

  const inspectionDueList = Array.isArray(inspectionDueRes?.data)
    ? inspectionDueRes.data
    : Array.isArray(inspectionDueRes?.data?.equipment)
      ? inspectionDueRes.data.equipment
      : inspectionDueRes?.data?.list ?? [];
  const overdueList = Array.isArray(overdueRes?.data)
    ? overdueRes.data
    : overdueRes?.data?.tasks ?? overdueRes?.data?.list ?? [];
  const notifications = Array.isArray(notificationsRes?.data)
    ? notificationsRes.data
    : notificationsRes?.data?.notifications ?? notificationsRes?.data ?? [];

  const alertCount =
    (inspectionDueList.length > 0 ? inspectionDueList.length : 0) +
    (overdueList.length > 0 ? overdueList.length : 0) +
    notifications.filter((n: any) => n.priority === "high" || n.type === "borrow_conflict").length;

  return (
    <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-300">
            Bảng điều khiển
          </h1>
          <p className="text-neutral-300 mt-2 text-base">
            Chào mừng quay trở lại, đây là những gì đang diễn ra hôm nay.
          </p>
        </div>
        {alertCount > 0 && (
          <Badge variant="amber">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse mr-1.5" />
            {alertCount} cảnh báo cần xử lý
          </Badge>
        )}
      </div>

      {/* Số liệu tổng quan - GET /api/reports/statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          icon={<Icon path={mdiAccountGroup} size={0.8} className="flex-shrink-0" />}
          title="Nhân sự"
          value={employees}
          subtitle="Tổng số nhân viên"
          href="/admin/employees"
        />
        <MetricCard
          icon={<Icon path={mdiTools} size={0.8} className="flex-shrink-0" />}
          title="Thiết bị"
          value={equipment}
          subtitle="Tổng thiết bị & dụng cụ"
          href="/admin/equipment"
        />
        <MetricCard
          icon={<Icon path={mdiHandshake} size={0.8} className="flex-shrink-0" />}
          title="Công ty"
          value={partners}
          subtitle="Tổng công ty"
          href="/admin/partners"
        />
        <MetricCard
          icon={<Icon path={mdiClipboardText} size={0.8} className="flex-shrink-0" />}
          title="Công việc"
          value={tasks}
          subtitle="Tổng công việc"
          href="/admin/tasks"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card className="border border-darkBorderV1">
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent">
                <Icon path={mdiCalendarAlert} size={0.8} className="flex-shrink-0" />
                <span className="font-semibold">Thiết bị sắp hết hạn kiểm định</span>
              </div>
              <Link
                href="/admin/equipment/history"
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                Xem tất cả
                <Icon path={mdiArrowRightThin} size={0.8} className="flex-shrink-0" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {inspectionDueList.length === 0 ? (
              <p className="text-neutral-300 text-sm py-4 text-center">
                Không có thiết bị nào sắp đến hạn kiểm định (30 ngày)
              </p>
            ) : (
              <ul className="space-y-2 max-h-[240px] overflow-y-auto">
                {inspectionDueList.slice(0, 8).map((item: any, idx: number) => (
                  <li
                    key={item._id || item.equipmentId || idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-darkBorderV1/20 border border-darkBorderV1/40"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-300">
                        {item.equipmentName ?? item.equipmentCode ?? item.name ?? "Thiết bị"}
                      </p>
                      <p className="text-xs text-neutral-300">
                        Hạn KĐ: {formatDate(item.nextInspectionDate ?? item.nextInspection)}
                      </p>
                    </div>
                    <Badge variant="amber">Sắp hết hạn</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border border-darkBorderV1">
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent">
                <Icon path={mdiAlertCircle} size={0.8} className="flex-shrink-0" />
                <span className="font-semibold">Công việc quá hạn</span>
              </div>
              <Link
                href="/admin/tasks"
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                Xem tất cả
                <Icon path={mdiArrowRightThin} size={0.8} className="flex-shrink-0" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {overdueList.length === 0 ? (
              <p className="text-neutral-300 text-sm py-4 text-center">
                Không có công việc quá hạn
              </p>
            ) : (
              <ul className="space-y-2 max-h-[240px] overflow-y-auto">
                {overdueList.slice(0, 8).map((task: any, idx: number) => (
                  <li
                    key={task._id || idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-darkBorderV1/20 border border-darkBorderV1/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-300 truncate">
                        {task.taskContent ?? task.content ?? "Công việc"}
                      </p>
                      <p className="text-xs text-neutral-300">
                        Người nhận: {task.assigneeName ?? task.assignee ?? "-"} • Hạn:{" "}
                        {formatDate(task.deadline ?? task.dueDate)}
                      </p>
                    </div>
                    <Badge variant="destructive">Quá hạn</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-darkBorderV1">
        <CardHeader className="border-b border-b-darkBorderV1 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent">
              <Icon path={mdiBellRing} size={0.8} className="flex-shrink-0" />
              <span className="font-semibold">Hoạt động gần đây & Cảnh báo</span>
            </div>
            <Link
              href="/admin/notifications"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              Xem tất cả
              <Icon path={mdiArrowRightThin} size={0.8} className="flex-shrink-0" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {notifications.length === 0 ? (
            <p className="text-neutral-300 text-sm py-6 text-center">
              Không có thông báo hoặc hoạt động gần đây
            </p>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {notifications.slice(0, 10).map((notif: any) => {
                const isWarning =
                  notif.priority === "high" ||
                  notif.type === "borrow_conflict" ||
                  notif.type === "warning";
                return (
                  <div
                    key={notif._id}
                    className={`flex items-start gap-3 py-3 px-3 rounded-lg border ${isWarning
                      ? "bg-amber-500/5 border-amber-500/30"
                      : notif.isRead
                        ? "bg-darkBorderV1/10 border-darkBorderV1/40"
                        : "bg-accent/5 border-accent/20"
                      }`}
                  >
                    <div
                      className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${isWarning ? "bg-amber-500" : notif.isRead ? "bg-neutral-500" : "bg-accent"
                        }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-300">
                        {notif.title ?? notif.message}
                      </p>
                      {notif.title && notif.message && (
                        <p className="text-xs text-neutral-300 mt-0.5">{notif.message}</p>
                      )}
                      <p className="text-xs text-neutral-300 mt-1">
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : ""}
                      </p>
                    </div>
                    {isWarning && (
                      <Badge variant="amber">
                        Cảnh báo
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
