"use client"

import Image from "next/image"
import { Icon } from "@/components/ui/mdi-icon"
import { mdiAccountSupervisorCircle } from "@mdi/js"
import { motion, Variants } from "framer-motion"

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
}

const container = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.04 },
    },
}

const wordAnim: Variants = {
    hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
}

const pillAnim: Variants = {
    hidden: { opacity: 0, scaleX: 0.3, scaleY: 0.8 },
    visible: {
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
}

function InlinePill({ src, alt }: { src: string; alt: string }) {
    return (
        <motion.span
            variants={pillAnim}
            className="relative mx-1 inline-block h-[0.85em] w-[2.2em] origin-center overflow-hidden rounded-full align-middle sm:mx-2"
            style={{ verticalAlign: "-0.08em" }}
        >
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                sizes="140px"
            />
        </motion.span>
    )
}

function Word({ children, className = "" }: { children: string; className?: string }) {
    return (
        <motion.span variants={wordAnim} className={`inline ${className}`}>
            {children}
        </motion.span>
    )
}

export function AboutSection() {
    return (
        <section className="relative overflow-hidden bg-background py-20">
            <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
                <motion.div
                    className="mb-12 flex flex-col items-center justify-center gap-2"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div custom={0} variants={fadeUp} className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-secondary shadow-lg shadow-primary/25">
                        <Icon path={mdiAccountSupervisorCircle} size={1} />
                    </motion.div>
                    <motion.p custom={1} variants={fadeUp} className="text-xl font-semibold uppercase tracking-widest text-primary">
                        Về chúng tôi
                    </motion.p>
                </motion.div>

                {/* Large inline text with pill images */}
                <motion.div
                    className="text-center text-3xl font-semibold leading-normal tracking-tight sm:text-4xl md:text-5xl lg:text-5xl lg:leading-tight"
                    variants={container}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                >
                    {/* Line 1 */}
                    <span className="text-foreground">
                        <Word>{"Tại BadmintonHub, chúng tôi "}</Word>
                        <Word>{"mang đến "}</Word>
                        <InlinePill src="/images/about-court.jpg" alt="Sân cầu lông" />
                        <Word>{" trải nghiệm cầu lông "}</Word>
                    </span>

                    {/* Line 2 */}
                    <span className="text-foreground">
                        <Word>{"tuyệt vời cho mọi người. "}</Word>
                        <Word>{"Khám phá những "}</Word>
                        <InlinePill src="/images/about-shuttlecock.jpg" alt="Quả cầu" />
                        <Word>{" sân tốt nhất, "}</Word>
                    </span>

                    {/* Line 3 - faded */}
                    <span className="text-foreground/40">
                        <Word className="text-foreground/40">{"phù hợp với "}</Word>
                        <InlinePill src="/images/about-shoes.jpg" alt="Giày thể thao" />
                        <Word className="text-foreground/40">{" lịch trình và vị trí của bạn, "}</Word>
                    </span>

                    {/* Line 4 - more faded */}
                    <span className="text-foreground/30">
                        <Word className="text-foreground/30">{"đảm bảo trải nghiệm hoàn hảo mọi lúc."}</Word>
                    </span>
                </motion.div>
            </div>
        </section>
    )
}
