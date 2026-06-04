"use client";

import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { useUser } from "@/context/useUserContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export const SocketEventListener = () => {
  const { on, isConnected } = useSocket();
  const { fetchUserProfile } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) return;

    console.log("SocketEventListener: Active and listening for events");

    const unsubscribeRole = on("user:role_changed", async (data: { role: string }) => {
      console.log("Received user:role_changed event with data:", data);
      
      // 1. Đồng bộ hóa profile mới từ Backend
      await fetchUserProfile();
      
      const roleNames: Record<string, string> = {
        ADMIN: "QUẢN TRỊ VIÊN",
        COURT_OWNER: "CHỦ SÂN",
        PLAYER: "NGƯỜI CHƠI",
      };

      const newRoleName = roleNames[data.role] || data.role;
      
      // 2. Hiển thị thông báo Toast Premium
      toast.info(
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-white">Thay đổi vai trò!</span>
          <span className="text-sm text-neutral-200">
            Vai trò của bạn đã được cập nhật thành <strong className="text-accent">{newRoleName}</strong>.
          </span>
          <span className="text-xs text-neutral-400">Hệ thống đang tự động chuyển hướng giao diện...</span>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        }
      );

      // 3. Tự động điều hướng giao diện theo vai trò mới
      setTimeout(() => {
        if (data.role === "ADMIN") {
          router.push("/admin");
        } else if (data.role === "COURT_OWNER") {
          router.push("/owner");
        } else {
          router.push("/");
        }
      }, 1500); // Trì hoãn nhẹ để người dùng đọc thông tin thông báo
    });

    return () => {
      unsubscribeRole();
    };
  }, [on, isConnected, fetchUserProfile, router]);

  return null;
};
