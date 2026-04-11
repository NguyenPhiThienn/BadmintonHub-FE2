"use client"

import { usePathname } from "next/navigation";
import DashboardLayout from "./DashboardLayout";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage =
    pathname?.includes("/auth/login") ||
    pathname?.includes("/admin/auth/login");

  return isLoginPage ? (
    <CustomScrollArea className="h-full">{children}</CustomScrollArea>
  ) : (
    <ProtectedRoute>
      <DashboardLayout>
        <CustomScrollArea className="h-full">{children}</CustomScrollArea>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
