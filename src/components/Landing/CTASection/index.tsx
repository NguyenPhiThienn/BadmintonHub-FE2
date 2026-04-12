"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/ui/mdi-icon"
import { mdiArrowRight, mdiShieldCheck, mdiFlash, mdiHeart } from "@mdi/js"
import { motion, Variants } from "framer-motion"

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
}

export function CTASection() {
    return (
        <section id="cta" className="relative overflow-hidden py-20">
            {/* Background image */}
            <Image
                src="/images/cta-bg.jpg"
                alt=""
                fill
                className="object-cover"
                aria-hidden="true"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/65" />
            {/* Green tint */}
            <div className="absolute inset-0 bg-primary/30" />

            {/* SVG decorative - floating circles */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                    <pattern id="cta-circles" width="100" height="100" patternUnits="userSpaceOnUse">
                        <circle cx="50" cy="50" r="30" fill="none" className="stroke-accent/10" strokeWidth="1" />
                        <circle cx="50" cy="50" r="15" fill="none" className="stroke-secondary/10" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cta-circles)" />
            </svg>

            <motion.div
                className="relative mx-auto max-w-7xl px-4 lg:px-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className="mx-auto max-w-3xl text-center">
                    <motion.h2 custom={0} variants={fadeUp} className="text-3xl font-semibold tracking-tight text-secondary sm:text-4xl lg:text-5xl">
                        Sẵn sàng trải nghiệm tương lai của cầu lông?
                    </motion.h2>
                    <motion.p custom={1} variants={fadeUp} className="mt-6 text-xl leading-relaxed text-secondary/80">
                        Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt dành cho thành viên tiên phong.
                    </motion.p>

                    {/* Registration form */}
                    <motion.div custom={2} variants={fadeUp} className="mx-auto mt-10 max-w-md">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Input
                                type="email"
                                placeholder="Nhập email của bạn..."
                                className="h-12 border-white/20 bg-white/10 text-secondary placeholder:text-secondary/50 focus-visible:border-white focus-visible:ring-white/30 !text-lg"
                            />
                            <Button size="xl">
                                Đăng ký ngay
                                <Icon path={mdiArrowRight} size={0.8} />
                            </Button>
                        </div>
                        <p className="mt-4 text-lg text-secondary/58">
                            Miễn phí. Không cần thẻ tín dụng. Hủy bất cứ lúc nào.
                        </p>
                    </motion.div>

                    {/* Trust signals */}
                    <motion.div custom={3} variants={fadeUp} className="mt-12 flex flex-wrap items-center justify-center gap-8 text-secondary">
                        <div className="flex items-center gap-2">
                            <Icon path={mdiShieldCheck} size={1} />
                            <span className="text-lg">Bảo mật toàn diện</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon path={mdiFlash} size={1} />
                            <span className="text-lg">Cài đặt trong 30 giây</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon path={mdiHeart} size={1} />
                            <span className="text-lg">50,000+ người dùng</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}
