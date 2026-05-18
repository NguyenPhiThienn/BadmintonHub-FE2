"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/mdi-icon";
import { useBookingDetails } from "@/hooks/useBooking";
import {
  mdiAccountSupervisorCircle,
  mdiCalendarMonth,
  mdiCash,
  mdiCheckCircle,
  mdiClock,
  mdiCreditCardOutline,
  mdiCurrencyUsd,
  mdiDownload,
  mdiHome,
  mdiLoading,
  mdiMap,
  mdiMapMarker,
  mdiPhone,
  mdiPlaylistRemove,
  mdiQrcodeScan,
  mdiSoccerField,
  mdiTagOutline
} from "@mdi/js";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useUser } from "@/context/useUserContext";

const SuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams?.get("bookingId");
  const { user } = useUser();
  const isOwner = user?.role === "OWNER" || user?.role === "COURT_OWNER";

  const { data: bookingRes, isLoading, error } = useBookingDetails(bookingId || "");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const booking = bookingRes?.data;

  const handleDownloadPDF = async () => {
    if (!booking) return;
    setIsDownloading(true);

    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      // Create a temporary container for the invoice
      const invoiceContainer = document.createElement("div");
      invoiceContainer.style.position = "absolute";
      invoiceContainer.style.left = "-9999px";
      invoiceContainer.style.top = "0";
      invoiceContainer.style.width = "800px";
      invoiceContainer.style.backgroundColor = "white";
      invoiceContainer.style.color = "#333";
      // Premium Invoice HTML Template
      invoiceContainer.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap');
          * { font-family: 'Tinos', 'Times New Roman', serif; }
        </style>
        <div style="padding: 40px; background-color: white;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #41C651; padding-bottom: 30px; margin-bottom: 30px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <img src="${window.location.origin}/images/primary-logo.svg" style="height: 45px; width: auto;" />
                <div style="height: 30px; width: 2px; background-color: #eee; margin: 0 10px;"></div>
                <div style="color: #0A1F22; font-weight: bold; font-size: 20px;">BadmintonHub</div>
              </div>
              <h1 style="color: #41C651; margin: 0; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">HÓA ĐƠN ĐẶT SÂN</h1>
              <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">Mã đơn hàng: <span style="color: #0A1F22; font-weight: bold;">#BH${booking._id?.slice(-6).toUpperCase()}</span></p>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">Ngày lập: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}</p>
            </div>
            <div style="text-align: right; color: #666; font-size: 13px; line-height: 1.6;">
               <p style="margin: 0; font-weight: bold; color: #0A1F22; font-size: 16px; margin-bottom: 5px;">THÔNG TIN ĐƠN VỊ</p>
               <p style="margin: 0;">CÔNG TY CP ĐẦU TƯ & DỊCH VỤ BADMINTONHUB</p>
               <p style="margin: 0;">Hotline: 1900 633 633</p>
               <p style="margin: 0;">Email: support@badmintonhub.vn</p>
               <p style="margin: 0;">Website: www.badmintonhub.vn</p>
            </div>
          </div>

          <!-- Customer & Venue Info -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
            <div style="background-color: #fcfcfc; padding: 25px; border-radius: 12px; border: 1px solid #f0f0f0;">
              <h3 style="border-bottom: 2px solid #eee; padding-bottom: 12px; margin-top: 0; color: #0A1F22; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Thông tin khách hàng</h3>
              <div style="margin-top: 15px; font-size: 14px; line-height: 1.8;">
                <p style="margin: 0;"><strong>Họ tên:</strong> ${booking.customerName || booking.playerId?.fullName || 'Khách ẩn danh'}</p>
                <p style="margin: 0;"><strong>Số điện thoại:</strong> ${booking.customerPhone || booking.playerId?.phone || 'N/A'}</p>
                <p style="margin: 0;"><strong>Email:</strong> ${booking.customerEmail || booking.playerId?.email || 'N/A'}</p>
                ${booking.isWeekly ? '<p style="margin: 4px 0 0 0; color: #41C651; font-weight: bold;">(Đặt sân cố định hàng tuần)</p>' : ''}
              </div>
            </div>
            <div style="background-color: #fcfcfc; padding: 25px; border-radius: 12px; border: 1px solid #f0f0f0;">
              <h3 style="border-bottom: 2px solid #eee; padding-bottom: 12px; margin-top: 0; color: #0A1F22; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Thông tin cơ sở</h3>
              <div style="margin-top: 15px; font-size: 14px; line-height: 1.8;">
                <p style="margin: 0;"><strong>Tên sân:</strong> ${booking.venueId?.name}</p>
                <p style="margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><strong>Địa chỉ:</strong> ${booking.venueId?.address}</p>
                <p style="margin: 0;"><strong>Trạng thái:</strong> <span style="color: #41C651; font-weight: bold;">ĐÃ XÁC NHẬN</span></p>
              </div>
            </div>
          </div>

          <!-- Services Table -->
          <h3 style="margin: 0 0 15px 0; color: #0A1F22; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Chi tiết lịch đặt</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #41C651; color: white;">
                <th style="padding: 15px; text-align: left; border: 1px solid #41C651; font-size: 14px;">Ngày đặt</th>
                <th style="padding: 15px; text-align: left; border: 1px solid #41C651; font-size: 14px;">Tên sân</th>
                <th style="padding: 15px; text-align: center; border: 1px solid #41C651; font-size: 14px;">Khung giờ</th>
                <th style="padding: 15px; text-align: right; border: 1px solid #41C651; font-size: 14px;">Đơn giá</th>
              </tr>
            </thead>
            <tbody>
              ${booking.details?.map((detail: any) => `
                <tr>
                  <td style="padding: 14px; border: 1px solid #eee; font-size: 14px;">${new Date(detail.bookingDate).toLocaleDateString('vi-VN')}</td>
                  <td style="padding: 14px; border: 1px solid #eee; font-size: 14px; font-weight: 500;">${detail.courtId?.name}</td>
                  <td style="padding: 14px; border: 1px solid #eee; text-align: center; color: #41C651; font-weight: bold; font-size: 14px;">${detail.startTime} - ${detail.endTime}</td>
                  <td style="padding: 14px; border: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 500;">${detail.price?.toLocaleString()}đ</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Summary -->
          <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <div style="width: 320px; background-color: #f9f9f9; padding: 25px; border-radius: 12px; border: 1px solid #eee;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #666;">
                <span>Tạm tính:</span>
                <span>${(booking.totalPrice || 0).toLocaleString()}đ</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #666;">
                <span>Giảm giá:</span>
                <span>-0đ</span>
              </div>
              <div style="height: 1px; background-color: #ddd; margin: 15px 0; border-top: 1px dashed #bbb;"></div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; font-size: 16px; color: #0A1F22;">TỔNG CỘNG:</span>
                <span style="font-weight: bold; font-size: 24px; color: #41C651;">${(booking.finalPrice || 0).toLocaleString()}đ</span>
              </div>
              <div style="margin-top: 20px; text-align: right; font-size: 12px; font-style: italic; color: #888;">
                <p style="margin: 0;">Trạng thái: <span style="color: #41C651; font-weight: bold;">ĐÃ THANH TOÁN</span></p>
                <p style="margin: 4px 0 0 0;">Phương thức: ${booking.payment?.method === 'VNPAY' ? 'Thẻ ngân hàng (VNPay)' : 'Tiền mặt'}</p>
              </div>
            </div>
          </div>

          <!-- Footer Info -->
          <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="text-align: center; width: 200px;">
              <p style="margin-bottom: 60px; font-weight: bold; font-size: 14px;">Khách hàng</p>
              <p style="color: #999; font-size: 12px;">(Ký và ghi rõ họ tên)</p>
            </div>
            <div style="text-align: center; width: 200px;">
              <p style="margin-bottom: 10px; font-size: 13px; color: #666;">Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</p>
              <p style="margin-bottom: 60px; font-weight: bold; font-size: 14px;">Đại diện BadmintonHub</p>
              <div style="color: #41C651; font-weight: bold; font-size: 16px; transform: rotate(-5deg); border: 2px solid #41C651; padding: 5px 15px; display: inline-block; border-radius: 4px;">
                ĐÃ THU TIỀN
              </div>
            </div>
          </div>

          <div style="margin-top: 80px; text-align: center; color: #bbb; font-size: 11px; border-top: 1px solid #f0f0f0; padding-top: 20px;">
            <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của BadmintonHub.</p>
            <p>Hệ thống đặt sân cầu lông thông minh - Kết nối đam mê, nâng tầm sức khỏe.</p>
          </div>
        </div>
      `;

      document.body.appendChild(invoiceContainer);

      // Wait for images to load
      const images = invoiceContainer.getElementsByTagName("img");
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // Add a small delay for font rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(invoiceContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "white",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`HoaDon_BH${booking._id?.slice(-6).toUpperCase()}.pdf`);

      document.body.removeChild(invoiceContainer);
      toast.success('Tải hóa đơn thành công!');
    } catch (err) {
      console.error('Download PDF error:', err);
      toast.error('Không thể tải hóa đơn. Vui lòng thử lại sau.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;
    setIsDownloadingQR(true);
    try {
      const svg = qrRef.current.querySelector("svg");
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new (window as any).Image();
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 20, 20);
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `QR_BH${booking._id?.slice(-6).toUpperCase()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
      toast.success("Tải ảnh QR thành công!");
    } catch (err) {
      console.error("QR Download error:", err);
      toast.error("Không thể tải ảnh QR");
    } finally {
      setIsDownloadingQR(false);
    }
  };

  useEffect(() => {
    const sendEmail = async () => {
      if (booking && !emailSent) {
        const email = booking.customerEmail || booking.playerId?.email;
        if (email) {
          try {
            await fetch('/api/booking/send-confirmation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                booking,
                venue: booking.venueId,
                details: booking.details
              }),
            });
            setEmailSent(true);
            console.log('Confirmation email sent');
          } catch (err) {
            console.error('Failed to send confirmation email:', err);
          }
        }
      }
    };

    if (booking) {
      sendEmail();
    }
  }, [booking, emailSent]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner />
        <p className="text-neutral-400 font-medium text-base">Đang tải thông tin đơn hàng...</p>
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
            className="text-3xl font-semibold text-accent"
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
              <div className="flex items-end gap-2">
                {booking.status === 'CONFIRMED' ? (
                  <Badge variant="green">
                    <Icon path={mdiCheckCircle} size={0.6} />
                    Đặt sân thành công
                  </Badge>
                ) : booking.status === 'PENDING' ? (
                  <Badge variant="amber">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Đơn đặt sân đang được giữ chỗ
                  </Badge>
                ) : booking.status === 'COMPLETED' ? (
                  <Badge variant="neutral" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    <Icon path={mdiCheckCircle} size={0.6} />
                    Đơn đặt sân đã hoàn tất
                  </Badge>
                ) : booking.status === 'CANCELLED' ? (
                  <Badge variant="destructive">
                    <Icon path={mdiPlaylistRemove} size={0.6} />
                    Đơn đặt sân bị hủy
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <Icon path={mdiPlaylistRemove} size={0.6} />
                    {booking.status}
                  </Badge>
                )}

                {booking.payment?.method === 'VNPAY' ? (
                  <Badge variant="neutral" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    <Icon path={mdiCreditCardOutline} size={0.6} />
                    Thanh toán bằng VNPay
                  </Badge>
                ) : (
                  <Badge variant="neutral" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                    <Icon path={mdiCash} size={0.6} />
                    Thanh toán bằng tiền mặt
                  </Badge>
                )}
              </div>
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
                    {booking.customerName || booking.playerId?.fullName || "Khách ẩn danh"}
                  </Badge>
                  <Badge variant="neutral">
                    <Icon path={mdiPhone} size={0.6} />
                    {booking.customerPhone || booking.playerId?.phone || "Chưa thiết lập số điện thoại"}
                  </Badge>
                  {booking.isWeekly && (
                    <Badge variant="neutral" className="bg-accent/10 text-accent border-accent/20">
                      <Icon path={mdiCheckCircle} size={0.6} />
                      Đặt sân cố định hàng tuần
                    </Badge>
                  )}
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
                      <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/10">
                        <Icon path={mdiSoccerField} size={1} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-neutral-300 font-semibold">{detail.courtId?.name}</p>
                        <div className="flex gap-1">
                          <Badge variant="neutral">
                            {new Date(detail.bookingDate).toLocaleDateString('vi-VN')}
                          </Badge>
                          <Badge variant="neutral">
                            {detail.startTime} - {detail.endTime}
                          </Badge>
                        </div>

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
        <div className="bg-accent/5 border border-dashed border-accent/40 rounded-xl overflow-hidden">
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
      {booking.status !== "CANCELLED" && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="bg-accent/5 border border-dashed border-accent/40 rounded-2xl p-4 flex gap-4 items-start"
        >
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/10">
            <Icon path={mdiQrcodeScan} size={1} className="text-accent" />
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center w-full">
            <div className="space-y-4 flex-1">
              <h3 className="text-white text-lg font-semibold">Hướng dẫn nhận sân</h3>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                Vui lòng đến sân đúng giờ. Bạn có thể xuất trình **mã đơn hàng** hoặc **mã QR** trong mục chi tiết vé cho nhân viên trực sân để được hỗ trợ check-in và nhận sân nhanh nhất.
              </p>
            </div>
            <div ref={qrRef} className="bg-white p-2 rounded-xl border-4 border-accent/20">
              <QRCodeSVG
                value={`${window.location.origin}/booking/success?bookingId=${booking._id}`}
                size={120}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
        </motion.div>
      )}

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
        <Button
          className="flex-1"
          onClick={() => router.push(isOwner ? "/owner/bookings" : "/my-bookings")}
        >
          <Icon path={mdiClock} size={0.8} />
          {isOwner ? "Quản lý đơn đặt (Chủ sân)" : "Đến trang quản lý đơn đặt sân"}
        </Button>
        {booking.status !== "CANCELLED" && (
          <>
            <Button
              className="flex-1"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              {isDownloading ? <Icon path={mdiLoading} size={0.8} className="animate-spin" /> : <Icon path={mdiDownload} size={0.8} />}
              {isDownloading ? "Đang xử lý..." : "Tải hóa đơn PDF"}
            </Button>
            <Button
              className="flex-1 bg-white text-black hover:bg-neutral-200"
              onClick={handleDownloadQR}
              disabled={isDownloadingQR}
            >
              {isDownloadingQR ? <Icon path={mdiLoading} size={0.8} className="animate-spin" /> : <Icon path={mdiQrcodeScan} size={0.8} />}
              {isDownloadingQR ? "Đang xử lý..." : "Tải ảnh QR"}
            </Button>
          </>
        )}
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
        <p className="text-sm text-gray-500 font-medium uppercase">@BadmintonHub Smart Booking System</p>
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
