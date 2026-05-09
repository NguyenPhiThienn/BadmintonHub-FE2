"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { IAvailability, ICourt, ISlot } from "@/interface/venue";
import { cn } from "@/lib/utils";
import { mdiBadminton, mdiChevronLeft, mdiChevronRight, mdiInformationOutline, mdiSoccerField } from "@mdi/js";
import { format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
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
}

const CourtTimeGrid = ({
  court,
  courtAvailability,
  currentPrice,
  selectedSlots,
  onToggle
}: {
  court: ICourt,
  courtAvailability?: IAvailability,
  currentPrice: number,
  selectedSlots: { courtId: string, time: string }[],
  onToggle: (time: string, price: number) => void
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
          const isBooked = slot.status !== "AVAILABLE";
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
  venueId
}: BookingSectionProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <span className="text-sm font-bold">
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
        ) : availabilityData.length > 0 ? (
          <div className="space-y-8">
            {availabilityData.map((courtAvail: IAvailability) => (
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
    </div>
  );
};
