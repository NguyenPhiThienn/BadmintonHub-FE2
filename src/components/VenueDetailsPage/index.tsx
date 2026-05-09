"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { useCreateBooking, useCreatePaymentUrl } from "@/hooks/useBooking";
import {
  useAvailability,
  useVenueDetails,
  useVenuePricing
} from "@/hooks/useVenue";
import { IAvailability } from "@/interface/venue";
import {
  mdiChevronLeft,
  mdiInformationOutline
} from "@mdi/js";
import { addDays, format, getDay, startOfToday } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { BookingSection } from "./BookingSection";
import { ReviewSection } from "./ReviewSection";
import { VenueFooter } from "./VenueFooter";
import { VenueHeader } from "./VenueHeader";

interface VenueDetailsPageProps {
  id: string;
}

const VenueDetailsPage = ({ id }: VenueDetailsPageProps) => {
  const router = useRouter();
  const [dateSwiper, setDateSwiper] = useState<any>(null);

  // States
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedSlots, setSelectedSlots] = useState<{ courtId: string, time: string, price: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"VNPAY" | "CASH">("CASH");

  // API Hooks
  const { data: venueRes, isLoading: isVenueLoading } = useVenueDetails(id);
  const { data: pricingRes } = useVenuePricing(id);
  const { mutate: createBooking, isPending: isBookingLoading } = useCreateBooking();
  const { mutate: createPaymentUrl, isPending: isPaymentLoading } = useCreatePaymentUrl();

  // FETCH ALL AVAILABILITY AT ONCE
  const { data: availabilityRes, isLoading: isAvailabilityLoading } = useAvailability({
    venueId: id,
    date: format(selectedDate, 'yyyy-MM-dd')
  });

  const venue = venueRes?.data;
  const availabilityData = (availabilityRes?.data || []) as IAvailability[];

  const currentPrice = useMemo(() => {
    if (!pricingRes?.data) return venue?.pricePerHour || 0;
    const dow = getDay(selectedDate); // 0 (Sun) to 6 (Sat)
    const dayPrice = pricingRes.data.find((p: any) => p.dayOfWeek === dow);
    return dayPrice ? dayPrice.pricePerHour : venue?.pricePerHour || 0;
  }, [pricingRes, selectedDate, venue]);

  const dates = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));
  }, []);

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
      details: selectedSlots.map(slot => ({
        courtId: slot.courtId,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: slot.time,
        endTime: `${(parseInt(slot.time.split(':')[0]) + 1).toString().padStart(2, '0')}:00`
      }))
    };

    createBooking(payload, {
      onSuccess: (res: any) => {
        if (res?.data?._id) {
          const bookingId = res.data._id;
          createPaymentUrl({ bookingId, method: paymentMethod }, {
            onSuccess: (paymentRes: any) => {
              if (paymentMethod === "VNPAY" && paymentRes?.data?.paymentUrl) {
                window.location.href = paymentRes.data.paymentUrl;
              } else {
                toast.success("Đặt sân thành công!");
                setSelectedSlots([]);
                router.push(`/booking/success?bookingId=${bookingId}`);
              }
            },
            onError: (err: any) => {
              toast.error(err?.message || "Lỗi tạo thanh toán. Vui lòng thử lại.");
            }
          });
        }
      },
      onError: (err: any) => {
        toast.error(err?.message || "Đặt sân thất bại. Vui lòng thử lại.");
      }
    });
  };

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
      <Icon path={mdiInformationOutline} size={0.8} className="text-neutral-500" />
      <p className="text-lg font-medium">Không tìm thấy thông tin sân này.</p>
      <Button onClick={() => router.push("/venues")} variant="outline">
        <Icon path={mdiChevronLeft} size={0.8} />
        Quay lại danh sách
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-darkBackgroundV1 text-neutral-300 pb-32">
      <VenueHeader venue={venue} />
      <main className="mx-auto px-4 mt-4 space-y-4">
        <BookingSection
          dates={dates}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          dateSwiper={dateSwiper}
          setDateSwiper={setDateSwiper}
          isAvailabilityLoading={isAvailabilityLoading}
          availabilityData={availabilityData}
          currentPrice={currentPrice}
          selectedSlots={selectedSlots}
          onToggleSlot={toggleSlot}
          venueId={id}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />

        <ReviewSection />
      </main>
      <VenueFooter
        selectedSlotsCount={selectedSlots.length}
        totalPrice={totalPrice}
        onBooking={handleBooking}
        isBookingLoading={isBookingLoading || isPaymentLoading}
      />
    </div>
  );
};

export default VenueDetailsPage;
