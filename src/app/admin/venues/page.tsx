import VenuePage from "@/components/VenuePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý cơ sở sân | BadmintonHub",
    description: "Trang dành cho quản trị viên phê duyệt các cơ sở sân mới đăng ký",
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    await searchParams;
    return <VenuePage />;
}
