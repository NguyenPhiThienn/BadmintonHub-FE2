"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usePathname } from "next/navigation";

export default function PartnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname?.includes("/login");

    return (
        <div suppressHydrationWarning>
            {isLoginPage ? (
                children
            ) : (
                <ProtectedRoute>
                    <DashboardLayout>{children}</DashboardLayout>
                </ProtectedRoute>
            )}
        </div>
    );
}
