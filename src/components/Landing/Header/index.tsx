"use client"

import { AuthDialogs, AuthMode } from "@/components/Auth"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/mdi-icon"
import { useUser } from "@/context/useUserContext"
import { mdiAccountOutline, mdiCalendarMonthOutline, mdiClose, mdiHomeOutline, mdiLogout, mdiMapMarkerOutline, mdiMenu, mdiStorefrontOutline, mdiHeartOutline, mdiBellOutline, mdiCheckCircle, mdiCreditCardOutline, mdiClockOutline } from "@mdi/js"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { NotificationBell } from "@/components/Common/NotificationBell"

const navLinks = [
    { label: "Trang chủ", href: "/", icon: mdiHomeOutline },
    { label: "Đặt sân", href: "/venues", icon: mdiMapMarkerOutline },
    { label: "Lịch sử đặt sân", href: "/my-bookings", icon: mdiCalendarMonthOutline },
    { label: "Sân yêu thích", href: "/favorites", icon: mdiHeartOutline },
    { label: "Trang cá nhân", href: "/profile", icon: mdiAccountOutline },
];

export function Header() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [authMode, setAuthMode] = useState<AuthMode>(null)
    const { user, profile, logoutUser: handleLogout } = useUser()

    useEffect(() => {
        const handleOpenAuth = (e: Event) => {
            const customEvent = e as CustomEvent;
            setAuthMode(customEvent.detail || "login");
        };
        window.addEventListener("open-auth", handleOpenAuth);
        return () => window.removeEventListener("open-auth", handleOpenAuth);
    }, []);

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-darkBorderV1 bg-darkCardV1/80 backdrop-blur-xl shadow-lg shadow-black/20 pr-[var(--removed-body-scroll-bar-size,0px)]"
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
            <div className="relative mx-auto flex h-16 max-w-8xl items-center justify-between px-4 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/images/primary-logo.svg"
                        alt="BadmintonHub Logo"
                        width={500}
                        height={500}
                        className="h-8 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-2 md:flex">
                    {navLinks.map((link) => {
                        const isProtectedRoute = link.href === "/my-bookings" || link.href === "/profile";
                        const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                        
                        const activeClass = "text-accent bg-accent/15 font-semibold shadow-[0_0_15px_rgba(65,198,81,0.2)]";
                        const defaultClass = "text-neutral-300 hover:text-white hover:bg-white/10";
                        
                        if (isProtectedRoute && !user) {
                            return (
                                <Button
                                    key={link.href}
                                    variant="ghost"
                                    className={`flex items-center gap-2 transition-all duration-300 ${isActive ? activeClass : defaultClass}`}
                                    onClick={() => setAuthMode("login")}
                                >
                                    <Icon path={link.icon} size={0.8} />
                                    {link.label}
                                </Button>
                            );
                        }
                        return (
                            <Button 
                                key={link.href} 
                                variant="ghost" 
                                asChild 
                                className={`transition-all duration-300 ${isActive ? activeClass : defaultClass}`}
                            >
                                <Link href={link.href} className="flex items-center gap-2">
                                    <Icon path={link.icon} size={0.8} />
                                    {link.label}
                                </Link>
                            </Button>
                        );
                    })}
                </nav>

                {/* CTA + Mobile toggle */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {/* User Avatar & Greeting */}
                            <div className="hidden lg:flex flex-col items-end mr-1">
                                <span className="text-sm text-neutral-300 font-semibold truncate max-w-[200px]">
                                    👋 Xin chào, {user.role === "PLAYER" ? "Khách hàng" : (user.role?.toUpperCase() === "OWNER" ? "Chủ sân" : "Quản trị viên")}
                                </span>
                                <span className="text-xs font-semibold text-accent text-right max-w-[220px] truncate">
                                    {user.fullName}
                                </span>
                            </div>
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-10 w-10 border-2 border-darkBorderV1 hover:border-accent transition-colors rounded-full cursor-pointer shadow-lg shadow-black/20">
                                        <AvatarImage
                                            src={profile?.data?.avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${user.fullName}`}
                                            alt={user.fullName}
                                            className="bg-darkBorderV1"
                                        />
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-72 bg-darkCardV1 border border-darkBorderV1 shadow-2xl rounded-xl p-2" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal p-3">
                                        <div className="flex flex-col space-y-1.5">
                                            <p className="text-base font-bold text-white text-wrap">{user.fullName}</p>
                                            <p className="text-xs text-neutral-400 break-all mt-0.5">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-darkBorderV1 my-1" />
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 text-neutral-300 focus:text-white focus:bg-white/10 hover:bg-white/10 transition-colors">
                                        <Link href="/profile" className="flex items-center gap-3">
                                            <Icon path={mdiAccountOutline} size={0.9} />
                                            <span className="font-medium text-[15px]">Trang cá nhân</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 text-neutral-300 focus:text-white focus:bg-white/10 hover:bg-white/10 transition-colors">
                                        <Link href="/my-bookings" className="flex items-center gap-3">
                                            <Icon path={mdiCalendarMonthOutline} size={0.9} />
                                            <span className="font-medium text-[15px]">Lịch sử đặt sân</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 text-neutral-300 focus:text-white focus:bg-white/10 hover:bg-white/10 transition-colors">
                                        <Link href="/favorites" className="flex items-center gap-3">
                                            <Icon path={mdiHeartOutline} size={0.9} />
                                            <span className="font-medium text-[15px]">Sân yêu thích</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    {user.role === "PLAYER" ? (
                                        <>
                                            <DropdownMenuSeparator className="bg-darkBorderV1 my-1" />
                                            <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 text-neutral-300 focus:text-white focus:bg-white/10 hover:bg-white/10 transition-colors">
                                                <Link href="/register-owner" className="flex items-center gap-3">
                                                    <Icon path={mdiStorefrontOutline} size={0.9} />
                                                    <span className="font-medium text-[15px]">Đăng ký chủ sân</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    ) : (user.role === "OWNER" || user.role === "OWNER" || user.role === "owner" || user.role === "OWNER") ? (
                                        <>
                                            <DropdownMenuSeparator className="bg-darkBorderV1 my-1" />
                                            <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 text-accent focus:text-accent focus:bg-accent/10 hover:bg-accent/10 transition-colors">
                                                <Link href="/owner" className="flex items-center gap-3 font-semibold">
                                                    <Icon path={mdiStorefrontOutline} size={0.9} />
                                                    <span className="font-medium text-[15px]">Trang chủ sân</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    ) : (user.role === "ADMIN" || user.role === "admin") ? (
                                        <>
                                            <DropdownMenuSeparator className="bg-darkBorderV1 my-1" />
                                            <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 text-accent focus:text-accent focus:bg-accent/10 hover:bg-accent/10 transition-colors">
                                                <Link href="/admin" className="flex items-center gap-3 font-semibold">
                                                    <Icon path={mdiStorefrontOutline} size={0.9} />
                                                    <span className="font-medium text-[15px]">Trang quản trị</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    ) : null}
                                    <DropdownMenuSeparator className="bg-darkBorderV1 my-1" />
                                    <DropdownMenuItem className="cursor-pointer rounded-lg p-3 text-red-400 focus:text-red-400 focus:bg-red-500/10 hover:bg-red-500/10 transition-colors" onClick={handleLogout}>
                                        <Icon path={mdiLogout} size={0.9} />
                                        <span className="font-medium text-[15px]">Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Notification Bell (Moved to the right) */}
                            <div className="ml-1">
                                <NotificationBell />
                            </div>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <Button variant="primary" onClick={() => setAuthMode("login")}>
                                Đăng nhập
                            </Button>
                            <Button variant="primary" onClick={() => setAuthMode("register")}>
                                Đăng ký
                            </Button>
                        </div>
                    )}

                    {!user && (
                        <Button
                            variant="ghost-badminton"
                            size="sm"
                            className="md:hidden"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
                        >
                            {mobileOpen ? <Icon path={mdiClose} size={0.8} /> : <Icon path={mdiMenu} size={0.8} />}
                        </Button>
                    )}
                </div>
            </div>

            {/* Mobile Nav (Burger Menu - Only for Guest) */}
            <AnimatePresence>
                {!user && mobileOpen && (
                    <motion.nav
                        className="border-t border-border/40 bg-background px-4 py-4 md:hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const isProtectedRoute = link.href === "/my-bookings" || link.href === "/profile";
                                if (isProtectedRoute && !user) {
                                    return (
                                        <Button
                                            key={link.href}
                                            variant="ghost-badminton"
                                            className="justify-start hover:text-primary gap-3 px-4"
                                            onClick={() => {
                                                setMobileOpen(false);
                                                setAuthMode("login");
                                            }}
                                        >
                                            <Icon path={link.icon} size={0.8} />
                                            {link.label}
                                        </Button>
                                    );
                                }
                                return (
                                    <Button
                                        key={link.href}
                                        variant="ghost-badminton"
                                        className="justify-start hover:text-primary gap-3 px-4"
                                        asChild
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <Link href={link.href}>
                                            <Icon path={link.icon} size={0.8} />
                                            {link.label}
                                        </Link>
                                    </Button>
                                );
                            })}
                            <Button
                                variant="badminton"
                                className="mt-2 bg-primary hover:bg-secondary text-secondary"
                                onClick={() => {
                                    setMobileOpen(false);
                                    setAuthMode("register");
                                }}
                            >
                                Bắt đầu ngay
                            </Button>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>

            <AuthDialogs mode={authMode} setMode={setAuthMode} />
        </motion.header>
    )
}
