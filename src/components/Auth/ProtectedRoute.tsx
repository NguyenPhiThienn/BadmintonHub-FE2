"use client"

import { useUser } from "@/context/useUserContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoadingProfile, profile } = useUser();
  const router = useRouter();
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
  }, [isClient, isLoadingProfile, profile]);

  useEffect(() => {
    if (!isClient) return;

    const checkAuth = () => {
      const hasToken =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const hasProfile = localStorage.getItem("userProfile");

      if (!hasToken && !hasProfile && !isLoadingProfile) {
        router.push("/admin/login");
      }
    };

    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, [isClient, isLoadingProfile, router]);

  useEffect(() => {
    if (isClient && isAuthenticated && profile && !isLoadingProfile) {
      checkUserRole();
    }
  }, [isClient, isAuthenticated, profile, isLoadingProfile]);

  const checkUserRole = () => {
    if (!allowedRoles || allowedRoles.length === 0) {
      return;
    }

    setIsCheckingRole(true);

    const userRole = profile?.data?.role || "admin";
    if (!allowedRoles.includes(userRole)) {
      router.push("/admin");
    }

    setIsCheckingRole(false);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen h-screen bg-darkBackgroundV1 flex flex-col items-center justify-center gap-3 md:gap-4">
        <Image
          src="/images/loading.gif"
          alt="Loading..."
          width={280}
          height={280}
          unoptimized
          draggable={false}
        />
      </div>
    );
  }

  if (isLoadingProfile || isCheckingRole) {
    return (
      <div className="min-h-screen h-screen bg-darkBackgroundV1 flex flex-col items-center justify-center gap-3 md:gap-4">
        <Image
          src="/images/loading.gif"
          alt="Loading..."
          width={280}
          height={280}
          unoptimized
          draggable={false}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen h-screen bg-darkBackgroundV1 flex flex-col items-center justify-center gap-3 md:gap-4">
        <Image
          src="/images/loading.gif"
          alt="Loading..."
          width={280}
          height={280}
          unoptimized
          draggable={false}
        />
      </div>
    );
  }

  return <>{children}</>;
}
