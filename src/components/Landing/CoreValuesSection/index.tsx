"use client"

import Image from "next/image"
import { Icon } from "@/components/ui/mdi-icon"
import {
    mdiMapMarker,
    mdiCalendar,
    mdiAccountGroup,
    mdiTrendingUp,
    mdiChartBar,
    mdiFlash,
    mdiShieldCheck,
    mdiLightbulbOn,
    mdiHandshakeOutline,
} from "@mdi/js"
import { motion, Variants } from "framer-motion"

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
}

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
}

const coreValues = [
    {
        icon: mdiLightbulbOn,
        title: "Thông minh",
        description: "AI phân tích và gợi ý phù hợp nhất cho từng cá nhân, từng thời điểm.",
        accent: "text-accent",
        bg: "bg-accent",
    },
    {
        icon: mdiFlash,
        title: "Tốc độ",
        description: "Đặt sân chỉ trong 30 giây. Không cần gọi điện, không cần chờ đợi.",
        accent: "text-accent",
        bg: "bg-accent",
    },
    {
        icon: mdiHandshakeOutline,
        title: "Kết nối",
        description: "Xây dựng cộng đồng cầu lông sôi động, kết nối người chơi và chủ sân.",
        accent: "text-accent",
        bg: "bg-accent",
    },
    {
        icon: mdiShieldCheck,
        title: "Tin cậy",
        description: "Hệ thống bảo mật, thanh toán an toàn, thông tin minh bạch 100%.",
        accent: "text-accent",
        bg: "bg-accent",
    },
]

const playerBenefits = [
    {
        icon: mdiMapMarker,
        title: "Tìm sân gần nhất",
        description: "AI gợi ý sân cầu lông phù hợp nhất dựa trên vị trí, thời gian và sở thích của bạn.",
    },
    {
        icon: mdiCalendar,
        title: "Đặt chỗ tức thì",
        description: "Chọn sân, chọn giờ, thanh toán - chỉ trong 30 giây. Không cần gọi điện, không cần đợi.",
    },
    {
        icon: mdiAccountGroup,
        title: "Tìm bạn chơi",
        description: "Kết nối với cộng đồng người chơi cùng trình độ. Tự động ghép cặp và tạo trận đấu.",
    },
]

const ownerBenefits = [
    {
        icon: mdiTrendingUp,
        title: "Tăng doanh thu 40%",
        description: "Tối ưu công suất sân với hệ thống đặt chỗ thông minh. Giảm sân trống, tăng lượt đặt.",
    },
    {
        icon: mdiChartBar,
        title: "Quản lý dễ dàng",
        description: "Dashboard toàn diện: theo dõi doanh thu, khách hàng, lịch đặt - mọi thứ trong tầm tay.",
    },
    {
        icon: mdiFlash,
        title: "Vận hành tự động",
        description: "Tự động xác nhận đặt sân, gửi nhắc nhở, xử lý thanh toán. Tiết kiệm 80% thời gian.",
    },
]

export function CoreValuesSection() {
    return (
        <section id="features" className="relative overflow-hidden bg-background py-20">
            {/* SVG Background - Ultra-curvy organic blobs */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className="h-full w-full opacity-80" preserveAspectRatio="xMidYMid slice" style={{ overflow: 'visible' }}>
                    <defs>
                        <radialGradient id="blob-gradient-1" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#141F1B" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#141F1B" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="blob-gradient-2" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#141F1B" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#141F1B" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="blob-gradient-3" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#141F1B" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#141F1B" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <path
                        d="M800,400C800,620,630,780,400,780C170,780,0,620,0,400C0,180,170,20,400,20C630,20,800,180,800,400Z"
                        fill="url(#blob-gradient-2)"
                        transform="translate(420, 220) scale(1.1)"
                    />
                    <path
                        d="M600,300C600,480,470,580,300,580C130,580,0,480,0,300C0,120,130,20,300,20C470,20,600,120,600,300Z"
                        fill="url(#blob-gradient-3)"
                        transform="translate(80, 450) scale(1)"
                    />
                </svg>
            </div>

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                {/* Section header */}
                <motion.div
                    className="mx-auto max-w-3xl text-center flex flex-col gap-2"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div custom={0} variants={fadeUp} className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-secondary shadow-lg shadow-primary/25">
                        <Icon path={mdiLightbulbOn} size={1} />
                    </motion.div>
                    <motion.p custom={1} variants={fadeUp} className="text-xl font-semibold uppercase tracking-widest text-primary">
                        Giá trị cốt lõi
                    </motion.p>
                    <motion.h2 custom={2} variants={fadeUp} className="text-balance text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
                        Lợi ích nhân đôi cho mọi người
                    </motion.h2>
                    <motion.p custom={3} variants={fadeUp} className="text-xl leading-relaxed text-muted-foreground">
                        Dù bạn là người chơi hay chủ sân, BadmintonHub mang đến giải pháp toàn diện giúp nâng cao trải nghiệm cầu lông.
                    </motion.p>
                </motion.div>

                {/* Core values - horizontal cards */}
                <motion.div
                    className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {coreValues.map((value, i) => (
                        <motion.div
                            key={value.title}
                            custom={i}
                            variants={scaleIn}
                            className="group relative overflow-hidden rounded-2xl border border-accent/15 bg-card p-4 transition-all duration-500 hover:-translate-y-1 hover:border-secondary/30 hover:shadow-xl hover:shadow-accent/10"
                        >
                            {/* Top accent line */}
                            <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl ${value.bg}`} />
                            {/* Hover glow */}
                            <div className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${value.bg}/20`} />

                            <div className="relative">
                                <div
                                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${value.bg}/15 ${value.accent}`}
                                >
                                    <Icon path={value.icon} size={1} />
                                </div>
                                <h3 className="text-xl font-semibold text-primary">
                                    {value.title}
                                </h3>
                                <p className="mt-2 text-lg font-normal leading-relaxed text-muted-foreground">
                                    {value.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Two-column benefits */}
                <div className="mt-24 grid gap-8 lg:grid-cols-2">
                    {/* Player column */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        <motion.div custom={0} variants={fadeUp} className="relative mb-8 overflow-hidden rounded-2xl">
                            <Image
                                src="/images/players-group.jpg"
                                alt="Nhóm người chơi cầu lông vui vẻ"
                                width={600}
                                height={340}
                                className="h-56 w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary backdrop-blur-sm">
                                        <Icon path={mdiAccountGroup} size={0.8} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-secondary">
                                            Dành cho Người chơi
                                        </h3>
                                        <p className="text-lg text-secondary/80">Trải nghiệm đặt sân hoàn hảo</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex flex-col gap-4">
                            {playerBenefits.map((benefit, i) => (
                                <motion.div
                                    key={benefit.title}
                                    custom={i + 1}
                                    variants={fadeUp}
                                    className="group flex gap-4 rounded-xl border border-transparent bg-secondary p-4 transition-all duration-300"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-secondary shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-110">
                                        <Icon path={benefit.icon} size={0.8} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-primary">
                                            {benefit.title}
                                        </h4>
                                        <p className="text-lg leading-relaxed text-muted-foreground">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Owner column */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        <motion.div custom={0} variants={fadeUp} className="relative mb-8 overflow-hidden rounded-2xl">
                            <Image
                                src="/images/owner-dashboard.jpg"
                                alt="Giao diện quản lý sân cầu lông trên laptop"
                                width={600}
                                height={340}
                                className="h-56 w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary backdrop-blur-sm">
                                        <Icon path={mdiChartBar} size={0.8} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-secondary">
                                            Dành cho Chủ sân
                                        </h3>
                                        <p className="text-lg text-secondary/80">Quản lý hiệu quả, tăng doanh thu</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex flex-col gap-4">
                            {ownerBenefits.map((benefit, i) => (
                                <motion.div
                                    key={benefit.title}
                                    custom={i + 1}
                                    variants={fadeUp}
                                    className="group flex gap-4 rounded-xl border border-transparent bg-secondary p-4 transition-all duration-300"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-secondary shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-110">
                                        <Icon path={benefit.icon} size={0.8} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-primary">
                                            {benefit.title}
                                        </h4>
                                        <p className="text-lg leading-relaxed text-muted-foreground">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
