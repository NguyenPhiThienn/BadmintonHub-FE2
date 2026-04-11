import ConstructionLogsPage from "@/components/ConstructionLogsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nhật ký thi công | Công ty TNHH Giải Pháp Tự Động Điện",
    description: "Quản lý nhật ký thi công",
};

export default function Page() {
    return <ConstructionLogsPage />;
}
