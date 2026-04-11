import EmployeePage from "@/components/EmployeePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý nhân sự | Công ty TNHH Giải Pháp Tự Động Điện",
    description: "Trang quản lý thông tin nhân viên trong hệ thống",
};

export default function Page() {
    return <EmployeePage />;
}
