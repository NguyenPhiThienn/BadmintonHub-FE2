import RegisterOwnerPage from "@/components/RegisterOwnerPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Đăng ký chủ sân | BadmintonHub",
    description: "Đăng ký trở thành chủ sân để bắt đầu kinh doanh trên BadmintonHub",
};

export default function Page() {
    return <RegisterOwnerPage />;
}
