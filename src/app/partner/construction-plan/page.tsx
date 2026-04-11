import ConstructionPlansPage from "@/components/ConstructionPlansPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Phương án thi công | Công ty TNHH Giải Pháp Tự Động Điện",
    description: "Quản lý phương án thi công theo công ty",
};

export default function Page() {
    return <ConstructionPlansPage />;
}
