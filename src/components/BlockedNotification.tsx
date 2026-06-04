"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useUser } from "@/context/useUserContext";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiShieldLockOutline, mdiLogout } from "@mdi/js";

export const BlockedNotification = () => {
  const { on } = useSocket();
  const { logoutUser } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [blockedInfo, setBlockedInfo] = useState<{
    blockType: string;
    reason: string;
    blockedUntil?: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = on("user:blocked", (data) => {
      setBlockedInfo({
        blockType: data.blockType || "PERMANENT",
        reason: data.reason || "Không có lý do được cung cấp",
        blockedUntil: data.blockedUntil,
      });
      setShowModal(true);
    });

    return () => {
      unsubscribe();
    };
  }, [on]);

  const handleLogout = () => {
    setShowModal(false);
    logoutUser();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!showModal || !blockedInfo) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      <div
        className="max-w-md w-full mx-4 bg-darkCardV1 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl"
        style={{ animation: "scaleIn 0.3s ease-out" }}
      >
        {/* Lock Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <Icon path={mdiShieldLockOutline} size={3} className="text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Tài khoản bị khóa
        </h1>

        {/* Description */}
        <div className="space-y-4 text-neutral-300 mb-8">
          <p className="text-lg">
            Rất tiếc, tài khoản của bạn đã bị khóa khỏi hệ thống.
          </p>

          {/* Block Type */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-left">
            <p className="text-sm text-red-400 font-semibold mb-1">Loại khóa:</p>
            <p className="text-white">
              {blockedInfo.blockType === "TEMPORARY" ? "Khóa tạm thời" : "Khóa vĩnh viễn"}
            </p>
          </div>

          {/* Reason */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-left">
            <p className="text-sm text-red-400 font-semibold mb-1">Lý do:</p>
            <p className="text-white">{blockedInfo.reason}</p>
          </div>

          {/* Block Until */}
          {blockedInfo.blockedUntil && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-left">
              <p className="text-sm text-yellow-400 font-semibold mb-1">Thời hạn khóa:</p>
              <p className="text-white">
                Đến {formatDate(blockedInfo.blockedUntil)}
              </p>
            </div>
          )}

          {/* Support */}
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
            <p className="text-sm text-neutral-400 mb-2">Liên hệ hỗ trợ:</p>
            <p className="text-accent font-semibold text-lg">0963785612</p>
            <p className="text-xs text-neutral-500 mt-1">
              (Thứ 2 - Thứ 6, 8:00 - 17:00)
            </p>
          </div>
        </div>

        {/* Actions */}
        <Button
          variant="accent"
          className="w-full"
          size="lg"
          onClick={handleLogout}
        >
          <Icon path={mdiLogout} size={0.8} />
          Xác nhận và đăng xuất
        </Button>
      </div>
    </div>
  );
};
