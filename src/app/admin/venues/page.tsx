import VenueApprovalPage from "@/components/VenueApprovalPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Phê duyệt cơ sở sân | BadmintonHub",
    description: "Trang dành cho quản trị viên phê duyệt các cơ sở sân mới đăng ký",
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    await searchParams;
    return <VenueApprovalPage />;
}
