"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMe } from "@/hooks/useAuth";
import { useCreateBooking, useCreatePaymentUrl, usePreviewRecurringBooking, useCreateRecurringBooking } from "@/hooks/useBooking";
import {
  useAvailability,
  useLockSlot,
  useUnlockSlot,
  useVenueDetails,
  useVenuePricing
} from "@/hooks/useVenue";
import { IAvailability } from "@/types/venue";
import {
  mdiAlertCircleOutline,
  mdiChevronLeft,
  mdiHome,
  mdiInformationOutline
} from "@mdi/js";
import { addDays, format, getDay, startOfToday } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { toast } from "react-toastify";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { BookingSection } from "./BookingSection";
import { ReviewSection } from "./ReviewSection";
import { VenueHeader } from "./VenueHeader";
import Link from "next/link";

interface VenueDetailsPageProps {
  id: string;
}

const VenueDetailsPage = ({ id }: VenueDetailsPageProps) => {
  const router = useRouter();
  const [dateSwiper, setDateSwiper] = useState<any>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  // Scroll to review section
  const scrollToReviews = () => {
    reviewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // States
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedSlots, setSelectedSlots] = useState<{ courtId: string, time: string, price: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"VNPAY" | "CASH">("CASH");

  // Customer Info States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const [bookingType, setBookingType] = useState<'SINGLE' | 'WEEKLY' | 'MONTHLY'>('SINGLE');
  const [recurringOccurrences, setRecurringOccurrences] = useState(2);
  const [recurringPaymentSchedule, setRecurringPaymentSchedule] = useState<'FULL' | 'MONTHLY'>('FULL');

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
  const isPlayerBlocked = me?.status === 'BLOCKED';

  useEffect(() => {
    if (me) {
      setCustomerName(me.fullName || "");
      setCustomerPhone(me.phone || "");
      setCustomerEmail(me.email || "");
    }
  }, [me]);

  // Show blocked dialog once when user gets blocked (polling-safe)
  useEffect(() => {
    if (isPlayerBlocked && !showBlockedDialog) {
      setShowBlockedDialog(true);
    }
  }, [isPlayerBlocked, showBlockedDialog]);

  // API Hooks
  const { data: venueRes, isLoading: isVenueLoading } = useVenueDetails(id);
  const { data: pricingRes } = useVenuePricing(id);
  const { mutate: createBooking, isPending: isBookingLoading } = useCreateBooking();
  const { mutate: createPaymentUrl, isPending: isPaymentLoading } = useCreatePaymentUrl();
  const { mutate: previewRecurring, data: previewData } = usePreviewRecurringBooking();
  const { mutate: createRecurringBooking, isPending: isRecurringLoading } = useCreateRecurringBooking();
  const { mutateAsync: lockSlot } = useLockSlot();
  const { mutateAsync: unlockSlot } = useUnlockSlot();

  // FETCH ALL AVAILABILITY AT ONCE
  const { data: availabilityRes, isLoading: isAvailabilityLoading } = useAvailability({
    venueId: id,
    date: format(selectedDate, 'yyyy-MM-dd'),
    userId
  });

  const venue = venueRes?.data;
  const [availabilityData, setAvailabilityData] = useState<IAvailability[]>([]);

  // Sync server data into local state whenever it changes
  useEffect(() => {
    setAvailabilityData((availabilityRes?.data || []) as IAvailability[]);
  }, [availabilityRes]);

  // --- Real-time WebSocket sync ---
  const { on } = useSocket();
  const currentDateStr = format(selectedDate, 'yyyy-MM-dd');

  const patchSlot = useCallback((courtId: string, date: string, startTime: string, newStatus: string, patchUserId?: string) => {
    if (date !== currentDateStr) return; // ignore other dates
    setAvailabilityData(prev => prev.map(courtAvail => {
      if (courtAvail.courtId !== courtId) return courtAvail;
      return {
        ...courtAvail,
        slots: (courtAvail.slots || []).map(slot => {
          if (slot.startTime !== startTime) return slot;
          return { ...slot, status: newStatus, userId: patchUserId ?? slot.userId };
        })
      };
    }));
  }, [currentDateStr]);

  useEffect(() => {
    const offLocked = on('slot:locked', (data: any) => {
      patchSlot(data.courtId, data.date, data.startTime, 'LOCKED', data.userId);
    });
    const offUnlocked = on('slot:unlocked', (data: any) => {
      patchSlot(data.courtId, data.date, data.startTime, 'AVAILABLE', undefined);
    });
    const offCreated = on('booking:created', (data: any) => {
      patchSlot(data.courtId, data.date, data.startTime, 'BOOKED', undefined);
    });
    const offCancelled = on('booking:cancelled', (data: any) => {
      patchSlot(data.courtId, data.date, data.startTime, 'AVAILABLE', undefined);
    });
    return () => { offLocked(); offUnlocked(); offCreated(); offCancelled(); };
  }, [on, patchSlot]);

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

    // Optimistic update — update UI immediately before API response
    if (isSelected) {
      setSelectedSlots(prev => prev.filter(s => !(s.courtId === courtId && s.time === time)));
      patchSlot(courtId, dateStr, time, 'AVAILABLE', undefined);
    } else {
      setSelectedSlots(prev => [...prev, { courtId, time, price }]);
      patchSlot(courtId, dateStr, time, 'LOCKED', userId);
    }

    try {
      if (isSelected) {
        await unlockSlot({ courtId, date: dateStr, startTime: time, userId });
      } else {
        await lockSlot({ courtId, date: dateStr, startTime: time, userId });
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      if (isSelected) {
        setSelectedSlots(prev => [...prev, { courtId, time, price }]);
        patchSlot(courtId, dateStr, time, 'LOCKED', userId);
      } else {
        setSelectedSlots(prev => prev.filter(s => !(s.courtId === courtId && s.time === time)));
        patchSlot(courtId, dateStr, time, 'AVAILABLE', undefined);
      }
      toast.error(err?.message || "Khung giờ này đang được chọn bởi người khác hoặc đã được đặt!");
    }
  };

  const totalPrice = selectedSlots.reduce((acc, s) => acc + s.price, 0);

  const handleBooking = (couponId?: string) => {
    if (selectedSlots.length === 0) return;

    if (bookingType === 'SINGLE') {
      // Đặt lẻ
      const payload: any = {
        venueId: id,
        details: selectedSlots.map(slot => ({
          courtId: slot.courtId,
          bookingDate: format(selectedDate, 'yyyy-MM-dd'),
          startTime: slot.time,
          endTime: `${(parseInt(slot.time.split(':')[0]) + 1).toString().padStart(2, '0')}:00`
        })),
        note: "",
        customerName,
        customerPhone,
        customerEmail
      };

      if (couponId) {
        payload.couponId = couponId;
      }

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
    } else {
      // Đặt theo tuần/tháng - khách vãng lai, không lấy thông tin khách hàng
      const firstSlot = selectedSlots[0];
      const payload = {
        venueId: id,
        courtId: firstSlot.courtId,
        type: bookingType,
        occurrences: recurringOccurrences,
        startDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: firstSlot.time,
        endTime: `${(parseInt(firstSlot.time.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
        paymentSchedule: recurringPaymentSchedule,
      };

      createRecurringBooking(payload, {
        onSuccess: (res: any) => {
          const firstBookingId = res?.data?.firstBookingId || res?.data?.bookingIds?.[0];

          if (firstBookingId) {
            createPaymentUrl({ bookingId: firstBookingId, method: "VNPAY" }, {
              onSuccess: (paymentRes: any) => {
                if (paymentRes?.data?.paymentUrl) {
                  window.location.href = paymentRes.data.paymentUrl;
                } else {
                  toast.success("Đặt sân cố định thành công!");
                  setSelectedSlots([]);
                  setBookingType('SINGLE');
                  router.push(`/booking/success?bookingId=${firstBookingId}`);
                }
              },
              onError: (err: any) => {
                toast.error(err?.message || "Lỗi tạo thanh toán. Vui lòng thử lại.");
              }
            });
          }
        },
        onError: (err: any) => {
          toast.error(err?.message || "Đặt sân cố định thất bại. Vui lòng thử lại.");
        }
      });
    }
  };

  // Refs to track current selection for unmount cleanup
  const latestSlotsRef = useRef(selectedSlots);
  const latestDateRef = useRef(selectedDate);
  const userIdRef = useRef(userId);

  // Update refs when selection or date changes
  useEffect(() => {
    latestSlotsRef.current = selectedSlots;
    latestDateRef.current = selectedDate;
    userIdRef.current = userId;
  }, [selectedSlots, selectedDate, userId]);

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
    const handleBeforeUnload = () => {
      const slotsToRelease = latestSlotsRef.current;
      const dateToRelease = latestDateRef.current;
      const uid = userIdRef.current;
      
      if (slotsToRelease.length > 0) {
        const dateStr = format(dateToRelease, 'yyyy-MM-dd');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://BadmintonHubbe.onrender.com/api/v1";
        slotsToRelease.forEach(slot => {
          const payload = JSON.stringify({
            courtId: slot.courtId,
            date: dateStr,
            startTime: slot.time,
            userId: uid
          });
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(`${baseUrl}/availability/unlock`, blob);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
      {/* Alert when player is blocked */}
      <Dialog open={showBlockedDialog} onOpenChange={setShowBlockedDialog}>
        <DialogContent size="small" className="!max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-500">
              <Icon path={mdiAlertCircleOutline} size={0.9} />
              Bạn đã bị khóa đặt sân!
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-neutral-300">
              <span className="font-medium text-neutral-400">Lý do: </span>
              {me?.blockedReason || "Vui lòng kiểm tra hộp thư thông báo hoặc liên hệ Admin để biết nguyên nhân chi tiết."}
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              Liên hệ <span className="font-medium">0963785612</span> để được hỗ trợ mở khóa.
            </p>
          </div>
          <DialogFooter>
            <Link href="/">
              <Button variant="outline">
                <Icon path={mdiHome} size={0.8} />
                Quay về trang chủ
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <VenueHeader venue={venue} />
      <main className="max-w-7xl mx-auto px-4 xl:px-0 mt-8 space-y-8">
        <BookingSection
          venue={venue}
          totalPrice={totalPrice}
          onBooking={handleBooking}
          isBookingLoading={isBookingLoading || isPaymentLoading || isRecurringLoading}
          isBlocked={isPlayerBlocked}
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
          userId={userId}
          bookingType={bookingType}
          setBookingType={setBookingType}
          recurringOccurrences={recurringOccurrences}
          setRecurringOccurrences={setRecurringOccurrences}
          recurringPaymentSchedule={recurringPaymentSchedule}
          setRecurringPaymentSchedule={setRecurringPaymentSchedule}
        />

        <ReviewSection venueId={id} ref={reviewSectionRef} venueOwnerId={typeof venue?.ownerId === 'string' ? venue?.ownerId : (venue?.ownerId as any)?._id} />
      </main>
    </div>
  );
};

export default VenueDetailsPage;
