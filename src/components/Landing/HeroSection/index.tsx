"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/mdi-icon"
import { mdiArrowRight, mdiPlay, mdiTrendingUp } from "@mdi/js"
import { motion, Variants } from "framer-motion"
import Link from "next/link"

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
}

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
}

const statsStagger: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: 0.8 + i * 0.1, ease: "easeOut" },
    }),
}

export function HeroSection() {
    return (
        <section className="relative min-h-screen overflow-hidden">
            {/* Background image */}
            <Image
                src="/images/hero-badminton.jpg"
                alt=""
                fill
                className="object-cover"
                priority
                aria-hidden="true"
            />
            {/* Dark overlay for text contrast */}
            <div className="absolute inset-0 bg-black/60" />
            {/* Subtle green tint overlay */}
            <div className="absolute inset-0 bg-primary/20" />

            {/* SVG decorative elements */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                    <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" className="stroke-accent/10" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-grid)" />
            </svg>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-20 lg:px-8">
                <div className="w-full flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-8">
                    {/* Left: text content */}
                    <motion.div
                        className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div custom={0} variants={fadeUp}>
                            <Badge variant="outline2" className="mb-6 ">
                                Nền tảng đặt sân cầu lông #1 Việt Nam
                            </Badge>
                        </motion.div>

                        <motion.h1
                            custom={1}
                            variants={fadeUp}
                            className="max-w-2xl text-4xl font-semibold tracking-tight text-secondary sm:text-5xl lg:text-6xl flex flex-col gap-3"
                        >
                            <span>
                                Đặt sân thông minh,{" "}
                            </span>
                            <p>
                                <span className="text-accent">dễ dàng</span>{" "}
                                kết nối.
                            </p>
                        </motion.h1>

                        <motion.p
                            custom={2}
                            variants={fadeUp}
                            className="mt-6 max-w-xl text-lg leading-relaxed text-secondary/80 lg:text-xl"
                        >
                            Giải pháp toàn diện để tìm sân và đặt chỗ nhanh chóng.
                            Tích hợp công nghệ AI giúp bạn tối ưu hóa trải nghiệm và kết nối đam mê cầu lông.
                        </motion.p>

                        <motion.div
                            custom={3}
                            variants={fadeUp}
                            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
                        >
                            <Button size="xl" asChild>
                                <Link href="#cta">
                                    Bắt đầu miễn phí
                                    <Icon path={mdiArrowRight} size={0.8} />
                                </Link>
                            </Button>
                            <Button variant="outline" size="xl" asChild className="border-white/30 bg-white/5 text-secondary hover:bg-white/15 hover:text-secondary backdrop-blur-sm">
                                <Link href="#features">
                                    <Icon path={mdiPlay} size={0.8} />
                                    Xem cách hoạt động
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Right: floating stat card */}
                    <motion.div
                        className="relative"
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-md w-[400px]">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 text-primary items-center justify-center rounded-full bg-secondary">
                                    <Icon path={mdiTrendingUp} size={1.2} />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-secondary/80">Lượt đặt hôm nay</p>
                                    <p className="text-2xl font-semibold text-secondary">+2,847</p>
                                </div>
                            </div>
                            <div className="flex gap-2 rotate-180">
                                {[65, 45, 78, 56, 89, 67, 95].map((h, i) => (
                                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                                        <div
                                            className="w-full rounded-sm bg-secondary/60"
                                            style={{ height: `${h}px` }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Stats strip */}
                <motion.div
                    className="mt-20 grid w-full grid-cols-2 gap-8 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                >
                    {[
                        { value: "500+", label: "Sân cầu lông" },
                        { value: "50K+", label: "Người chơi" },
                        { value: "1M+", label: "Lượt đặt sân" },
                        { value: "98%", label: "Hài lòng" },
                    ].map((stat, i) => (
                        <motion.div key={stat.label} custom={i} variants={statsStagger} className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
                            <span className="text-3xl font-semibold text-accent lg:text-4xl">
                                {stat.value}
                            </span>
                            <span className="mt-1 text-base text-secondary/80 font-semibold">{stat.label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
