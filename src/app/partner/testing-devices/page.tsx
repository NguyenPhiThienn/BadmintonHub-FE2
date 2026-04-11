import TestingDevicePage from "@/components/TestingDevicePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý thiết bị thí nghiệm | Công ty TNHH Giải Pháp Tự Động Điện",
    description: "Trang quản lý danh sách thiết bị thí nghiệm",
};

export default function Page() {
    return <TestingDevicePage />;
}
