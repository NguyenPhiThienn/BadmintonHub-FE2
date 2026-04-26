"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiLogin, mdiAccountPlus, mdiLockReset } from "@mdi/js";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import Link from "next/link";
import Image from "next/image";

export type AuthMode = "login" | "register" | "forgot-password" | null;

interface AuthDialogsProps {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
}

const authModeConfigs: Record<Exclude<AuthMode, null>, { title: string; icon: string }> = {
  login: {
    title: "Đăng nhập",
    icon: mdiLogin,
  },
  register: {
    title: "Đăng ký tài khoản",
    icon: mdiAccountPlus,
  },
  "forgot-password": {
    title: "Khôi phục mật khẩu",
    icon: mdiLockReset,
  },
};

export const AuthDialogs = ({ mode, setMode }: AuthDialogsProps) => {
  const isOpen = mode !== null;
  const config = mode ? authModeConfigs[mode] : null;

  const handleClose = () => setMode(null);

  const renderForm = () => {
    switch (mode) {
      case "login":
        return (
          <LoginForm
            onSwitchRegister={() => setMode("register")}
            onSwitchForgot={() => setMode("forgot-password")}
            onSuccess={handleClose}
            isDialog={true}
          />
        );
      case "register":
        return (
          <RegisterForm
            onSwitchLogin={() => setMode("login")}
            isDialog={true}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm
            onSwitchLogin={() => setMode("login")}
            isDialog={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="!max-w-[450px]">
        {config && (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-accent">
              <Icon path={config.icon} size={0.8} />
              <span>{config.title}</span>
            </DialogTitle>
          </DialogHeader>
        )}

        <div className="p-3 md:p-4">
          <div className="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
            <div className="flex justify-center">
              <Link href="/" className="flex items-center gap-2 py-4">
                <Image
                  src="/images/primary-logo.svg"
                  alt="BadmintonHub Logo"
                  width={500}
                  height={500}
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>
            {renderForm()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
