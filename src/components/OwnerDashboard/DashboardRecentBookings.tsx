"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@mdi/react";
import { mdiBellRing, mdiChevronRight } from "@mdi/js";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const DashboardRecentBookings = ({ bookings = [] }: { bookings: any[] }) => {
  const router = useRouter();

  return (
    <Card className="bg-darkCardV1/40 border-darkBorderV1 h-full flex flex-col relative overflow-hidden">
      {/* Flashing alert effect for new bookings if there are pending ones */}
      {bookings.some((b) => b.status === "PENDING") && (
        <div className="absolute top-0 left-0 w-full h-1 bg-accent animate-pulse" />
      )}
      
      <CardHeader className="border-b border-darkBorderV1/50 pb-3 flex flex-row items-center justify-between bg-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center">
            <Icon path={mdiBellRing} size={0.7} className="animate-[wiggle_1s_ease-in-out_infinite]" />
          </div>
          <CardTitle className="text-[17px] font-semibold text-white">Hoạt động gần đây</CardTitle>
        </div>
        <button 
          onClick={() => router.push("/owner/bookings")}
          className="text-xs text-accent hover:text-white transition-colors flex items-center"
        >
          Xem tất cả <Icon path={mdiChevronRight} size={0.6} />
        </button>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
        {bookings.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 text-sm">Chưa có đơn đặt sân nào.</div>
        ) : (
          <div className="flex flex-col">
            {bookings.map((booking: any) => (
              <div 
                key={booking.bookingId || booking._id}
                onClick={() => router.push(`/owner/bookings?bookingId=${booking.bookingId || booking._id}`)}
                className="p-4 border-b border-darkBorderV1/30 hover:bg-darkBorderV1/20 transition-colors cursor-pointer group flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-[14.5px] text-white truncate group-hover:text-accent transition-colors">
                      {booking.customerName || "Khách hàng"}
                    </p>
                    <span className="text-[11px] text-neutral-500 whitespace-nowrap ml-2">
                      {booking.createdAt ? formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true, locale: vi }) : ""}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[13px] text-neutral-400">
                    <span className="truncate">{booking.venueName || "Sân cầu lông"}</span>
                    <span>•</span>
                    <span className="truncate">{booking.playDate} ({booking.timeSlot})</span>
                  </div>
                </div>
                
                <div className="shrink-0 mt-1">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                    booking.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                    booking.status === "COMPLETED" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                    booking.status === "CANCELLED" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                    "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                  )}>
                    {booking.status === "PENDING" ? "Chờ duyệt" : booking.status === "COMPLETED" ? "Hoàn thành" : booking.status === "CANCELLED" ? "Đã hủy" : booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
