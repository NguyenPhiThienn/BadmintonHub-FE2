import VenueApprovalPage from "@/components/VenueApprovalPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Phê duyệt cơ sở sân | BadmintonHub",
    description: "Trang dành cho quản trị viên phê duyệt các cơ sở sân mới đăng ký",
};

export default function Page({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    return <VenueApprovalPage />;
}
