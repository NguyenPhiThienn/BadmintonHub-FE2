"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/mdi-icon";
import {
  mdiChevronLeft,
  mdiShareVariantOutline,
  mdiStar,
  mdiMapMarker,
  mdiClockOutline,
  mdiCalendar,
  mdiSoccerField,
  mdiInformationOutline,
  mdiChartBar,
  mdiChevronRight,
  mdiBadminton,
} from "@mdi/js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useVenueDetails,
  useVenueCourts,
  useDemandAnalytics,
  useAvailability,
  useVenuePricing
} from "@/hooks/useVenue";
import { ICourt, IAvailability, ISlot } from "@/interface/venue";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from "recharts";
import { cn } from "@/lib/utils";
import { format, addDays, addHours, startOfToday, isSameDay, getDay } from "date-fns";
import { useCreateBooking } from "@/hooks/useBooking";
import { toast } from "react-toastify";
import { vi } from "date-fns/locale";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface VenueDetailsPageProps {
  id: string;
}

// Sub-component for each court's availability grid
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
        <Icon path={mdiSoccerField} size={1} className="text-accent" />
        <h4 className="font-semibold text-base text-accent">{court.name}</h4>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
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

const VenueDetailsPage = ({ id }: VenueDetailsPageProps) => {
  const router = useRouter();
  const [dateSwiper, setDateSwiper] = useState<any>(null);

  // States
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedSlots, setSelectedSlots] = useState<{ courtId: string, time: string, price: number }[]>([]);

  // API Hooks
  const { data: venueRes, isLoading: isVenueLoading } = useVenueDetails(id);
  const { data: courtsRes } = useVenueCourts(id);
  const { data: demandRes } = useDemandAnalytics(id);
  const { data: pricingRes } = useVenuePricing(id);
  const { mutate: createBooking, isPending: isBookingLoading } = useCreateBooking();

  // FETCH ALL AVAILABILITY AT ONCE
  const { data: availabilityRes, isLoading: isAvailabilityLoading } = useAvailability({
    venueId: id,
    date: format(selectedDate, 'yyyy-MM-dd')
  });

  const venue = venueRes?.data;
  const courts = (courtsRes?.data || []) as ICourt[];
  const availabilityData = (availabilityRes?.data || []) as IAvailability[];

  // Dynamic Pricing Logic
  const currentPrice = useMemo(() => {
    if (!pricingRes?.data) return venue?.pricePerHour || 0;
    const dow = getDay(selectedDate); // 0 (Sun) to 6 (Sat)
    const dayPrice = pricingRes.data.find((p: any) => p.dayOfWeek === dow);
    return dayPrice ? dayPrice.pricePerHour : venue?.pricePerHour || 0;
  }, [pricingRes, selectedDate, venue]);

  // Date Picker Logic
  const dates = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));
  }, []);

  // AI Demand Data
  const demandData = useMemo(() => {
    const hours = ["05", "07", "09", "11", "13", "15", "17", "19", "21", "23"];
    return hours.map(h => ({
      hour: `${h}:00`,
      level: Math.random() * 100,
      isPeak: demandRes?.data?.peakHours?.includes(`${h}:00`)
    }));
  }, [demandRes]);

  const toggleSlot = (courtId: string, time: string, price: number) => {
    const isSelected = selectedSlots.some(s => s.courtId === courtId && s.time === time);
    if (isSelected) {
      setSelectedSlots(selectedSlots.filter(s => !(s.courtId === courtId && s.time === time)));
    } else {
      setSelectedSlots([...selectedSlots, { courtId, time, price }]);
    }
  };

  const totalPrice = selectedSlots.reduce((acc, s) => acc + s.price, 0);

  const handleBooking = () => {
    if (selectedSlots.length === 0) return;

    const payload = {
      venueId: id,
      details: selectedSlots.map(slot => {
        const startTimeStr = `2000-01-01T${slot.time}`;
        const endTime = format(addHours(new Date(startTimeStr), 1), 'HH:mm');

        return {
          courtId: slot.courtId,
          bookingDate: format(selectedDate, 'yyyy-MM-dd'),
          startTime: slot.time,
          endTime: endTime
        };
      })
    };

    createBooking(payload, {
      onSuccess: (res: any) => {
        toast.success("Đặt sân thành công!");
        setSelectedSlots([]);
        if (res?.data?._id) {
          router.push(`/booking/success?bookingId=${res.data._id}`);
        }
      },
      onError: (err: any) => {
        toast.error(err?.message || "Đặt sân thất bại. Vui lòng thử lại.");
      }
    });
  };

  // Clear selections when date changes
  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedDate]);

  if (isVenueLoading) return (
    <div className="h-screen bg-darkBackgroundV1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!venue) return (
    <div className="h-screen bg-darkBackgroundV1 flex flex-col items-center justify-center gap-4 text-neutral-400">
      <Icon path={mdiInformationOutline} size={2} className="text-neutral-500" />
      <p className="text-lg font-medium">Không tìm thấy thông tin sân này.</p>
      <Button onClick={() => router.push("/venues")} variant="outline">
        <Icon path={mdiChevronLeft} size={0.8} />
        Quay lại danh sách
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-darkBackgroundV1 text-neutral-300 pb-32">
      {/* 1. Image Slider */}
      <div className="relative h-72 md:h-96 w-full">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          className="h-full w-full"
        >
          {(venue?.images?.length ? venue.images : ["/images/court-1.jpg", "/images/court-2.jpg", "/images/court-3.jpg"]).map((img: string, i: number) => (
            <SwiperSlide key={i}>
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${img})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50"
          >
            <Icon path={mdiChevronLeft} size={0.8} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50"
          >
            <Icon path={mdiShareVariantOutline} size={0.8} />
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 z-10 space-y-4">
          <h1 className="text-2xl font-semibold text-white drop-shadow-lg">{venue?.name}</h1>
        </div>
      </div>

      <main className="mx-auto px-8 mt-8 space-y-8">
        <div className="flex items-center justify-between">
          {/* Breadcrumb Section */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/venues">Cơ sở sân</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{venue?.name || "Chi tiết sân"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* 2. Basic Info */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="yellow">
              <span className="text-nowrap">Đánh giá:</span>
              {Number(venue?.averageRating || 4.5).toFixed(1)}
              <Icon path={mdiStar} size={0.6} className="text-yellow-500" />
            </Badge>
            <Badge variant="green">
              <Icon path={mdiMapMarker} size={0.6} className="text-accent" />
              <span>{venue?.address}</span>
            </Badge>
          </div>
        </div>
        {/* 3. AI Demand Analytics */}
        <section className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Icon path={mdiChartBar} size={0.8} className="text-accent" />
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-accent">AI Demand Forecast</h3>
                <p className="text-neutral-400 text-base font-medium">Mức độ đông sân theo thời gian</p>
              </div>
            </div>
            <Badge variant="green">
              Nhu nhu cầu: {demandRes?.data?.demandLevel || "Cao"}
            </Badge>
          </div>

          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradientPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="barGradientNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#404040" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ color: 'hsl(var(--accent))', fontWeight: 'bold', fontSize: '12px' }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '12px' }}
                  formatter={(value: number) => [`${value.toFixed(0)}%`, 'Nhu cầu']}
                />
                <Bar
                  dataKey="level"
                  radius={[12, 12, 0, 0]}
                  barSize={80}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {demandData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isPeak ? 'url(#barGradientPeak)' : 'url(#barGradientNormal)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-2 text-neutral-400 text-base italic">
            <Icon path={mdiInformationOutline} size={0.8} />
            Dự báo dựa trên dữ liệu 30 ngày qua.
          </div>
        </section>

        {/* 4. Sticky Date Picker */}
        <section className="sticky top-0 z-20 bg-darkBackgroundV1/90 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-accent font-semibold whitespace-nowrap">Chọn ngày chơi</h3>
            <div className="flex-1 border-b border-dashed border-accent mr-1" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dateSwiper?.slidePrev()}
                className={cn(
                  "rounded-full",
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
                  "rounded-full",
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
              spaceBetween={16}
              className="w-full"
            >
              {dates.map((date, i) => {
                const isSelected = isSameDay(date, selectedDate);
                return (
                  <SwiperSlide key={i} style={{ width: 'auto' }}>
                    <button
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "flex flex-col items-center justify-center px-4 h-20 rounded-xl border transition-all shrink-0",
                        isSelected
                          ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                          : "bg-darkCardV1 border-darkBorderV1 text-neutral-300 hover:border-neutral-700"
                      )}
                    >
                      <span className="text-sm font-semibold mb-1 ">
                        {format(date, 'EEE', { locale: vi })}
                      </span>
                      <span className="text-sm font-medium">
                        {format(date, 'dd/MM/yyyy')}
                      </span>
                    </button>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </section>

        {/* 5. Court & Time Slot Picker */}
        <section className="space-y-4">
          <div className="flex items-center gap-4 flex-1">
            <h3 className="text-accent font-semibold whitespace-nowrap">Chọn sân & khung giờ</h3>
            <div className="flex-1 border-b border-dashed border-accent mr-1" />
          </div>

          {isAvailabilityLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-neutral-400">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Đang tải lịch sân...</p>
            </div>
          ) : availabilityData.length > 0 ? (
            availabilityData.map((courtAvail: IAvailability) => (
              <CourtTimeGrid
                key={courtAvail.courtId}
                court={{
                  _id: courtAvail.courtId,
                  name: courtAvail.courtName,
                  venueId: id,
                  status: 'AVAILABLE'
                }}
                courtAvailability={courtAvail}
                currentPrice={currentPrice}
                selectedSlots={selectedSlots}
                onToggle={(time, price) => toggleSlot(courtAvail.courtId, time, price)}
              />
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-neutral-400 border border-dashed border-darkBorderV1 rounded-2xl">
              <Icon path={mdiInformationOutline} size={1} />
              <p className="text-sm font-medium">Không có lịch sân khả dụng cho ngày này.</p>
            </div>
          )}
        </section>
      </main>

      {/* 6. Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-darkBackgroundV2/80 backdrop-blur-xl border-t border-darkBorderV1 p-4 flex items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <span className="text-neutral-400 text-base font-medium">
            {selectedSlots.length} slot đã chọn
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-accent leading-none">
              {totalPrice.toLocaleString()}
            </span>
            <span className="text-neutral-400 text-sm font-medium">VNĐ</span>
          </div>
        </div>
        <Button
          disabled={selectedSlots.length === 0 || isBookingLoading}
          onClick={handleBooking}
        >
          {isBookingLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon path={mdiSoccerField} size={0.8} />
          )}
          {isBookingLoading ? "Đang xử lý..." : "Đặt sân ngay"}
        </Button>
      </footer>
    </div>
  );
};

export default VenueDetailsPage;
