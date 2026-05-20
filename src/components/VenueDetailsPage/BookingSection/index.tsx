"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/mdi-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiBookingRecommendation } from "@/hooks/useVenue";
import { IAvailability, ICourt, ISlot } from "@/interface/venue";
import { cn } from "@/lib/utils";
import { mdiBadminton, mdiChevronLeft, mdiChevronRight, mdiInformationOutline, mdiShimmer, mdiSoccerField } from "@mdi/js";
import { format, isSameDay, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

interface BookingSectionProps {
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
  isWeekly: boolean;
  setIsWeekly: (isWeekly: boolean) => void;
  userId: string;
}

const CourtTimeGrid = ({
  court,
  courtAvailability,
  currentPrice,
  selectedSlots,
  onToggle,
  userId
}: {
  court: ICourt,
  courtAvailability?: IAvailability,
  currentPrice: number,
  selectedSlots: { courtId: string, time: string }[],
  onToggle: (time: string, price: number) => void,
  userId: string
}) => {
  const slots = courtAvailability?.slots || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        <Icon path={mdiSoccerField} size={0.8} className="text-accent" />
        <h4 className="font-semibold text-base text-accent">{court.name}</h4>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-4">
        {slots.map((slot: ISlot) => {
          const isBooked = slot.status !== "AVAILABLE" && !(slot.status === "LOCKED" && slot.userId === userId);
          const isSelected = selectedSlots.some(s => s.courtId === court._id && s.time === slot.startTime);

          return (
            <button
              key={slot.startTime}
              disabled={isBooked}
              onClick={() => onToggle(slot.startTime, currentPrice)}
              className={cn(
                "h-11 rounded-lg text-sm font-medium border-2 transition-all relative overflow-hidden",
                isBooked
                  ? "bg-neutral-900 border-darkBorderV1 text-neutral-700 cursor-not-allowed"
                  : isSelected
                    ? "bg-accent/10 border-accent text-accent"
                    : "bg-darkCardV1 border-darkBorderV1 text-neutral-400 hover:border-darkBorderV1"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon path={mdiBadminton} size={0.6} className={cn(
                  isSelected ? "text-accent" : "text-neutral-400"
                )} />
                <span className="font-semibold whitespace-nowrap">
                  {slot.startTime} - {slot.endTime}
                </span>
              </div>
              {isBooked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-full h-[1px] bg-neutral-700 rotate-12" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const BookingSection = ({
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
  isWeekly,
  setIsWeekly,
  userId
}: BookingSectionProps) => {
  const { data: aiRecRes, isLoading: isAiLoading } = useAiBookingRecommendation(venueId);
  const [showAiRec, setShowAiRec] = useState(true);
  const aiRec = aiRecRes?.data;

  const handleApplyAiRec = () => {
    if (!aiRec) return;
    const recDate = parseISO(aiRec.date);
    onDateChange(recDate);
  };

  const filteredAvailabilityData = availabilityData.map(courtAvail => {
    const filteredSlots = (courtAvail.slots || []).filter((slot: ISlot) => {
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hours, minutes, 0, 0);
      return slotTime > new Date();
    });
    return { ...courtAvail, slots: filteredSlots };
  }).filter(courtAvail => courtAvail.slots.length > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isAiLoading && (
          <div className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
          </div>
        )}

        {aiRec && showAiRec && (
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-2xl p-4 relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-4 w-full">
                <h4 className="text-accent font-semibold text-sm flex items-center gap-2">
                  <Icon path={mdiShimmer} size={0.8} />
                  ĐỀ XUẤT CHO BẠN
                  <Badge variant="green">
                    Tối ưu nhất
                  </Badge>
                </h4>
                <div className="text-neutral-300 text-base font-medium flex flex-wrap items-center gap-1.5">
                  Khung giờ từ
                  <Badge variant="amber" className="px-3 py-1 text-sm">
                    {aiRec.startTime} - {aiRec.endTime}
                  </Badge>
                  vào ngày
                  <Badge variant="amber" className="px-3 py-1 text-sm">
                    {format(parseISO(aiRec.date), 'dd/MM/yyyy')}
                  </Badge>
                  là lựa chọn hoàn hảo nhất!
                </div>
                <p className="text-neutral-300 text-base">
                  {aiRec.reason}
                </p>
                {aiRec.benefits && aiRec.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {aiRec.benefits.map((benefit: string, idx: number) => (
                      <Badge key={idx} variant="green">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex w-full items-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAiRec(false)}
                    className="flex-1"
                  >
                    Bỏ qua
                  </Button>
                  <Button
                    variant="accent"
                    onClick={handleApplyAiRec}
                    className="flex-1"
                  >
                    <Icon path={mdiShimmer} size={0.8} />
                    Áp dụng lịch đề xuất
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {/* Date Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-4 w-full justify-between">
              <div className="flex-1 flex items-center gap-3 md:gap-4">
                <h3 className="text-accent font-semibold whitespace-nowrap">Chọn ngày chơi</h3>
                <div className="flex-1 border-b border-dashed border-accent mr-1" />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dateSwiper?.slidePrev()}
                  className={cn(
                    "rounded-full h-8 w-8",
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
                    "rounded-full h-8 w-8",
                    !dateSwiper && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon path={mdiChevronRight} size={0.8} />
                </Button>
              </div>
            </div>

            <div className="w-full relative px-4">
              <Swiper
                onSwiper={(swiper) => setDateSwiper(swiper)}
                slidesPerView="auto"
                spaceBetween={16}
                className="w-full"
              >
                {dates.map((date, i) => {
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <SwiperSlide key={i} style={{ width: 'auto' }}>
                      <button
                        onClick={() => onDateChange(date)}
                        className={cn(
                          "flex flex-col items-center justify-center px-4 h-20 rounded-xl border transition-all shrink-0 min-w-[100px]",
                          isSelected
                            ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                            : "bg-darkCardV1 border-darkBorderV1 text-neutral-400 hover:border-neutral-700"
                        )}
                      >
                        <span className="text-xs font-semibold mb-1 uppercase">
                          {format(date, 'EEE', { locale: vi })}
                        </span>
                        <span className="text-sm font-semibold">
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
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center gap-3 md:gap-4">
                <h3 className="text-accent font-semibold whitespace-nowrap">Chọn sân & khung giờ</h3>
                <div className="flex-1 border-b border-dashed border-accent mr-1" />
              </div>
            </div>

            {isAvailabilityLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-neutral-400 bg-darkCardV1 rounded-2xl border border-darkBorderV1">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Đang tải lịch sân...</p>
              </div>
            ) : filteredAvailabilityData.length > 0 ? (
              <div className="space-y-8">
                {filteredAvailabilityData.map((courtAvail: IAvailability) => (
                  <CourtTimeGrid
                    key={courtAvail.courtId}
                    court={{
                      _id: courtAvail.courtId,
                      name: courtAvail.courtName,
                      venueId: venueId,
                      status: 'AVAILABLE'
                    }}
                    courtAvailability={courtAvail}
                    currentPrice={currentPrice}
                    selectedSlots={selectedSlots}
                    onToggle={(time, price) => onToggleSlot(courtAvail.courtId, time, price)}
                    userId={userId}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-neutral-400 border border-dashed border-darkBorderV1 rounded-2xl bg-darkCardV1/50">
                <Icon path={mdiInformationOutline} size={0.8} />
                <p className="text-sm font-medium">Không có lịch sân khả dụng cho ngày này.</p>
              </div>
            )}
          </section>

          {/* Payment Section */}
          {selectedSlots.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-3 md:gap-4">
                  <h3 className="text-accent font-semibold whitespace-nowrap">Chọn phương thức thanh toán</h3>
                  <div className="flex-1 border-b border-dashed border-accent mr-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                    paymentMethod === "CASH"
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-darkCardV1 border-darkBorderV1 text-neutral-400 hover:border-neutral-700"
                  )}
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-white rounded-full overflow-hidden p-1">
                    <Image
                      src="/images/money-logo.webp"
                      alt="Cash"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-semibold text-base">Thanh toán bằng tiền mặt</span>
                </button>
                <button
                  disabled={isWeekly}
                  onClick={() => setPaymentMethod("VNPAY")}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                    isWeekly
                      ? "opacity-50 cursor-not-allowed bg-darkCardV1 border-darkBorderV1 text-neutral-500"
                      : paymentMethod === "VNPAY"
                        ? "bg-accent/10 border-accent text-accent"
                        : "bg-darkCardV1 border-darkBorderV1 text-neutral-400 hover:border-neutral-700"
                  )}
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-white rounded-full overflow-hidden p-1">
                    <Image
                      src="/images/vnpay-logo.webp"
                      alt="VNPay"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-semibold text-base">Thanh toán bằng VNPay</span>
                </button>
              </div>
            </section>
          )}

          {/* Customer Info Section */}
          {selectedSlots.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-3 md:gap-4">
                  <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin khách hàng</h3>
                  <div className="flex-1 border-b border-dashed border-accent mr-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Nhập email để nhận thông tin đơn hàng"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Weekly Booking Checkbox */}
          {selectedSlots.length > 0 && (
            <section className="pt-2">
              <button
                onClick={() => {
                  const newIsWeekly = !isWeekly;
                  setIsWeekly(newIsWeekly);
                  if (newIsWeekly && paymentMethod === "VNPAY") {
                    setPaymentMethod("CASH");
                  }
                }}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-all w-full text-left",
                  isWeekly
                    ? "bg-accent/10 border-accent text-accent"
                    : "bg-darkCardV1 border-darkBorderV1 text-neutral-400 hover:border-neutral-700"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                  isWeekly ? "bg-accent border-accent" : "border-neutral-600"
                )}>
                  {isWeekly && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-base">Có đặt sân cố định hàng tuần hay không</p>
                  <p className="text-sm opacity-70">Hệ thống sẽ tự động tạo đơn cho các tuần tiếp theo</p>
                </div>
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
