"use client"

import { Icon } from "@/components/ui/mdi-icon"
import { mdiAccountPlus, mdiMagnify, mdiCheckCircle, mdiArrowRight, mdiListBoxOutline } from "@mdi/js"
import { motion, Variants } from "framer-motion"

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
}

const steps = [
    {
        step: 1,
        icon: mdiAccountPlus,
        title: "Đăng ký tài khoản",
        description: "Tạo tài khoản miễn phí chỉ trong 30 giây. Hỗ trợ đăng nhập bằng Google, Facebook hoặc số điện thoại.",
        color: "accent",
        details: ["Đăng ký nhanh 30s", "Đăng nhập mạng xã hội", "Xác minh OTP"],
    },
    {
        step: 2,
        icon: mdiMagnify,
        title: "Tìm và đặt sân",
        description: "AI gợi ý sân phù hợp nhất. Chọn giờ, thanh toán online - xong! Không cần gọi điện.",
        color: "secondary",
        details: ["AI gợi ý thông minh", "Thanh toán tức thì", "Xác nhận tự động"],
    },
    {
        step: 3,
        icon: mdiCheckCircle,
        title: "Chơi và tận hưởng",
        description: "Nhận thông báo xác nhận, đến sân và bắt đầu trận đấu. Đánh giá sân để giúp cộng đồng.",
        color: "primary",
        details: ["Nhắc nhở trước giờ", "Check-in QR Code", "Đánh giá & review"],
    },
]

export function HowItWorksSection() {
    return (
        <section className="relative overflow-hidden bg-background py-20">
            {/* SVG Background */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                    <pattern id="hiw-circles" width="60" height="60" patternUnits="userSpaceOnUse">
                        <circle cx="30" cy="30" r="20" fill="none" className="stroke-secondary/5" strokeWidth="1" />
                    </pattern>
                    <radialGradient id="hiw-glow-left" cx="10%" cy="50%">
                        <stop offset="0%" className="stop-color-accent/10" />
                        <stop offset="100%" className="stop-color-transparent" />
                    </radialGradient>
                    <radialGradient id="hiw-glow-right" cx="90%" cy="50%">
                        <stop offset="0%" className="stop-color-primary/10" />
                        <stop offset="100%" className="stop-color-transparent" />
                    </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#hiw-circles)" />
                <rect width="100%" height="100%" fill="url(#hiw-glow-left)" />
                <rect width="100%" height="100%" fill="url(#hiw-glow-right)" />
            </svg>

            {/* Top wave */}
            <svg className="pointer-events-none absolute -top-px left-0 right-0 h-16 text-background" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1440 64">
                <path d="M0,0 L1440,0 L1440,32 C1200,64 240,0 0,32 Z" fill="currentColor" />
            </svg>

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                <motion.div
                    className="mx-auto max-w-3xl text-center flex flex-col gap-2"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div custom={0} variants={fadeUp} className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary shadow-lg shadow-secobg-secondary/25">
                        <Icon path={mdiListBoxOutline} size={1} />
                    </motion.div>
                    <motion.p custom={1} variants={fadeUp} className="text-xl font-semibold uppercase tracking-widest text-secondary/80">
                        Cách thức hoạt động
                    </motion.p>
                    <motion.h2 custom={2} variants={fadeUp} className="text-balance text-3xl font-semibold tracking-tight text-secondary/90 sm:text-4xl lg:text-5xl">
                        3 bước đơn giản để bắt đầu
                    </motion.h2>
                    <motion.p custom={3} variants={fadeUp} className="text-xl leading-relaxed text-secondary/80">
                        Trải nghiệm mượt mà từ lúc đăng ký đến khi bước vào sân.
                    </motion.p>
                </motion.div>

                {/* Steps - horizontal timeline */}
                <div className="relative mt-20">
                    {/* Connecting line - desktop only */}
                    <div className="absolute left-[16.67%] right-[16.67%] top-[52px] hidden h-px lg:block">
                        <div className="h-full w-full bg-gradient-to-r from-accent/40 via-secondary/40 to-primary/40" />
                        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/40" />
                    </div>

                    <motion.div
                        className="grid gap-8 lg:grid-cols-3"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.step}
                                custom={i}
                                variants={fadeUp}
                                className="group relative flex h-full flex-col items-center text-center"
                            >
                                {/* Step number circle */}
                                <div className="relative mb-8">
                                    {/* Outer ring */}
                                    <div
                                        className={`flex h-[104px] w-[104px] items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-105 bg-accent/10 border-2 border-accent/30`}
                                    >
                                        {/* Inner circle */}
                                        <div
                                            className={`flex h-20 w-20 flex-col items-center justify-center rounded-full text-secondary shadow-lg transition-transform duration-300 group-hover:scale-110 bg-accent shadow-accent/40`}
                                        >
                                            <span className="text-sm font-semibold uppercase tracking-wider">
                                                Bước
                                            </span>
                                            <span className="text-2xl font-semibold leading-none">
                                                {step.step}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content card */}
                                <div className="flex w-full flex-1 flex-col rounded-2xl border border-accent/10 bg-card p-4 transition-all duration-300 group-hover:border-secondary/25 group-hover:shadow-lg group-hover:shadow-accent/10">
                                    <div className="mb-3 flex items-center justify-center gap-2">
                                        <Icon path={step.icon} size={0.8} className="text-primary" />
                                        <h3 className="text-xl font-semibold text-primary">
                                            {step.title}
                                        </h3>
                                    </div>

                                    <p className="text-base leading-relaxed text-neutral-400">
                                        {step.description}
                                    </p>

                                    {/* Detail chips */}
                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        {step.details.map((detail) => (
                                            <span
                                                key={detail}
                                                className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-sm font-medium text-primary"
                                            >
                                                <Icon path={mdiCheckCircle} size={0.6} />
                                                {detail}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
