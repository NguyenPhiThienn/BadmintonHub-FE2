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
import { mdiAccountOutline, mdiCalendarMonthOutline, mdiClose, mdiHomeOutline, mdiLogout, mdiMapMarkerOutline, mdiMenu } from "@mdi/js"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const navLinks = [
    { label: "Trang chủ", href: "/", icon: mdiHomeOutline },
    { label: "Đặt sân", href: "/venues", icon: mdiMapMarkerOutline },
    { label: "Lịch sử đặt sân", href: "/my-bookings", icon: mdiCalendarMonthOutline },
    { label: "Trang cá nhân", href: "/profile", icon: mdiAccountOutline },
];

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [authMode, setAuthMode] = useState<AuthMode>(null)
    const { user, logoutUser: handleLogout } = useUser()

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-border/40 bg-white"
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
            <div className="mx-auto flex h-16 max-w-8xl items-center justify-between px-4 lg:px-8">
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
                <nav className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => {
                        const isProtectedRoute = link.href === "/my-bookings" || link.href === "/profile";
                        if (isProtectedRoute && !user) {
                            return (
                                <Button
                                    key={link.href}
                                    variant="ghost2"
                                    className="flex items-center gap-2"
                                    onClick={() => setAuthMode("login")}
                                >
                                    <Icon path={link.icon} size={0.8} />
                                    {link.label}
                                </Button>
                            );
                        }
                        return (
                            <Button key={link.href} variant="ghost2" asChild>
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-10 w-10 border border-primary rounded-full cursor-pointer ">
                                    <AvatarImage
                                        src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${user.fullName}`}
                                        alt={user.fullName}
                                        className="bg-darkBorderV1"
                                    />
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold leading-none text-wrap">{user.fullName}</p>
                                        <p className="text-sm leading-none text-neutral-400 line-clamp-1">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <Icon path={mdiAccountOutline} size={0.8} />
                                        <span>Trang cá nhân</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/my-bookings" className="cursor-pointer text-secondary">
                                        <Icon path={mdiCalendarMonthOutline} size={0.8} />
                                        <span>Lịch sử đặt sân</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500 cursor-pointer focus:text-red-500" onClick={handleLogout}>
                                    <Icon path={mdiLogout} size={0.8} />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
