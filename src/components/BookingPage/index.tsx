"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/mdi-icon";
import {
  mdiChevronLeft,
  mdiCalendar,
  mdiClockOutline,
  mdiMapMarker,
  mdiTicketPercentOutline,
  mdiCheckCircle,
  mdiCreditCardOutline,
  mdiWalletOutline,
  mdiCash
} from "@mdi/js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCheckVoucher, useCreateBooking, useCreatePaymentUrl } from "@/hooks/useBooking";
import { useMe } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// Sub-components
const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-neutral-400 text-sm font-bold uppercase mb-4 px-1">
    {title}
  </h2>
);

const BookingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States from URL or fallback
  const venueId = searchParams?.get("venueId") || "";
  const venueName = searchParams?.get("venueName") || "Sân Cầu Lông Alpha";
  const courtName = searchParams?.get("courtName") || "Sân số 1";
  const dateStr = searchParams?.get("date") || "2024-06-12";
  const startTime = searchParams?.get("startTime") || "08:00";
  const endTime = searchParams?.get("endTime") || "10:00";
  const basePrice = Number(searchParams?.get("price")) || 200000;

  // App States
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"VNPAY" | "MOMO" | "CASH">("VNPAY");

  // Hooks
  const { data: userRes } = useMe();
  const checkVoucherMutation = useCheckVoucher();
  const createBookingMutation = useCreateBooking();
  const createPaymentUrlMutation = useCreatePaymentUrl();

  const playerId = userRes?.data?._id || "";

  const handleApplyVoucher = () => {
    if (!voucherCode) return;
    checkVoucherMutation.mutate(
      { code: voucherCode, venueId },
      {
        onSuccess: (res: any) => {
          if (res.data?.isValid) {
            setDiscount(res.data.discountAmount);
          } else {
            alert(res.message || "Mã giảm giá không hợp lệ");
          }
        }
      }
    );
  };

  const handlePayment = () => {
    const finalPrice = Math.max(0, basePrice - discount);

    const payload = {
      playerId: playerId,
      venueId: venueId,
      totalPrice: basePrice,
      finalPrice: finalPrice,
      details: [{
        courtId: searchParams?.get("courtId") || "court_123",
        bookingDate: dateStr,
        startTime: startTime,
        endTime: endTime,
        price: basePrice
      }]
    };

    createBookingMutation.mutate(payload, {
      onSuccess: (bookingRes: any) => {
        const bookingId = bookingRes.data?._id;
        if (paymentMethod === "CASH") {
          router.push("/booking/success");
          return;
        }

        createPaymentUrlMutation.mutate({
          bookingId: bookingId,
          method: paymentMethod
        }, {
          onSuccess: (paymentRes: any) => {
            if (paymentRes.data?.payment_url) {
              window.location.href = paymentRes.data.payment_url;
            }
          }
        });
      }
    });
  };

  const finalPrice = Math.max(0, basePrice - discount);

  return (
    <div className="min-h-screen bg-darkBackgroundV1 text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-darkBackgroundV1/60 backdrop-blur-xl border-b border-darkBorderV1">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full bg-darkCardV1 border border-darkBorderV1 hover:bg-darkBorderV1 transition-all"
          >
            <Icon path={mdiChevronLeft} size={1} />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white">Xác nhận đặt sân</h1>
            <p className="text-neutral-400 text-sm">Vui lòng kiểm tra lại thông tin trước khi thanh toán</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Details & Payment Methods */}
          <div className="lg:col-span-8 space-y-8">
            {/* Venue Info Card */}
            <section className="bg-darkCardV1 border border-darkBorderV1 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
              <div className="p-8 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <Icon path={mdiMapMarker} size={1.5} className="text-accent" />
                    </div>
                    <div>
                      <Badge variant="neutral" className="mb-2 bg-accent/20 text-accent border-accent/30 lowercase font-bold">
                        Đang xử lý đặt sân
                      </Badge>
                      <h2 className="text-2xl font-bold text-white mb-1">{venueName}</h2>
                      <p className="text-neutral-400 flex items-center gap-2">
                        <Icon path={mdiMapMarker} size={0.6} />
                        Thông tin sân cầu lông chi tiết
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-darkBackgroundV1/50 rounded-2xl border border-darkBorderV1/50">
                  <div className="space-y-1">
                    <span className="text-neutral-500 text-xs font-bold uppercase ">Sân số</span>
                    <p className="text-white font-semibold flex items-center gap-2">
                      <Icon path={mdiCheckCircle} size={0.6} className="text-accent" />
                      {courtName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-neutral-500 text-xs font-bold uppercase ">Thời gian</span>
                    <p className="text-white font-semibold flex items-center gap-2">
                      <Icon path={mdiClockOutline} size={0.6} className="text-accent" />
                      {startTime} - {endTime}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-neutral-500 text-xs font-bold uppercase ">Ngày thuê</span>
                    <p className="text-white font-semibold flex items-center gap-2">
                      <Icon path={mdiCalendar} size={0.6} className="text-accent" />
                      {new Date(dateStr).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Methods Section */}
            <section className="space-y-4">
              <SectionTitle title="Phương thức thanh toán" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "VNPAY" as const, name: "VNPay Online", desc: "QR Code / Thẻ ATM", icon: mdiCreditCardOutline, color: "text-blue-400" },
                  { id: "MOMO" as const, name: "Ví Momo", desc: "Thanh toán qua ví điện tử", icon: mdiWalletOutline, color: "text-pink-400" },
                  { id: "CASH" as const, name: "Tại quầy", desc: "Thanh toán trực tiếp", icon: mdiCash, color: "text-emerald-400" },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "group relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300",
                      paymentMethod === method.id
                        ? "bg-accent/5 border-accent shadow-lg shadow-accent/10"
                        : "bg-darkCardV1 border-darkBorderV1 hover:border-neutral-700"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                      paymentMethod === method.id ? "bg-accent text-white" : "bg-darkBackgroundV2 text-neutral-400"
                    )}>
                      <Icon path={method.icon} size={1} />
                    </div>
                    <span className="text-white font-bold block mb-1">{method.name}</span>
                    <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-tighter">{method.desc}</p>

                    {paymentMethod === method.id && (
                      <div className="absolute top-3 right-3 text-accent">
                        <Icon path={mdiCheckCircle} size={0.8} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Payment Summary */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            <section className="bg-darkCardV1 border border-darkBorderV1 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-accent rounded-full" />
                Chi tiết hóa đơn
              </h3>

              {/* Promotion Box */}
              <div className="space-y-4 mb-8">
                <span className="text-neutral-500 text-xs font-bold uppercase  px-1">Mã giảm ưu đãi</span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Nhập mã giảm giá..."
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="pl-10 h-12 bg-darkBackgroundV1 border-darkBorderV1 rounded-xl"
                    />
                    <Icon
                      path={mdiTicketPercentOutline}
                      size={0.8}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    className="h-12 px-6 rounded-xl hover:bg-neutral-800 transition-colors"
                    onClick={handleApplyVoucher}
                    disabled={checkVoucherMutation.isPending || !voucherCode}
                  >
                    Áp dụng
                  </Button>
                </div>
                {discount > 0 && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold animate-in fade-in slide-in-from-right-2">
                    <Icon path={mdiCheckCircle} size={0.6} />
                    Đã áp dụng giảm -{discount.toLocaleString()}đ
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="space-y-4 pt-6 border-t border-darkBorderV1/50">
                <div className="flex justify-between items-center text-neutral-400">
                  <span className="text-sm font-medium">Tạm tính tiền thuê</span>
                  <span className="font-bold text-white">{basePrice.toLocaleString()}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="text-sm font-medium">Khuyến mãi áp dụng</span>
                    <span className="font-bold">-{discount.toLocaleString()}đ</span>
                  </div>
                )}

                <div className="flex justify-between items-end pt-4 pb-2">
                  <div className="flex flex-col">
                    <span className="text-neutral-500 text-xs font-black uppercase ">Thành tiền</span>
                    <span className="text-neutral-400 text-[10px] italic">Đã bao gồm phí dịch vụ</span>
                  </div>
                  <div className="text-right text-accent">
                    <div className="text-3xl font-black tracking-tighter">
                      {finalPrice.toLocaleString()}
                      <span className="text-sm ml-1">VNĐ</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-16 rounded-2xl text-lg font-black  bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20 transition-all active:scale-[0.98] mt-4"
                  onClick={handlePayment}
                  disabled={createBookingMutation.isPending || createPaymentUrlMutation.isPending}
                >
                  {createBookingMutation.isPending || createPaymentUrlMutation.isPending ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ĐANG XỬ LÝ...
                    </div>
                  ) : "XÁC NHẬN THANH TOÁN"}
                </Button>
                <p className="text-center text-neutral-500 text-[10px] leading-relaxed pt-2">
                  Nhấn xác nhận đặt sân đồng nghĩa với việc bạn đồng ý với các Chính sách thuê sân & Quy định bảo mật.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
