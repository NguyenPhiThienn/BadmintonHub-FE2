import OwnerCustomersPage from "@/components/OwnerCustomersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý khách hàng | BadmintonHub Owner",
    description: "Quản lý dữ liệu, xem lịch sử đặt sân và thống kê hành vi của khách chơi tại cơ sở của bạn.",
};

export default function Page() {
    return <OwnerCustomersPage />;
}
