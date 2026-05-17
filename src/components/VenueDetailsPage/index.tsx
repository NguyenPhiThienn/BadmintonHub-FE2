"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { useMe } from "@/hooks/useAuth";
import { useCreateBooking, useCreatePaymentUrl } from "@/hooks/useBooking";
import {
  useAvailability,
  useLockSlot,
  useUnlockSlot,
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
import { useEffect, useMemo, useRef, useState } from "react";
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

  // Customer Info States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isWeekly, setIsWeekly] = useState(false);

  // Generate stable session ID for lock mechanism
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = sessionStorage.getItem("booking_session_id");
      if (!id) {
        id = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem("booking_session_id", id);
      }
      return id;
    }
    return "guest";
  });

  // Auth Hook
  const { data: meRes } = useMe();
  const me = meRes?.data;
  const userId = me?._id || sessionId;

  useEffect(() => {
    if (me) {
      setCustomerName(me.fullName || "");
      setCustomerPhone(me.phone || "");
      setCustomerEmail(me.email || "");
    }
  }, [me]);

  // API Hooks
  const { data: venueRes, isLoading: isVenueLoading } = useVenueDetails(id);
  const { data: pricingRes } = useVenuePricing(id);
  const { mutate: createBooking, isPending: isBookingLoading } = useCreateBooking();
  const { mutate: createPaymentUrl, isPending: isPaymentLoading } = useCreatePaymentUrl();
  const { mutateAsync: lockSlot } = useLockSlot();
  const { mutateAsync: unlockSlot } = useUnlockSlot();

  // FETCH ALL AVAILABILITY AT ONCE
  const { data: availabilityRes, isLoading: isAvailabilityLoading } = useAvailability({
    venueId: id,
    date: format(selectedDate, 'yyyy-MM-dd'),
    userId
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

  // Helper to release locks in backend
  const releaseAllLocks = async (slotsToRelease: typeof selectedSlots, dateToRelease: Date) => {
    if (slotsToRelease.length === 0) return;
    const dateStr = format(dateToRelease, 'yyyy-MM-dd');

    await Promise.all(
      slotsToRelease.map(slot =>
        unlockSlot({
          courtId: slot.courtId,
          date: dateStr,
          startTime: slot.time,
          userId
        }).catch(err => console.error("Error releasing lock:", err))
      )
    );
  };

  const toggleSlot = async (courtId: string, time: string, price: number) => {
    const isSelected = selectedSlots.some(s => s.courtId === courtId && s.time === time);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      if (isSelected) {
        await unlockSlot({ courtId, date: dateStr, startTime: time, userId });
        setSelectedSlots(selectedSlots.filter(s => !(s.courtId === courtId && s.time === time)));
      } else {
        await lockSlot({ courtId, date: dateStr, startTime: time, userId });
        setSelectedSlots([...selectedSlots, { courtId, time, price }]);
      }
    } catch (err: any) {
      toast.error(err?.message || "Khung giờ này đang được chọn bởi người khác hoặc đã được đặt!");
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
      })),
      note: "",
      isWeekly,
      customerName,
      customerPhone,
      customerEmail
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

  // Refs to track current selection for unmount cleanup
  const latestSlotsRef = useRef(selectedSlots);
  const latestDateRef = useRef(selectedDate);

  // Update refs when selection or date changes
  useEffect(() => {
    latestSlotsRef.current = selectedSlots;
    latestDateRef.current = selectedDate;
  }, [selectedSlots, selectedDate]);

  // Ref to track previous date for date-change cleanup
  const prevDateRef = useRef(selectedDate);

  // Handle date change: release locks of previous date and clear selection
  useEffect(() => {
    if (selectedDate.getTime() !== prevDateRef.current.getTime()) {
      const slotsToRelease = [...selectedSlots];
      const oldDate = prevDateRef.current;

      setSelectedSlots([]);
      prevDateRef.current = selectedDate;

      if (slotsToRelease.length > 0) {
        releaseAllLocks(slotsToRelease, oldDate);
      }
    }
  }, [selectedDate]);

  // Handle page unmount: release all locks currently held by the user
  useEffect(() => {
    return () => {
      const slotsToRelease = latestSlotsRef.current;
      const dateToRelease = latestDateRef.current;
      if (slotsToRelease.length > 0) {
        releaseAllLocks(slotsToRelease, dateToRelease);
      }
    };
  }, []);

  if (isVenueLoading) return (
    <div className="h-screen bg-darkBackgroundV1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!venue) return (
    <div className="h-screen bg-darkBackgroundV1 flex flex-col items-center justify-center gap-4 text-neutral-400">
      <Icon path={mdiInformationOutline} size={0.8} className="text-gray-500" />
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
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerEmail={customerEmail}
          setCustomerEmail={setCustomerEmail}
          isWeekly={isWeekly}
          setIsWeekly={setIsWeekly}
          userId={userId}
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
