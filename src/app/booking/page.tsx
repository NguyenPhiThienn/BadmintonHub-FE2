import BookingPage from "@/components/BookingPage";
import { Suspense } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Xác nhận đặt sân | BadmintonHub",
  description: "Review your badminton court booking and proceed to payment.",
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner />
        <p className="text-neutral-400 animate-pulse text-sm">Đang chuẩn bị...</p>
      </div>
    }>
      <BookingPage />
    </Suspense>
  );
}
