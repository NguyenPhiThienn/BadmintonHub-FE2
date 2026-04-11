import LaboratoryWorkPage from "@/components/LaboratoryWorkPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Công việc thí nghiệm | Công ty TNHH Giải Pháp Tự Động Điện",
    description: "Trang quản lý danh sách các công việc thí nghiệm và kết quả đo đạc.",
};

export default function Page() {
    return <LaboratoryWorkPage />;
}
