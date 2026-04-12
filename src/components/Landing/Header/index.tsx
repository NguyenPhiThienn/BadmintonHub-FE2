"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/mdi-icon"
import { mdiMenu, mdiClose, mdiBellOutline, mdiAccountOutline, mdiLogout, mdiLockReset, mdiTicketOutline, mdiHomeOutline, mdiMapMarkerOutline, mdiCalendarMonthOutline } from "@mdi/js"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { AuthDialogs, AuthMode } from "@/components/Auth/AuthDialogs"
import { useUser } from "@/context/useUserContext"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navLinks = [
  { label: "Trang chủ", href: "/", icon: mdiHomeOutline },
  { label: "Bản đồ sân", href: "/venues", icon: mdiMapMarkerOutline },
  { label: "Lịch của tôi", href: "/my-bookings", icon: mdiCalendarMonthOutline },
];

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [authMode, setAuthMode] = useState<AuthMode>(null)
    const { user, logoutUser: handleLogout } = useUser()

    return (
        <motion.header
            className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
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
                    {navLinks.map((link) => (
                        <Button key={link.href} variant="ghost2" asChild>
                            <Link href={link.href} className="flex items-center gap-2">
                                <Icon path={link.icon} size={0.7} />
                                {link.label}
                            </Link>
                        </Button>
                    ))}
                </nav>

                {/* CTA + Mobile toggle */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost-badminton" size="icon" asChild className="relative">
                                <Link href="/notifications">
                                    <Icon path={mdiBellOutline} size={0.8} />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
                                </Link>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                                        <Avatar className="h-10 w-10 border border-border/40">
                                            <AvatarImage
                                                src={user.avatar_url || `https://api.dicebear.com/9.x/bottts/svg?seed=${user.full_name}`}
                                                alt={user.full_name}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {user.full_name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold leading-none">{user.full_name}</p>
                                            <p className="text-sm leading-none text-neutral-400">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <Icon path={mdiAccountOutline} size={0.8} />
                                            <span>Trang cá nhân</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/vouchers" className="cursor-pointer">
                                            <Icon path={mdiTicketOutline} size={0.8} />
                                            <span>Ví Voucher</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/change-password" className="cursor-pointer">
                                            <Icon path={mdiLockReset} size={0.8} />
                                            <span>Đổi mật khẩu</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-500 cursor-pointer focus:text-red-500" onClick={handleLogout}>
                                        <Icon path={mdiLogout} size={0.8} />
                                        <span>Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <Button variant="default" onClick={() => setAuthMode("login")}>
                                Đăng nhập
                            </Button>
                            <Button variant="accent" onClick={() => setAuthMode("register")}>
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
                            {navLinks.map((link) => (
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
                            ))}
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
