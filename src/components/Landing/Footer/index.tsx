"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

const footerLinks = {
    "Sản phẩm": [
        { label: "Tính năng", href: "#features" },
        { label: "Người chơi", href: "#player" },
        { label: "Chủ sân", href: "#owner" },
        { label: "Bảng giá", href: "#" },
    ],
    "Hỗ trợ": [
        { label: "Trung tâm trợ giúp", href: "#" },
        { label: "Liên hệ", href: "#" },
        { label: "FAQ", href: "#" },
        { label: "Cộng đồng", href: "#" },
    ],
    "Công ty": [
        { label: "Về chúng tôi", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Tuyển dụng", href: "#" },
        { label: "Báo chí", href: "#" },
    ],
    "Pháp lý": [
        { label: "Điều khoản", href: "#" },
        { label: "Quyền riêng tư", href: "#" },
        { label: "Cookie", href: "#" },
        { label: "Giấy phép", href: "#" },
    ],
}

export function Footer() {
    return (
        <footer id="footer" className="relative overflow-hidden border-t border-border bg-card">
            {/* SVG Background - Subtle mesh */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                    <pattern id="footer-mesh" width="48" height="48" patternUnits="userSpaceOnUse">
                        <path d="M48 0L0 48M0 0l48 48" className="stroke-primary/5" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#footer-mesh)" />
            </svg>

            <motion.div
                className="relative mx-auto max-w-7xl px-4 lg:px-8 lg:pt-16 pb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/images/primary-logo.svg"
                                alt="BadmintonHub Logo"
                                width={500}
                                height={500}
                                className="h-8 w-auto object-contain"
                            />
                        </Link>
                        <p className="mt-4 text-justify text-lg leading-relaxed text-muted-foreground">
                            Nền tảng đặt sân cầu lông thông minh #1 Việt Nam. Kết nối người chơi và chủ sân.
                        </p>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="mb-4 text-xl font-semibold text-primary">{category}</h4>
                            <ul className="flex flex-col gap-2 text-lg">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link className="hover:underline" href={link.href}>{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
                    <p className="text-base text-muted-foreground">
                        &copy; 2026 BadmintonHub. Bản quyền thuộc về BadmintonHub.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="#" target="_blank" rel="noopener noreferrer">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#3F6844">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </Link>
                        <Link href="#" target="_blank" rel="noopener noreferrer">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="#3F6844">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </Link>
                        <Link href="#" target="_blank" rel="noopener noreferrer">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#3F6844">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.894c-.165.165-.387.256-.62.256H6.726c-.233 0-.455-.091-.62-.256a.875.875 0 0 1 0-1.24l7.287-7.287H7.5a.875.875 0 1 1 0-1.75h8.75c.483 0 .875.392.875.875v8.75c0 .233-.091.455-.256.62a.875.875 0 0 1-.975.032z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </footer>
    )
}
