import WorkExchangePage from "@/components/WorkExchangePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Trao đổi phương án công việc | Công ty TNHH Giải Pháp Tự Động Điện",
    description: "Trang quản lý các phương án công việc và nội dung trao đổi kỹ thuật",
};

export default function Page() {
    return <WorkExchangePage />;
}
