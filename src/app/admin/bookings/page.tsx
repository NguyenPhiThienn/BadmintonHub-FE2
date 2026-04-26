import AdminBookingPage from "@/components/BookingPage/AdminBookingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý đặt sân | BadmintonHub Admin",
    description: "Trang quản lý danh sách đơn đặt sân trong hệ thống BadmintonHub",
};

export default function Page() {
    return <AdminBookingPage />;
}
