"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/mdi-icon";
import {
  mdiHomeOutline,
  mdiMapMarkerOutline,
  mdiCalendarMonthOutline,
  mdiBellOutline,
  mdiAccountOutline,
} from "@mdi/js";
import { cn } from "@/lib/utils";

const items = [
  { label: "Trang chủ", href: "/", icon: mdiHomeOutline },
  { label: "Khám phá", href: "/venues", icon: mdiMapMarkerOutline },
  { label: "Lịch đặt", href: "/my-bookings", icon: mdiCalendarMonthOutline },
  { label: "Thông báo", href: "/notifications", icon: mdiBellOutline },
  { label: "Cá nhân", href: "/profile", icon: mdiAccountOutline },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/40 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-200 w-full h-full relative",
                isActive ? "text-accent" : "text-neutral-400"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-b-full shadow-[0_0_10px_2px_rgba(65,198,81,0.5)]"></div>
              )}
              <Icon 
                path={item.icon} 
                size={0.8} 
                className={cn(
                  "transition-transform",
                  isActive && "scale-110"
                )} 
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
