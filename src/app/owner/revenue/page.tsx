import OwnerRevenuePage from "@/components/OwnerRevenuePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý doanh thu | BadmintonHub Owner",
    description: "Xem và theo dõi doanh thu từ các cơ sở sân cầu lông của bạn.",
};

export default function Page() {
    return <OwnerRevenuePage />;
}
