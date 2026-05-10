import VenuePage from "@/components/VenuePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý cơ sở sân | BadmintonHub",
    description: "Trang quản lý các cơ sở sân cầu lông của bạn",
};

export default function Page() {
    return <VenuePage type="owner" />;
}
