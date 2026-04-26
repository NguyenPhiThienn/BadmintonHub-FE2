"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { RippleEffect } from "@/components/ui/ripple-effect";
import { useUser } from "@/context/useUserContext";
import { useResponsive } from "@/hooks/use-mobile";
import { useMe } from "@/hooks/useAuth";
import { MenuItem } from "@/interface/types";
import { cn } from "@/lib/utils";
import { useMenuSidebar } from "@/stores/useMenuSidebar";
import { mdiFullscreen, mdiFullscreenExit } from "@mdi/js";
import { Icon } from "@mdi/react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, Suspense } from "react";
import { Button } from "../ui/button";
import { getDashboardMenuItems } from "./dashboardMenuItems";
import Image from "next/image";

const CommonHeader = dynamic(() => import("../Common/CommonHeader"), {
  ssr: false,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  if (isTablet) {
    return <TabletLayout>{children}</TabletLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}

function DesktopLayout({ children }: { children: React.ReactNode }) {
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { isOpen, toggle } = useMenuSidebar();
  const { data: profileResponse } = useMe();

  const profile = profileResponse?.data;
  const permissions = (profile as any)?.permissions || [];
  const role = (profile as any)?.role;
  const dashboardMenuItems: MenuItem[] = getDashboardMenuItems(permissions, role);

  const isMenuActive = (menu: MenuItem) => {
    if (menu.path && pathname === menu.path) return true;
    if (menu.subMenu?.some(sub => pathname === sub.path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-darkBackgroundV1" suppressHydrationWarning>
      <Suspense fallback={null}>
        <CommonHeader />
      </Suspense>
      <div className="flex overflow-y-auto pt-[78px]">
        <div
          className={cn(
            "bg-darkBackgroundV1 transition-all duration-300 flex-shrink-0 sticky top-[78px] h-[calc(100vh-78px)] border-r border-darkBorderV1 self-start",
            isOpen
              ? "w-[250px]"
              : "w-0 md:w-16 overflow-hidden flex justify-center",
          )}
        >
          <div className="flex flex-col h-full bg-darkBackgroundV1">
            <nav className="flex-1 overflow-y-auto py-4 bg-darkBackgroundV1 custom-scrollbar">
              <ul className={cn("", isOpen ? "px-3" : "px-2")}>
                {dashboardMenuItems.map((menu) => (
                  <li key={menu.id} className="mb-2">
                    <div
                      className="relative"
                      onMouseEnter={() => !isOpen && setHoverMenu(menu.id)}
                      onMouseLeave={() => setHoverMenu(null)}
                    >
                      <Link href={menu.path}>
                        <RippleEffect
                          rippleColor="rgba(68, 215, 182, 0.3)"
                          duration={500}
                        >
                          <div
                            className={cn(
                              "flex items-center rounded-lg p-2 h-[44px] text-sm font-medium transition-all duration-300 border cursor-pointer",
                              isMenuActive(menu)
                                ? "bg-accent/10 text-accent border-accent/20 shadow-[0_0_15px_rgba(68,215,182,0.1)]"
                                : "text-neutral-400 border-transparent hover:bg-accent/5 hover:text-accent/80 hover:border-accent/10",
                              !isOpen && "!justify-center w-[46px]",
                            )}
                          >
                            <Icon
                              path={menu.icon}
                              size={0.8}
                              className={cn(
                                "flex-shrink-0",
                                isMenuActive(menu) ? "text-accent" : "text-neutral-400"
                              )}
                            />
                            {isOpen && (
                              <span className="ml-3 text-nowrap font-semibold">
                                {menu.name}
                              </span>
                            )}
                          </div>
                        </RippleEffect>
                      </Link>

                      {!isOpen && hoverMenu === menu.id && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.2 }}
                            className="fixed ml-16 bg-darkCardV1 border border-darkBorderV1 text-accent text-xs font-bold py-2 px-3 rounded-md z-[1000] whitespace-nowrap shadow-xl"
                            style={{ top: 'auto' }}
                          >
                            {menu.name}
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={cn("p-4 w-full border-t border-darkBorderV1", isOpen ? "px-4" : "px-2")}>
              <Button
                onClick={toggle}
                variant="ghost"
                className={cn(
                  "w-full bg-darkBorderV1/40 hover:bg-darkBorderV1/60",
                  !isOpen && "p-0 h-10 w-10"
                )}
              >
                <Icon path={isOpen ? mdiFullscreenExit : mdiFullscreen} size={0.8} />
                {isOpen && <span className="ml-2">Thu gọn</span>}
              </Button>
            </div>
          </div>
        </div>
        <main className="flex-1 flex flex-col h-[calc(100vh-78px)] overflow-y-auto custom-scrollbar">
          <div className="flex-1 py-6 px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function TabletLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: profileResponse } = useMe();
  const profile = profileResponse?.data;
  const permissions = (profile as any)?.permissions || [];
  const role = (profile as any)?.role;
  const menuItems = getDashboardMenuItems(permissions, role);

  return (
    <div className="min-h-screen bg-darkBackgroundV1 flex flex-col">
      <Suspense fallback={null}>
        <CommonHeader />
      </Suspense>
      <div className="flex-1 flex mt-[78px] h-[calc(100vh-78px)] overflow-hidden">
        <div className="w-16 border-r border-darkBorderV1 h-full flex flex-col items-center py-4 bg-darkBackgroundV1">
          <nav className="flex-1 w-full px-2 space-y-2">
            {menuItems.map((menu) => (
              <Link key={menu.id} href={menu.path}>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all border cursor-pointer",
                  pathname === menu.path
                    ? "bg-accent/10 text-accent border-accent/20 shadow-[0_0_15px_rgba(68,215,182,0.1)]"
                    : "text-neutral-400 border-transparent hover:bg-accent/5"
                )}>
                  <Icon path={menu.icon} size={0.8} />
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <main className="flex-1 overflow-y-auto p-4 bg-darkBackgroundV1 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: profileResponse } = useMe();
  const profile = profileResponse?.data;
  const { isOpen, toggle } = useMenuSidebar();
  const permissions = (profile as any)?.permissions || [];
  const role = (profile as any)?.role;
  const menuItems = getDashboardMenuItems(permissions, role);

  return (
    <div className="h-screen bg-darkBackgroundV1 flex flex-col overflow-hidden">
      <Suspense fallback={null}>
        <CommonHeader />
      </Suspense>
      <Drawer open={isOpen} onOpenChange={(val) => { if (!val && isOpen) toggle(); }} direction="left">
        <DrawerContent
          className="!inset-x-auto !inset-y-0 !left-0 !right-auto !mt-0 !rounded-none !rounded-r-2xl w-[280px] h-full border-r border-darkBorderV1 bg-darkCardV1 flex flex-col p-0 [&>div:first-child]:hidden"
        >
          <div className="p-6 border-b border-darkBorderV1 flex items-center justify-center">
            <Image src="/images/primary-logo.svg" width={200} height={100} alt="Logo" className="h-10 w-auto" />
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map(item => (
              <Link
                key={item.id}
                href={item.path}
                onClick={toggle}
              >
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all border cursor-pointer mb-2",
                  pathname === item.path
                    ? "bg-accent/10 text-accent border-accent/20"
                    : "text-neutral-300 border-transparent hover:bg-accent/5"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    pathname === item.path ? "bg-accent/20" : "bg-darkBorderV1"
                  )}>
                    <Icon path={item.icon} size={0.8} />
                  </div>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>
        </DrawerContent>
      </Drawer>

      <main className="flex-1 mt-[78px] overflow-y-auto p-4 bg-darkBackgroundV1 custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
