"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { useMyBookings, useUpdateBookingStatus } from "@/hooks/useBooking";
import { BookingStatus, IBooking } from "@/interface/booking";
import {
  mdiCalendarClock,
  mdiCancel,
  mdiChevronLeft,
  mdiClipboardCheckOutline,
  mdiLoading,
  mdiMapMarker,
  mdiPlaylistRemove,
  mdiSoccerField,
} from "@mdi/js";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "react-toastify";

export default function MyBookingsPage() {
  const { data: bookingsRes, isLoading } = useMyBookings({ page: 1, limit: 50 });
  const updateStatusMutation = useUpdateBookingStatus();

  const bookings = bookingsRes?.data?.bookings || [];

  const handleCancelBooking = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn đặt sân này không?")) {
      updateStatusMutation.mutate(
        { id, data: { status: "CANCELLED" } },
        {
          onSuccess: () => {
            toast.success("Hủy đặt sân thành công");
          },
          onError: () => {
            toast.error("Không thể hủy đặt sân vào lúc này");
          },
        }
      );
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="green">Đã xác nhận</Badge>;
      case "PENDING":
        return <Badge variant="orange">Chờ thanh toán</Badge>;
      case "COMPLETED":
        return <Badge variant="blue">Hoàn thành</Badge>;
      case "CANCELLED":
        return <Badge variant="red">Đã hủy</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-darkBackgroundV1 text-neutral-300 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-400 hover:text-secondary transition-colors text-sm w-fit"
            >
              <Icon path={mdiChevronLeft} size={0.6} />
              Quay lại trang chủ
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Icon path={mdiClipboardCheckOutline} size={0.8} className="text-secondary" />
              Lịch của tôi
            </h1>
            <p className="text-neutral-400 text-sm">Xem và quản lý tất cả các sân bạn đã đặt tại BadmintonHub</p>
          </div>

          <Button variant="accent" asChild>
            <Link href="/venues">
              <Icon path={mdiSoccerField} size={0.8} />
              Đặt sân mới
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <h3 className="text-secondary font-semibold text-lg whitespace-nowrap">Danh sách đơn đặt</h3>
          <div className="flex-1 border-b border-dashed border-accent mr-1 opacity-20" />
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Icon path={mdiLoading} size={1} className="text-accent animate-spin" />
            <p className="text-neutral-400 italic text-base">Đang tải lịch sử đặt sân của bạn...</p>
          </div>
        ) : bookings.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {bookings.map((booking: IBooking) => (
              <motion.div
                key={booking._id}
                variants={itemVariants}
                className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-6 space-y-4 hover:border-accent/30 transition-all duration-300 group shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/5 flex items-center justify-center border border-accent/10 shrink-0 group-hover:scale-110 transition-transform">
                      <Icon path={mdiCalendarClock} size={0.8} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg line-clamp-1">
                        {typeof booking.venueId === "object" ? booking.venueId.name : "Sân cầu lông"}
                      </h4>
                      <p className="text-neutral-400 text-sm flex items-center gap-1.5 mt-1">
                        <Icon path={mdiMapMarker} size={0.6} />
                        <span className="line-clamp-1">
                          {typeof booking.venueId === "object" ? booking.venueId.address : ""}
                        </span>
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 md:gap-4">
                    <h3 className="text-secondary/80 font-semibold text-xs whitespace-nowrap">Chi tiết suất chơi</h3>
                    <div className="flex-1 border-b border-dashed border-accent/20 mr-1" />
                  </div>

                  <div className="space-y-2">
                    {booking.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-darkBackgroundV1/50 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <Icon path={mdiSoccerField} size={0.6} className="text-accent" />
                          <span className="text-neutral-200 font-medium">
                            {typeof detail.courtId === "object" ? detail.courtId.name : "Sân đấu"}
                          </span>
                        </div>
                        <div className="text-neutral-400 text-xs font-mono">
                          {format(new Date(detail.bookingDate), "dd/MM/yyyy", { locale: vi })} | {detail.startTime} - {detail.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-darkBorderV1/50 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Tổng thanh toán</span>
                    <div className="text-xl font-black text-secondary">
                      {booking.finalPrice?.toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                  {booking.status === "PENDING" && (
                    <Button
                      variant="outline"
                      className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-2 h-10 px-6"
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Icon path={mdiCancel} size={0.8} />
                      Hủy đặt sân
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-darkCardV1 border border-darkBorderV1 rounded-3xl py-24 px-8 text-center flex flex-col items-center justify-center gap-6">
            <div className="h-24 w-24 rounded-full bg-neutral-900 flex items-center justify-center border border-darkBorderV1">
              <Icon path={mdiPlaylistRemove} size={2} className="text-neutral-700" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Bạn chưa có lịch đặt sân nào</h2>
              <p className="text-neutral-400 max-w-md mx-auto">
                Lịch sử đặt sân của bạn sẽ xuất hiện tại đây sau khi bạn thực hiện đặt sân thành công.
              </p>
            </div>
            <Button variant="accent" asChild className="h-12 px-8 text-lg font-bold">
              <Link href="/venues">Khám phá và đặt sân ngay</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
