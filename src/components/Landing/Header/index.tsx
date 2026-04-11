"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/mdi-icon"
import { mdiMenu, mdiClose } from "@mdi/js"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

const navLinks = [
    { label: "Tính năng", href: "#features" },
    { label: "Người chơi", href: "#player" },
    { label: "Chủ sân", href: "#owner" },
    { label: "Công nghệ AI", href: "#ai" },
    { label: "Liên hệ", href: "#footer" },
]

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)

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
                            <Link href={link.href}>{link.label}</Link>
                        </Button>
                    ))}
                </nav>

                {/* CTA + Mobile toggle */}
                <div className="flex items-center gap-3">
                    <Button variant="default" asChild>
                        <Link href="#cta">Đăng nhập</Link>
                    </Button>
                    <Button variant="accent" asChild>
                        <Link href="#cta">Đăng ký</Link>
                    </Button>
                    <Button
                        variant="ghost-badminton"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
                    >
                        {mobileOpen ? <Icon path={mdiClose} size={0.8} /> : <Icon path={mdiMenu} size={0.8} />}
                    </Button>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileOpen && (
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
                                    className="justify-start hover:text-primary"
                                    asChild
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Link href={link.href}>{link.label}</Link>
                                </Button>
                            ))}
                            <Button variant="badminton" className="mt-2 bg-primary hover:bg-secondary text-secondary" asChild>
                                <Link href="#cta" onClick={() => setMobileOpen(false)}>Bắt đầu ngay</Link>
                            </Button>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </motion.header>
    )
}
