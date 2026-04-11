import EquipmentPage from "@/components/EquipmentPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý dụng cụ | Công ty TNHH Giải Pháp Tự Động Điện",
    description: "Trang quản lý danh sách trang thiết bị và dụng cụ thi công",
};

export default function Page() {
    return <EquipmentPage />;
}
