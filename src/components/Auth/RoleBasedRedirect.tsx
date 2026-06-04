"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/useUserContext";
import Image from "next/image";

export default function RoleBasedRedirect() {
  const router = useRouter();
  const { profile, isLoadingProfile } = useUser();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          const userRole = parsedProfile?.data?.role;
          router.push("/admin");
          return;
        } catch (error) {
          console.error(error);
        }
      }
    }

    if (!isLoadingProfile && profile?.data) {
      router.push("/admin");
    }
  }, [profile, isLoadingProfile, router]);

  if (isLoadingProfile || !profile) {
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

  return null;
}
