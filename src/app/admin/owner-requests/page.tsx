import AdminOwnerRequestsPage from "@/components/AdminOwnerRequestsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Duyệt đăng ký chủ sân | BadmintonHub",
    description: "Xem xét hồ sơ, thông tin kinh doanh và duyệt/từ chối đăng ký quyền chủ sân cầu lông",
};

export default function Page() {
    return <AdminOwnerRequestsPage />;
}
