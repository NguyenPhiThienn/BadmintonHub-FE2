"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiSoccerField } from "@mdi/js";

interface VenueFooterProps {
  selectedSlotsCount: number;
  totalPrice: number;
  onBooking: () => void;
  isBookingLoading: boolean;
}

export const VenueFooter = ({
  selectedSlotsCount,
  totalPrice,
  onBooking,
  isBookingLoading,
}: VenueFooterProps) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-darkBackgroundV2/90 backdrop-blur-xl border-t border-darkBorderV1 p-4 flex items-center justify-between gap-4 shadow-2xl">
      <div className="space-y-1">
        <span className="text-neutral-400 text-sm font-medium">
          {selectedSlotsCount} slot đã chọn
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-accent leading-none">
            {totalPrice.toLocaleString("vi-VN")}
          </span>
          <span className="text-neutral-400 text-xs font-bold uppercase tracking-tighter">VNĐ</span>
        </div>
      </div>
      <Button
        disabled={selectedSlotsCount === 0 || isBookingLoading}
        onClick={onBooking}
        className="h-12 px-8 text-base font-bold gap-2 min-w-[180px]"
      >
        {isBookingLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Icon path={mdiSoccerField} size={0.8} />
        )}
        {isBookingLoading ? "Đang xử lý..." : "Đặt sân ngay"}
      </Button>
    </footer>
  );
};
