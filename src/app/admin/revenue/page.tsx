import AdminRevenuePage from "@/components/AdminRevenuePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý doanh thu | BadmintonHub Admin",
    description: "Báo cáo, thống kê và quản lý doanh thu chi tiết cho BadmintonHub",
};

export default function Page() {
    return <AdminRevenuePage />;
}
