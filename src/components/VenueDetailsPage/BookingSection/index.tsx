"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/mdi-icon";
import { IAvailability, ICourt, ISlot } from "@/types/venue";
import { cn } from "@/lib/utils";
import {
  mdiBadminton, mdiChevronLeft, mdiChevronRight,
  mdiClockOutline,
  mdiInformationOutline,
  mdiMapMarkerOutline,
  mdiSoccerField,
  mdiStarOutline,
  mdiTicketPercentOutline,
  mdiClose,
  mdiCheckCircle,
  mdiCalendarSync,
  mdiRepeat,
  mdiCalendarMonth
} from "@mdi/js";
import { format, isSameDay, addWeeks, addMonths } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { useAvailableCoupons } from "@/hooks/useBooking";
import { CouponDiscountType, ICoupon } from "@/types/coupon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BookingSectionProps {
  venue: any;
  totalPrice: number;
  onBooking: (couponId?: string) => void;
  isBookingLoading: boolean;
  isBlocked: boolean;
  dates: Date[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  dateSwiper: any;
  setDateSwiper: (swiper: any) => void;
  isAvailabilityLoading: boolean;
  availabilityData: IAvailability[];
  currentPrice: number;
  selectedSlots: { courtId: string, time: string, price: number }[];
  onToggleSlot: (courtId: string, time: string, price: number) => void;
  venueId: string;
  paymentMethod: "VNPAY" | "CASH";
  setPaymentMethod: (method: "VNPAY" | "CASH") => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  userId: string;
  bookingType: 'SINGLE' | 'WEEKLY' | 'MONTHLY';
  setBookingType: (type: 'SINGLE' | 'WEEKLY' | 'MONTHLY') => void;
  recurringOccurrences: number;
  setRecurringOccurrences: (n: number) => void;
  recurringPaymentSchedule: 'FULL' | 'MONTHLY';
  setRecurringPaymentSchedule: (s: 'FULL' | 'MONTHLY') => void;
}

type BookingType = 'SINGLE' | 'WEEKLY' | 'MONTHLY';

const CourtTimeGrid = ({
  court,
  courtType,
  courtAvailability,
  currentPrice,
  selectedSlots,
  onToggle,
  userId,
  selectedDate,
  venueStatus
}: {
  court: ICourt,
  courtType?: string,
  courtAvailability?: IAvailability,
  currentPrice: number,
  selectedSlots: { courtId: string, time: string }[],
  onToggle: (time: string, price: number) => void,
  userId: string,
  selectedDate: Date,
  venueStatus?: string
}) => {
  const slots = courtAvailability?.slots || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <Icon path={mdiSoccerField} size={0.8} className="text-accent" />
          </div>
          <h4 className="font-semibold text-base text-white">{court.name}</h4>
        </div>
        {courtType && (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-white/5 text-neutral-300 rounded border border-white/10 uppercase tracking-widest">
            {courtType}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {slots.map((slot: ISlot) => {
          const isLockedByOthers = slot.status === "LOCKED" && slot.userId !== userId;
          const isLockedByMe = slot.status === "LOCKED" && slot.userId === userId;
          const isBooked = slot.status === "BOOKED" || (slot.status !== "AVAILABLE" && slot.status !== "LOCKED");
          const isToday = isSameDay(selectedDate, new Date());
          let isPast = false;
          if (isToday) {
            const [hours, minutes] = slot.startTime.split(':').map(Number);
            const slotTime = new Date(selectedDate);
            slotTime.setHours(hours, minutes, 0, 0);
            isPast = slotTime <= new Date();
          }
          const isSelected = selectedSlots.some(s => s.courtId === court._id && s.time === slot.startTime);
          const isVenueClosed = venueStatus === 'PENDING_CLOSURE' || venueStatus === 'CLOSED';
          const isDisabled = isLockedByOthers || isBooked || isPast || isVenueClosed;

          // Visual state classes
          let btnClass = "";
          let iconClass = "text-neutral-500";
          if (isSelected || isLockedByMe) {
            btnClass = "bg-accent/15 border-accent text-accent shadow-md shadow-accent/10";
            iconClass = "text-accent";
          } else if (isLockedByOthers) {
            btnClass = "bg-blue-500/10 border-blue-500/60 text-blue-400 cursor-not-allowed";
            iconClass = "text-blue-400";
          } else if (isBooked) {
            btnClass = "bg-amber-500/10 border-amber-500/50 text-amber-400/60 cursor-not-allowed";
            iconClass = "text-amber-400/60";
          } else if (isPast) {
            btnClass = "bg-neutral-900 border-darkBorderV1 text-neutral-700 cursor-not-allowed";
            iconClass = "text-neutral-700";
          } else {
            btnClass = "bg-darkCardV1 border-darkBorderV1 text-neutral-400 hover:border-neutral-500 hover:bg-white/5";
          }

          return (
            <button
              key={slot.startTime}
              disabled={isDisabled}
              onClick={() => onToggle(slot.startTime, slot.pricePerHour || currentPrice)}
              className={cn(
                "h-11 rounded-lg text-sm font-medium border-2 transition-all relative overflow-hidden",
                btnClass
              )}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Icon path={mdiBadminton} size={0.6} className={iconClass} />
                <span className="font-semibold whitespace-nowrap tracking-tight">
                  {slot.startTime} - {slot.endTime}
                </span>
              </div>
              {/* Strikethrough overlay for past slots only */}
              {isPast && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-[1.5px] bg-neutral-600/50 rotate-12" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent/20 border border-accent inline-block" />Bạn đang chọn</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500/20 border border-blue-500/60 inline-block" />Người khác đang chọn</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/10 border border-amber-500/50 inline-block" />Đã đặt</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-neutral-900 border border-darkBorderV1 inline-block" />Không khả dụng</span>
      </div>
    </div>
  );
};

export const BookingSection = ({
  venue,
  totalPrice,
  onBooking,
  isBookingLoading,
  isBlocked,
  dates,
  selectedDate,
  onDateChange,
  dateSwiper,
  setDateSwiper,
  isAvailabilityLoading,
  availabilityData,
  currentPrice,
  selectedSlots,
  onToggleSlot,
  venueId,
  paymentMethod,
  setPaymentMethod,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  userId,
  bookingType,
  setBookingType,
  recurringOccurrences,
  setRecurringOccurrences,
  recurringPaymentSchedule,
  setRecurringPaymentSchedule
}: BookingSectionProps) => {
  // Fetch available coupons
  const { data: couponsRes } = useAvailableCoupons(venueId);
  const availableCoupons: ICoupon[] = couponsRes?.data || [];
  const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  const filteredAvailabilityData = availabilityData.filter(courtAvail => (courtAvail.slots || []).length > 0);

  // Calculate discount
  let discountAmount = 0;
  if (selectedCoupon) {
    if (!selectedCoupon.minOrderValue || totalPrice >= selectedCoupon.minOrderValue) {
      if (selectedCoupon.discountType === CouponDiscountType.PERCENTAGE) {
        discountAmount = (totalPrice * selectedCoupon.discountValue) / 100;
        if (selectedCoupon.maxDiscountAmount && discountAmount > selectedCoupon.maxDiscountAmount) {
          discountAmount = selectedCoupon.maxDiscountAmount;
        }
      } else {
        discountAmount = selectedCoupon.discountValue;
      }
      if (discountAmount > totalPrice) discountAmount = totalPrice;
    }
  }

  const finalPrice = totalPrice - discountAmount;

  // Calculate final total with recurring multiplier
  const finalTotalPrice = bookingType === 'SINGLE' 
    ? finalPrice 
    : finalPrice * recurringOccurrences;

  // Render Coupon Selection Button
  const renderCouponSelection = () => {
    // Removed check for !availableCoupons.length so the box always shows

    return (
      <div className="pt-6 border-t border-darkBorderV1 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-neutral-400 text-xs uppercase tracking-wider font-bold flex items-center gap-2">
            <Icon path={mdiTicketPercentOutline} size={0.7} />
            Mã Khuyến Mãi
          </Label>
        </div>

        <button
          onClick={() => setIsCouponModalOpen(true)}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all",
            selectedCoupon 
              ? "bg-accent/10 border-accent text-accent"
              : "bg-darkBackgroundV1 border-darkBorderV1 text-neutral-400 hover:border-neutral-500"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-darkCardV1 flex items-center justify-center shadow-inner">
              <Icon path={mdiTicketPercentOutline} size={1} className={selectedCoupon ? "text-accent" : "text-neutral-400"} />
            </div>
            <div className="text-left flex flex-col">
              <span className="font-bold text-sm text-white">
                {selectedCoupon ? selectedCoupon.code : "Chọn hoặc nhập mã"}
              </span>
              <span className="text-[11px] opacity-80 mt-0.5">
                {selectedCoupon 
                  ? (selectedCoupon.discountType === CouponDiscountType.PERCENTAGE 
                      ? `Giảm ${selectedCoupon.discountValue}%` 
                      : `Giảm ${selectedCoupon.discountValue.toLocaleString()}đ`)
                  : `${availableCoupons.length} mã khả dụng`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedCoupon && (
              <div 
                onClick={(e) => { e.stopPropagation(); setSelectedCoupon(null); }}
                className="p-1.5 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 rounded-full transition-colors"
              >
                <Icon path={mdiClose} size={0.7} />
              </div>
            )}
            <Icon path={mdiChevronRight} size={1} className="opacity-50" />
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN: Date & Court Selection */}
      <div className="lg:col-span-7 space-y-8">

        {/* Date Selection */}
        <section className="space-y-5">
          {(venue?.status === 'PENDING_CLOSURE' || venue?.status === 'CLOSED') && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl p-4 flex items-start gap-3">
              <Icon path={mdiInformationOutline} size={1} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Cơ sở hiện không nhận khách</p>
                <p className="text-sm">Cơ sở này đang trong quá trình đóng cửa hoặc đã đóng cửa. Bạn không thể đặt sân lúc này.</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 w-full justify-between">
            <div className="flex-1 flex items-center gap-4">
              <div className="w-1.5 h-6 bg-accent rounded-full"></div>
              <h3 className="text-white text-lg font-bold whitespace-nowrap">Chọn ngày chơi</h3>
              <div className="flex-1 border-b border-darkBorderV1 mr-1" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dateSwiper?.slidePrev()}
                className={cn(
                  "rounded-full h-8 w-8 hover:bg-white/10",
                  !dateSwiper && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon path={mdiChevronLeft} size={0.8} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dateSwiper?.slideNext()}
                className={cn(
                  "rounded-full h-8 w-8 hover:bg-white/10",
                  !dateSwiper && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon path={mdiChevronRight} size={0.8} />
              </Button>
            </div>
          </div>

          <div className="w-full relative px-2">
            <Swiper
              onSwiper={(swiper) => setDateSwiper(swiper)}
              slidesPerView="auto"
              spaceBetween={12}
              className="w-full"
            >
              {dates.map((date, i) => {
                const isSelected = isSameDay(date, selectedDate);
                return (
                  <SwiperSlide key={i} style={{ width: 'auto' }}>
                    <button
                      onClick={() => onDateChange(date)}
                      className={cn(
                        "flex flex-col items-center justify-center px-5 h-20 rounded-2xl border transition-all shrink-0 min-w-[100px]",
                        isSelected
                          ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                          : "bg-darkCardV1 border-darkBorderV1 text-neutral-400 hover:border-neutral-500 hover:bg-white/5"
                      )}
                    >
                      <span className="text-[11px] font-bold mb-1 uppercase tracking-wider opacity-80">
                        {format(date, 'EEE', { locale: vi })}
                      </span>
                      <span className="text-base font-bold">
                        {format(date, 'dd/MM')}
                      </span>
                    </button>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </section>

        {/* Court Selection */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-4">
              <div className="w-1.5 h-6 bg-accent rounded-full"></div>
              <h3 className="text-white text-lg font-bold whitespace-nowrap">Chọn sân & khung giờ</h3>
              <div className="flex-1 border-b border-darkBorderV1 mr-1" />
            </div>
          </div>

          {isAvailabilityLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4 text-neutral-400 bg-darkCardV1/50 rounded-3xl border border-darkBorderV1">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Đang tải lịch sân...</p>
            </div>
          ) : filteredAvailabilityData.length > 0 ? (
            <div className="space-y-8 bg-darkCardV1/30 p-6 rounded-3xl border border-darkBorderV1/50">
              {filteredAvailabilityData.map((courtAvail: IAvailability) => {
                const courtDetails = venue?.courts?.find((c: any) => c._id === courtAvail.courtId);
                return (
                  <CourtTimeGrid
                    key={courtAvail.courtId}
                    court={{
                      _id: courtAvail.courtId,
                      name: courtAvail.courtName,
                      venueId: venueId,
                      status: 'AVAILABLE'
                    }}
                    courtType={courtDetails?.type}
                    courtAvailability={courtAvail}
                    currentPrice={currentPrice}
                    selectedSlots={selectedSlots}
                    onToggle={(time, price) => onToggleSlot(courtAvail.courtId, time, price)}
                    userId={userId}
                    selectedDate={selectedDate}
                    venueStatus={venue?.status}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center gap-4 text-neutral-500 border border-dashed border-darkBorderV1 rounded-3xl bg-darkCardV1/20">
              <Icon path={mdiInformationOutline} size={1.2} />
              <p className="text-base font-medium">Không có lịch sân khả dụng cho ngày này.</p>
            </div>
          )}
        </section>
      </div>

      {/* RIGHT COLUMN: Info, Payment & Booking */}
      <div className="lg:col-span-5">
        <div className="sticky top-28 space-y-6">

          {/* Venue Summary Card */}
          <div className="bg-darkCardV1 border border-darkBorderV1 rounded-3xl p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{venue?.name}</h3>
              <div className="flex items-start gap-2 text-neutral-400 text-sm">
                <Icon path={mdiMapMarkerOutline} size={0.7} className="mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{venue?.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-y border-darkBorderV1 py-4">
              <div className="flex flex-col items-center justify-center text-center gap-1">
                <Icon path={mdiStarOutline} size={0.8} className="text-yellow-500" />
                <span className="text-sm font-bold text-white">{venue?.averageRating || 5.0}</span>
                <span className="text-[10px] text-neutral-500 uppercase font-medium">Đánh giá</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-1 border-l border-darkBorderV1">
                <Icon path={mdiSoccerField} size={0.8} className="text-accent" />
                <span className="text-sm font-bold text-white">{venue?.totalCourts || venue?.courts?.length || '--'} Sân</span>
                <span className="text-[10px] text-neutral-500 uppercase font-medium">Tổng số sân</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-1 border-l border-darkBorderV1">
                <Icon path={mdiClockOutline} size={0.8} className="text-blue-400" />
                <span className="text-sm font-bold text-white">{venue?.openTime} - {venue?.closeTime}</span>
                <span className="text-[10px] text-neutral-500 uppercase font-medium">Giờ mở cửa</span>
              </div>
            </div>

            {venue?.description && (
              <div>
                <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                  {venue.description}
                </p>
              </div>
            )}
          </div>

          {/* Form & Booking Action */}
          {selectedSlots.length > 0 ? (
            <div className="bg-darkCardV1 border border-darkBorderV1 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-accent rounded-full"></div>
                <h3 className="text-white text-base font-bold">Thanh toán & Thông tin</h3>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <Label className="text-neutral-400 text-xs uppercase tracking-wider font-bold">Phương thức thanh toán</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={bookingType !== 'SINGLE'}
                    onClick={() => setPaymentMethod("CASH")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                      paymentMethod === "CASH"
                        ? "bg-accent/10 border-accent text-accent"
                        : "bg-darkBackgroundV1 border-darkBorderV1 text-neutral-400 hover:border-neutral-600",
                      bookingType !== 'SINGLE' && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <Image src="/images/money-logo.webp" alt="Cash" width={28} height={28} className="object-contain" />
                    <span className="font-semibold text-xs text-center leading-tight">Tiền mặt<br />(Tại sân)</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("VNPAY")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                      paymentMethod === "VNPAY"
                        ? "bg-accent/10 border-accent text-accent"
                        : "bg-darkBackgroundV1 border-darkBorderV1 text-neutral-400 hover:border-neutral-600"
                    )}
                  >
                    <Image src="/images/vnpay-logo.webp" alt="VNPay" width={28} height={28} className="object-contain" />
                    <span className="font-semibold text-xs text-center leading-tight">Thanh toán online<br />(VNPay)</span>
                  </button>
                </div>
                {bookingType !== 'SINGLE' && (
                  <p className="text-xs text-neutral-500 text-center">
                    Đặt theo tuần/tháng chỉ hỗ trợ thanh toán VNPay
                  </p>
                )}
              </div>

              {/* Customer Info */}
              <div className="space-y-4 pt-2">
                <Label className="text-neutral-400 text-xs uppercase tracking-wider font-bold">Thông tin liên hệ</Label>
                <div className="space-y-3">
                  <Input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Họ và tên"
                    className="bg-darkBackgroundV1 border-darkBorderV1 h-11"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Số điện thoại"
                      className="bg-darkBackgroundV1 border-darkBorderV1 h-11"
                    />
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Email"
                      className="bg-darkBackgroundV1 border-darkBorderV1 h-11"
                    />
                  </div>
                </div>
              </div>

              {renderCouponSelection()}

              {/* Recurring Type Selection */}
              <RecurringBookingSelector
                selectedSlots={selectedSlots}
                selectedDate={selectedDate}
                onSelect={(data) => onRecurringBooking(data)}
                slotPrice={selectedSlots.length > 0 ? selectedSlots[0].price : currentPrice}
                bookingType={bookingType}
                setBookingType={setBookingType}
                occurrences={recurringOccurrences}
                setOccurrences={setRecurringOccurrences}
                paymentSchedule={recurringPaymentSchedule}
                setPaymentSchedule={setRecurringPaymentSchedule}
              />

              {/* Total & Action */}
              <div className="pt-6 border-t border-darkBorderV1">
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-neutral-400 text-sm font-medium">Tạm tính</p>
                    <p className="text-neutral-300 text-sm line-through">
                      {totalPrice.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-accent text-sm font-medium">Giảm giá</p>
                    <p className="text-accent text-sm font-bold">
                      - {discountAmount.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-end mb-5">
                  <div className="space-y-1">
                    <p className="text-neutral-400 text-sm font-medium">Tổng cộng</p>
                    <p className="text-neutral-500 text-[11px] font-bold">
                      {selectedSlots.length} slot × {bookingType === 'SINGLE' ? 1 : recurringOccurrences} {bookingType !== 'SINGLE' ? (bookingType === 'WEEKLY' ? 'tuần' : 'tháng') : ''}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white tracking-tight leading-none">
                      {finalTotalPrice.toLocaleString("vi-VN")}
                    </span>
                    <span className="text-neutral-500 text-sm font-bold uppercase">VNĐ</span>
                  </div>
                </div>

                <Button
                  disabled={isBookingLoading || isBlocked || venue?.status === 'PENDING_CLOSURE' || venue?.status === 'CLOSED'}
                  onClick={() => onBooking(selectedCoupon?._id)}
                  className="w-full h-14 rounded-xl text-base font-bold gap-2 bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/20"
                >
                  {isBookingLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Icon path={mdiSoccerField} size={0.9} />
                  )}
                  {isBookingLoading ? "Đang xử lý đặt sân..." : `Xác nhận đặt sân${bookingType !== 'SINGLE' ? (bookingType === 'WEEKLY' ? ' (theo tuần)' : ' (theo tháng)') : ''}`}
                </Button>
                {isBlocked && (
                  <p className="text-red-500 text-xs text-center mt-3 font-medium">
                    Tài khoản của bạn đã bị khóa tính năng đặt sân.
                  </p>
                )}
                {(venue?.status === 'PENDING_CLOSURE' || venue?.status === 'CLOSED') && (
                  <p className="text-red-500 text-xs text-center mt-3 font-medium">
                    Cơ sở này hiện đang ngưng hoạt động và không nhận thêm đơn.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-darkCardV1 border border-darkBorderV1 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-4 text-neutral-500 border-dashed">
              <div className="w-16 h-16 rounded-full bg-darkBackgroundV1 flex items-center justify-center">
                <Icon path={mdiSoccerField} size={1.5} className="opacity-50" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Chưa chọn lịch sân</p>
                <p className="text-sm">Vui lòng chọn khung giờ ở cột bên trái để tiếp tục đặt sân.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Coupon Modal */}
      <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
        <DialogContent className="bg-darkBackgroundV1 w-[95vw] !max-w-[550px] border-darkBorderV1">
          <DialogHeader className="border-b border-darkBorderV1 pb-4">
            <DialogTitle className="flex items-center text-white">
              <Icon path={mdiTicketPercentOutline} size={1} className="text-accent mr-2" />
              Mã Khuyến Mãi
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {availableCoupons.length > 0 ? availableCoupons.map((coupon) => {
              const isEligible = !coupon.minOrderValue || totalPrice >= coupon.minOrderValue;
              const isSelected = selectedCoupon?._id === coupon._id;

              return (
                <button
                  key={coupon._id}
                  disabled={!isEligible}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCoupon(null);
                    } else {
                      setSelectedCoupon(coupon);
                      setIsCouponModalOpen(false); // Auto close on select
                    }
                  }}
                  className={cn(
                    "relative flex w-full rounded-[16px] transition-all text-left outline-none mb-2",
                    isSelected
                      ? "bg-gradient-to-r from-accent/20 to-accent/5 border border-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.15)]"
                      : isEligible
                        ? "bg-darkCardV1 border border-darkBorderV1 hover:border-neutral-500 shadow-lg"
                        : "bg-darkCardV1/40 border border-darkBorderV1/40 opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Left hole */}
                  <div className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-darkBackgroundV1 border-r border-darkBorderV1 z-10 pointer-events-none" 
                       style={{ borderColor: isSelected ? 'var(--accent)' : '' }} />
                  
                  {/* Right hole */}
                  <div className="absolute -right-[16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-darkBackgroundV1 border-l border-darkBorderV1 z-10 pointer-events-none" 
                       style={{ borderColor: isSelected ? 'var(--accent)' : '' }} />

                  {/* Left Section (Icon & Code) */}
                  <div className="w-[125px] flex-shrink-0 border-r-[2px] border-dashed border-neutral-600/40 flex flex-col items-center justify-center p-3 relative py-6">
                    <div className="w-14 h-14 rounded-full bg-darkBackgroundV1 flex items-center justify-center mb-3 shadow-inner border border-white/5">
                      <Icon path={mdiTicketPercentOutline} size={1.4} className={isSelected ? "text-accent" : "text-neutral-400"} />
                    </div>
                    <span className="font-black text-xs md:text-sm text-white text-center break-all w-full px-2 bg-white/10 py-1 rounded-md">
                      {coupon.code}
                    </span>
                  </div>

                  {/* Right Section (Details) */}
                  <div className="flex-1 p-5 flex flex-col justify-center relative">
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-accent text-white rounded-full p-0.5 shadow-md">
                        <Icon path={mdiCheckCircle} size={0.9} />
                      </div>
                    )}
                    
                    <div className="pr-6">
                      <span className="font-black text-2xl text-accent mb-1 drop-shadow-sm block leading-none">
                        {coupon.discountType === CouponDiscountType.PERCENTAGE
                          ? `Giảm ${coupon.discountValue}%`
                          : `Giảm ${coupon.discountValue.toLocaleString()}đ`}
                      </span>
                      
                      <div className="text-sm text-neutral-400 mt-2 space-y-1">
                        {coupon.maxDiscountAmount ? (
                          <p className="font-medium text-neutral-300">Tối đa {coupon.maxDiscountAmount.toLocaleString()}đ</p>
                        ) : null}
                        {coupon.minOrderValue ? (
                          <p className={cn(
                            "font-medium",
                            !isEligible ? "text-red-400" : "text-neutral-500"
                          )}>
                            Đơn tối thiểu: {coupon.minOrderValue.toLocaleString()}đ
                          </p>
                        ) : null}
                      </div>
                      
                      <p className="text-xs font-semibold text-neutral-300 mt-3 pt-3 flex items-center gap-1.5 border-t border-darkBorderV1/50">
                        <Icon path={mdiClockOutline} size={0.6} />
                        Từ {format(new Date(coupon.startDate), 'dd/MM')} - {format(new Date(coupon.endDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                </button>
              );
            }) : (
              <div className="text-center py-8 text-neutral-500 flex flex-col items-center">
                <Icon path={mdiTicketPercentOutline} size={2} className="opacity-30 mb-3" />
                <p>Không có mã khuyến mãi khả dụng</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Recurring Booking Selector Component
const RecurringBookingSelector = ({
  selectedSlots,
  selectedDate,
  onSelect,
  slotPrice,
  bookingType,
  setBookingType,
  occurrences,
  setOccurrences,
  paymentSchedule,
  setPaymentSchedule
}: {
  selectedSlots: { courtId: string, time: string, price: number }[];
  selectedDate: Date;
  onSelect: (data: { type: 'WEEKLY' | 'MONTHLY'; occurrences: number; paymentSchedule: 'FULL' | 'MONTHLY' }) => void;
  slotPrice: number;
  bookingType: 'SINGLE' | 'WEEKLY' | 'MONTHLY';
  setBookingType: (type: 'SINGLE' | 'WEEKLY' | 'MONTHLY') => void;
  occurrences: number;
  setOccurrences: (n: number) => void;
  paymentSchedule: 'FULL' | 'MONTHLY';
  setPaymentSchedule: (s: 'FULL' | 'MONTHLY') => void;
}) => {

  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Calculate preview dates
  const previewDates = useMemo(() => {
    if (bookingType === 'SINGLE') return [];
    
    const dates = [];
    let currentDate = new Date(selectedDate);
    
    for (let i = 0; i < occurrences; i++) {
      dates.push({
        date: format(currentDate, 'dd/MM'),
        dayOfWeek: days[currentDate.getDay()],
        fullDate: new Date(currentDate)
      });
      
      if (bookingType === 'WEEKLY') {
        currentDate = addWeeks(currentDate, 1);
      } else {
        currentDate = addMonths(currentDate, 1);
      }
    }
    
    return dates;
  }, [selectedDate, bookingType, occurrences]);

  // Calculate total price for recurring bookings
  const recurringTotalPrice = useMemo(() => {
    if (bookingType === 'SINGLE' || selectedSlots.length === 0) return 0;
    const slotsPerOccurrence = selectedSlots.length;
    return slotsPerOccurrence * slotPrice * occurrences;
  }, [bookingType, selectedSlots.length, slotPrice, occurrences]);

  // Handle booking type change
  const handleTypeChange = (type: BookingType) => {
    setBookingType(type);
    if (type === 'SINGLE') {
      setOccurrences(1);
      setPaymentSchedule('FULL');
    } else if (type === 'WEEKLY') {
      setOccurrences(2);
      setPaymentSchedule('FULL');
    } else {
      setOccurrences(1);
      setPaymentSchedule('MONTHLY');
    }
  };

  return (
    <div className="space-y-4 pt-2 border-t border-darkBorderV1/50">
      <div className="flex items-center gap-2">
        <Icon path={mdiCalendarSync} size={0.8} className="text-accent" />
        <Label className="text-neutral-400 text-xs uppercase tracking-wider font-bold">
          Đặt sân cố định
        </Label>
      </div>

      {/* Booking Type Tabs */}
      <div className="flex gap-2 p-1 bg-darkBackgroundV1 rounded-xl">
        {[
          { id: 'SINGLE', label: 'Đặt lẻ', icon: mdiSoccerField },
          { id: 'WEEKLY', label: 'Theo tuần', icon: mdiRepeat },
          { id: 'MONTHLY', label: 'Theo tháng', icon: mdiCalendarMonth },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeChange(type.id as BookingType)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all text-sm font-semibold",
              bookingType === type.id
                ? "bg-accent text-white shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon path={type.icon} size={0.7} />
            {type.label}
          </button>
        ))}
      </div>

      {/* Occurrences Selection */}
      {bookingType !== 'SINGLE' && (
        <div className="space-y-3 p-4 bg-darkBackgroundV1/50 rounded-xl border border-darkBorderV1/30">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-sm">
              {bookingType === 'WEEKLY' ? 'Số tuần:' : 'Số tháng:'}
            </span>
            <div className="flex gap-2">
              {(bookingType === 'WEEKLY' ? [2, 3, 4] : [1, 2, 3, 4, 5, 6]).map((num) => (
                <button
                  key={num}
                  onClick={() => setOccurrences(num)}
                  className={cn(
                    "w-10 h-10 rounded-lg font-bold text-sm transition-all",
                    occurrences === num
                      ? "bg-accent text-white"
                      : "bg-darkCardV1 text-neutral-400 hover:bg-darkBorderV1"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Total Price Preview */}
          <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20">
            <span className="text-neutral-400 text-sm">Tổng cộng:</span>
            <span className="text-accent font-bold text-lg">
              {recurringTotalPrice.toLocaleString("vi-VN")} VNĐ
            </span>
          </div>

          {/* Preview Dates */}
          <div className="space-y-2">
            <span className="text-neutral-500 text-xs">
              {bookingType === 'WEEKLY' ? 'Các ngày sẽ đặt:' : 'Các tháng sẽ đặt:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {previewDates.map((d, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg text-xs"
                >
                  <span className="text-accent font-semibold">{d.dayOfWeek}</span>
                  <span className="text-neutral-400 ml-1">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Schedule (for MONTHLY only) */}
          {bookingType === 'MONTHLY' && (
            <div className="pt-3 border-t border-darkBorderV1/30 space-y-2">
              <span className="text-neutral-400 text-sm">Hình thức thanh toán:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentSchedule('FULL')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border",
                    paymentSchedule === 'FULL'
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-darkCardV1 border-darkBorderV1 text-neutral-400"
                  )}
                >
                  Thanh toán 1 lần
                </button>
                <button
                  onClick={() => setPaymentSchedule('MONTHLY')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border",
                    paymentSchedule === 'MONTHLY'
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-darkCardV1 border-darkBorderV1 text-neutral-400"
                  )}
                >
                  Trả theo tháng
                </button>
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="pt-2 text-xs text-neutral-500 flex items-start gap-2">
            <Icon path={mdiInformationOutline} size={0.6} className="mt-0.5 flex-shrink-0" />
            <span>
              {bookingType === 'WEEKLY' && (
                <>Đặt cố định tối đa 4 tuần. Thanh toán VNPay ngay cho toàn bộ.</>
              )}
              {bookingType === 'MONTHLY' && paymentSchedule === 'FULL' && (
                <>Thanh toán VNPay ngay cho toàn bộ {occurrences} tháng.</>
              )}
              {bookingType === 'MONTHLY' && paymentSchedule === 'MONTHLY' && (
                <>Tạo {occurrences} hóa đơn, mỗi tháng 1 hóa đơn. Thanh toán tháng đầu ngay.</>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
