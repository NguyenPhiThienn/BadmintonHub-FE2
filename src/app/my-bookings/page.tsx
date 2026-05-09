import MyBookingsPage from "@/components/MyBookingsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch của tôi | BadmintonHub",
  description: "Trang xem lịch sử đặt sân của người chơi",
};

export default function Page() {
  return <MyBookingsPage />;
}
