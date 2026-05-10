import ProfilePage from "@/components/ProfilePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Trang cá nhân | BadmintonHub",
    description: "Quản lý thông tin cá nhân và tài khoản của bạn trên BadmintonHub",
};

export default function Page() {
    return <ProfilePage />;
}
