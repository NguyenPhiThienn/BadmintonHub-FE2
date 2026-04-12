"use client"

import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usePathname } from "next/navigation";

export default function AdminLayout({
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
