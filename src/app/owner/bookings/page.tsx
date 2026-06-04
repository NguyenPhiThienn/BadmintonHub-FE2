import BookingPage from "@/components/BookingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý đơn đặt sân | BadmintonHub Owner",
    description: "Quản lý đơn đặt sân và lịch trình cơ sở cầu lông của bạn.",
};

export default function Page() {
    return <BookingPage />;
}
