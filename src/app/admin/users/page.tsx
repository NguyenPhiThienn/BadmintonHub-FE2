import UserPage from "@/components/UserPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý người dùng | BadmintonHub",
    description: "Trang quản lý danh sách người dùng trong hệ thống",
};

export default function Page() {
    return <UserPage />;
}
