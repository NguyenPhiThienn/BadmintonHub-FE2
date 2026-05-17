import OwnerProfilePage from "@/components/OwnerProfilePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý trang cá nhân | BadmintonHub",
    description: "Cập nhật thông tin cá nhân và tài khoản chủ sân của bạn trên BadmintonHub",
};

export default function Page() {
    return <OwnerProfilePage />;
}
