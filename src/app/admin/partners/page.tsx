import PartnersPage from "@/components/PartnersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Thông tin công ty | Công ty TNHH Giải Pháp Tự Động Điện",
    description: "Quản lý thông tin công ty",
};

export default function Page() {
    return <PartnersPage />;
}
