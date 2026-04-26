"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBookingDetails } from "@/hooks/useBooking";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/mdi-icon";
import {
  mdiCheckCircle,
  mdiHome,
  mdiTicketOutline,
  mdiInformationOutline,
  mdiMapMarker,
  mdiCurrencyUsd,
  mdiQrcodeScan,
  mdiPlaylistRemove,
  mdiTagOutline,
  mdiCalendarMonth,
  mdiClockOutline,
  mdiAccountSupervisorCircle,
  mdiPhone,
  mdiMap,
  mdiSoccerField
} from "@mdi/js";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const SuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams?.get("bookingId");

  const { data: bookingRes, isLoading, error } = useBookingDetails(bookingId || "");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner />
        <p className="text-neutral-400 font-medium text-sm">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error || !bookingRes?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-center text-neutral-400 text-sm py-2 italic flex flex-col items-center justify-center gap-4">
          <Icon path={mdiPlaylistRemove} size={0.8} className="flex-shrink-0" />
          <span>Không tìm thấy thông tin đơn hàng.</span>
          <Button onClick={() => router.push("/")} variant="outline">
            <Icon path={mdiHome} size={0.8} />
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const booking = bookingRes.data;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      {/* 1. Success Animation & Title */}
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative w-24 h-24">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.1, 1] }}
            transition={{
              duration: 2,
              times: [0, 0.2, 0.5],
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="w-full h-full bg-accent/20 rounded-full flex items-center justify-center relative z-10"
          >
            <Icon path={mdiCheckCircle} size={0.8} className="text-accent scale-[2.5]" />
          </motion.div>

          {/* Celebration Dots */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const targetX = Math.cos(angle) * 80;
            const targetY = Math.sin(angle) * 80;

            return (
              <div key={i} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{
                    scale: [0, 1, 0],
                    x: [0, targetX],
                    y: [0, targetY],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatDelay: 2.2,
                    ease: "easeOut",
                    delay: 0.4 + (i * 0.05), // Starts exactly when the checkmark reaches its peak
                  }}
                  className="w-2 h-2 rounded-full bg-accent"
                />
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-semibold text-accent uppercase"
          >
            Đặt sân thành công!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-neutral-400 text-sm md:text-base mx-auto flex items-center justify-center gap-1"
          >
            Cảm ơn bạn đã lựa chọn
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/images/primary-logo.svg"
                alt="BadmintonHub Logo"
                width={500}
                height={500}
                className="h-5 w-auto object-contain"
              />
            </Link>
            cho buổi tập luyện của mình.
          </motion.p>
        </div>
      </div>

      {/* 2. Booking Main Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="bg-accent/5 border border-dashed border-accent/40 rounded-2xl flex items-start overflow-hidden">
          <div className="w-full">
            <div className="p-4 border-b border-darkBorderV1/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon path={mdiMap} size={0.8} className="text-accent" />
                <p className="text-accent text-lg font-semibold">Mã đơn hàng: #BH{booking._id?.slice(-6).toUpperCase()}</p>
              </div>
              <Badge variant="green">
                <Icon path={mdiCheckCircle} size={0.6} />
                Đã xác nhận
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-darkBackgroundV1">
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-neutral-400 text-sm font-medium">
                  <Icon path={mdiMapMarker} size={0.8} />
                  <Label>Cơ sở sân</Label>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="green">
                    <Icon path={mdiSoccerField} size={0.6} />
                    {booking.venueId?.name || "Sân cầu lông"}
                  </Badge>
                  <Badge variant="neutral">
                    <Icon path={mdiMap} size={0.6} />
                    {booking.venueId?.address}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-neutral-400 text-sm font-medium">
                  <Icon path={mdiAccountSupervisorCircle} size={0.8} />
                  <Label>Người đặt</Label>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="green">
                    <Icon path={mdiAccountSupervisorCircle} size={0.6} />
                    {booking.playerId?.fullName}
                  </Badge>
                  <Badge variant="neutral">
                    <Icon path={mdiPhone} size={0.6} />
                    {booking.playerId?.phone}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-darkBorderV1/50 p-4">
              <div className="flex items-center gap-1 text-neutral-400 text-sm font-medium mb-4">
                <Icon path={mdiCalendarMonth} size={0.8} />
                <Label>Chi tiết lịch đặt</Label>
              </div>
              <div className="space-y-4">
                {booking.details?.map((detail: any, index: number) => (
                  <div key={index} className="flex justify-between items-center bg-darkBackgroundV1 p-4 rounded-xl border border-darkBorderV1">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-accent/5 flex items-center justify-center border border-accent/10">
                        <Icon path={mdiClockOutline} size={0.8} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-neutral-300 font-semibold">{detail.courtId?.name}</p>
                        <Badge variant="neutral">
                          {new Date(detail.bookingDate).toLocaleDateString('vi-VN')} | {detail.startTime} - {detail.endTime}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-accent font-semibold">{detail.price?.toLocaleString()}đ</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-darkBackgroundV1 border-t border-darkBorderV1/50 flex items-center justify-between">
              <div className="flex items-center gap-1 text-neutral-400 text-sm font-medium">
                <Icon path={mdiCurrencyUsd} size={0.8} />
                <Label>Tổng thanh toán</Label>
              </div>
              <div className="flex items-center gap-1">
                <Icon path={mdiTagOutline} size={0.8} className="text-accent" />
                <div className="text-accent font-semibold text-2xl leading-tight">
                  {(booking.finalPrice || 0).toLocaleString()}đ
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="bg-accent/5 border border-dashed border-accent/40 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-darkBorderV1/50 flex items-center gap-2">
            <Icon path={mdiMap} size={0.8} className="text-accent" />
            <p className="text-accent text-lg font-semibold">Vị trí sân trên bản đồ</p>
          </div>
          <div className="h-64 w-full bg-darkBackgroundV1">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${booking.venueId?.coordinates?.coordinates[1]},${booking.venueId?.coordinates?.coordinates[0]}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </motion.div>

      {/* 3. Instruction Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="bg-accent/5 border border-dashed border-accent/40 rounded-2xl p-4 flex gap-4 items-start"
      >
        <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/10">
          <Icon path={mdiQrcodeScan} size={0.8} className="text-accent" />
        </div>
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">Hướng dẫn nhận sân</h3>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            Vui lòng đến sân đúng giờ. Bạn có thể xuất trình **mã đơn hàng** hoặc **mã QR** trong mục chi tiết vé cho nhân viên trực sân để được hỗ trợ check-in và nhận sân nhanh nhất.
          </p>
        </div>
      </motion.div>

      {/* 4. Secondary Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/")}
        >
          <Icon path={mdiHome} size={0.8} />
          Về trang chủ
        </Button>
      </motion.div>

      {/* Footer Branding */}
      <div className="text-center flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 py-4">
          <Image
            src="/images/primary-logo.svg"
            alt="BadmintonHub Logo"
            width={500}
            height={500}
            className="h-8 w-auto object-contain"
          />
        </Link>
        <p className="text-sm text-neutral-500 font-medium uppercase">@BadmintonHub Smart Booking System</p>
      </div>
    </div>
  );
};

const BookingSuccessPage = () => {
  return (
    <div className="min-h-screen bg-darkBackgroundV1 overflow-x-hidden">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <LoadingSpinner />
          <p className="text-neutral-400 animate-pulse text-sm">Đang chuẩn bị giao diện...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
};

export default BookingSuccessPage;
