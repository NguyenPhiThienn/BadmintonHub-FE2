"use client";

import { mdiAccountTie, mdiCheckDecagram, mdiChevronRight, mdiPhone, mdiStar } from "@mdi/js";
import Icon from "@mdi/react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import CircularButton from "../CircularButton";
import Loader from "../Loader";

const FRAME_COUNT = 120;
const IMAGE_PATH = "/images/ezgif-frame-";

export const ScrollSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Snappier physics for more responsive scrolling
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 40,
    restDelta: 0.001
  });

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new window.Image();
      const frameIndex = i.toString().padStart(3, "0");
      img.src = `${IMAGE_PATH}${frameIndex}.jpg`;
      img.onload = () => {
        loadedCount++;
        setProgress((loadedCount / FRAME_COUNT) * 100);
        if (loadedCount === FRAME_COUNT) {
          setImages(loadedImages);
          setIsLoading(false);
        }
      };
      loadedImages[i - 1] = img;
    }
  }, []);

  // Update canvas when smoothProgress changes
  useEffect(() => {
    if (images.length === 0 || !canvasRef.current) return;

    const unsubscribe = smoothProgress.on("change", (latest) => {
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(latest * FRAME_COUNT)
      );
      renderFrame(frameIndex);
    });

    // Initial render
    renderFrame(0);

    return () => unsubscribe();
  }, [images, smoothProgress]);

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = images[index];

    if (canvas && ctx && img) {
      const dpr = window.devicePixelRatio || 1;

      // Clear canvas using the high-res dimensions
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Enable high-quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw image with "cover" logic (filling the screen)
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, drawX, drawY;

      if (canvasRatio < imgRatio) {
        // Height is the constraint
        drawHeight = canvas.height + 4; // Add slight bleed to prevent gaps
        drawWidth = Math.ceil(img.width * (drawHeight / img.height));
        drawX = Math.floor((canvas.width - drawWidth) / 2);
        drawY = -2; // Offset bleed
      } else {
        // Width is the constraint
        drawWidth = canvas.width + 4; // Add slight bleed to prevent gaps
        drawHeight = Math.ceil(img.height * (drawWidth / img.width));
        drawX = -2; // Offset bleed
        // Align to BOTTOM instead of centering vertically
        drawY = Math.floor(canvas.height - drawHeight) + 2;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
  };

  // Resize canvas to window size with DPR scaling
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Set the internal buffer size to match viewport pixels * dpr
        canvasRef.current.width = width * dpr;
        canvasRef.current.height = height * dpr;

        // Re-render current frame after resize
        const currentProgress = smoothProgress.get();
        const frameIndex = Math.min(
          FRAME_COUNT - 1,
          Math.floor(currentProgress * FRAME_COUNT)
        );
        renderFrame(frameIndex);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [images]);

  // Text overlay transforms - Synchronized 0.1 rhythm
  const titleOpacity = useTransform(smoothProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const titleY = useTransform(smoothProgress, [0, 0.1, 0.2], [0, 0, -50]);

  const featuresOpacity = useTransform(smoothProgress, [0.2, 0.3, 0.7, 0.8], [0, 1, 1, 0]);
  const featuresY = useTransform(smoothProgress, [0.2, 0.3, 0.7, 0.8], [40, 0, 0, -40]);

  const ctaOpacity = useTransform(smoothProgress, [0.85, 0.95], [0, 1]);
  const ctaScale = useTransform(smoothProgress, [0.85, 0.95], [0.8, 1]);
  const ctaY = useTransform(smoothProgress, [0.85, 0.95], [30, 0]);

  // Horizontal layout shifts using translate
  const canvasX = useTransform(smoothProgress, [0, 1], ["25%", "20%"]);
  const contentX = useTransform(smoothProgress, [0, 1], ["0%", "0%"]);
  return (
    <div ref={containerRef} className="relative h-[400vh] bg-[#E6E6E6]">
      {/* Loading Screen Overlay */}
      {isLoading && (
        <div className="fixed inset-0 w-full h-screen flex flex-col items-center justify-center bg-[#E6E6E6] text-teal-950 z-[100]">
          <Loader />
          <p className="text-base font-medium  uppercase text-teal-950 mt-4">Đang tải... {Math.round(progress)}%</p>
        </div>
      )}

      <section className="sticky top-20 h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.canvas
          ref={canvasRef}
          style={{ x: canvasX }}
          className="absolute inset-0 w-full h-full block z-0"
        />

        {/* Dark Overlay */}
        <motion.div
          style={{ x: canvasX }}
          className="absolute inset-0 bg-black/10 z-[5] pointer-events-none"
        />
        <div className="ml-10 absolute inset-0 -top-20 pointer-events-none z-10">
          {/* First Section */}
          <motion.div
            style={{ opacity: titleOpacity, y: titleY, x: contentX }}
            className="absolute inset-0 w-fit flex flex-col gap-8 items-center justify-center"
          >
            <div className="w-full text-4xl md:text-7xl  font-semibold text-primary text-wrap uppercase">
              <div className="flex items-center gap-4">
                <h1>GIẢI PHÁP</h1>
                <Loader />
              </div>
              <div>
                <h1>TỰ ĐỘNG ĐIỆN</h1>
              </div>
            </div>
            <div className="flex items-stretch gap-4 pointer-events-auto">
              {/* Customer Stats Card - Top Left */}
              <div className="flex items-start rounded-2xl border border-secondary/10 bg-primary p-3 backdrop-blur-md transition-all shadow-2xl shadow-primary/40 flex-col gap-2">
                {/* Avatar Group */}
                <div className="flex -space-x-3 overflow-hidden flex-shrink-0 mb-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="inline-block h-10 w-10 rounded-full border-2 border-primary bg-secondary/20 ring-2 ring-transparent">
                      <Image
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 123}`}
                        alt="Customer"
                        width={40}
                        height={40}
                        unoptimized
                        className="rounded-full"
                      />
                    </div>
                  ))}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-secondary text-xs font-semibold text-primary ring-2 ring-transparent">
                    +250
                  </div>
                </div>
                <div className="flex items-center gap-1 h-full">
                  <div className="flex flex-col justify-between h-full gap-1">
                    <div className="flex items-center gap-1">
                      <Icon path={mdiCheckDecagram} size={0.6} className="text-secondary" />
                      <span className="text-sm font-semibold text-secondary/80">Công ty tin cậy</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon path={mdiAccountTie} size={0.6} className="text-secondary" />
                      <span className="text-sm font-semibold text-secondary/80">Khách hàng doanh nghiệp</span>
                    </div>
                  </div>

                  <div className="ml-2 border-l-2 border-secondary/20 pl-4 h-full flex flex-col justify-center">
                    <div className="text-xl font-semibold text-secondary">98%</div>
                    <div className="text-sm font-semibold text-secondary/80">Hài lòng</div>
                  </div>
                </div>
              </div>

              {/* Product Card - Bottom Left */}
              <div className="group w-fit overflow-hidden rounded-2xl border border-secondary/10 bg-primary p-3 hover:shadow-2xl hover:shadow-primary/40 flex flex-col justify-center backdrop-blur-md transition-all shadow-2xl shadow-primary/40">
                <div className="flex gap-4 items-center">
                  {/* Product Image - Square on left */}
                  <div className="relative aspect-square w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl bg-secondary/10">
                    <Image
                      src="https://giaiphaptudongdien.com/wp-content/uploads/2024/12/z6133468496889_02de85660e72ce86adebeb5790c558ef.jpg"
                      alt="Rơle trung gian Schneider"
                      fill
                      unoptimized
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  </div>

                  {/* Content on right */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-secondary/80">Sản phẩm tiêu biểu</span>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold text-secondary leading-tight truncate">Rơle trung gian Schneider</h3>

                      {/* Stars - Now below title */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Icon key={i} path={mdiStar} size={0.8} className="text-yellow-300" />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm text-secondary"><strong>Trạng thái:</strong> <span className="text-sm text-secondary">Sẵn hàng</span></p>
                      </div>
                      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary transition-transform group-hover:scale-110">
                        <Icon path={mdiChevronRight} size={0.8} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <CircularButton />

          </motion.div>

          {/* Features Section */}
          <motion.div
            style={{ opacity: featuresOpacity, y: featuresY, x: contentX }}
            className="absolute inset-0 top-1/4 w-[40%] flex flex-col gap-8 items-center justify-center"
          >
            <div className="flex-1 w-full text-left">
              <h2 className="text-4xl font-semibold text-primary leading-tight">Thiết bị điều khiển & giám sát.</h2>
              <p className="text-xl text-primary my-4 font-normal text-justify italic">Cung cấp Rơle trung gian, bộ chuyển đổi tín hiệu và thiết bị bảo vệ từ các thương hiệu hàng đầu: Carlo Gavazzi, Schneider, Phoenix Contact.</p>
              <h2 className="text-4xl font-semibold text-primary leading-tight">Thí nghiệm & kiểm định.</h2>
              <p className="text-xl text-primary mt-4 font-normal text-justify italic">Dịch vụ thí nghiệm định kỳ, bảo dưỡng thiết bị điện cao áp và kiểm định trạm biến áp lên đến 220kV.</p>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            style={{ opacity: ctaOpacity, scale: ctaScale, y: ctaY, x: contentX }}
            className="absolute inset-0 flex flex-col items-start justify-center px-4"
          >
            <div className="max-w-xl w-full text-left">
              <h2 className="text-5xl md:text-7xl font-semibold text-primary tracking-tighter mb-8 uppercase leading-[1]">An Toàn &<br />Hiệu Quả.</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pointer-events-auto w-fit px-10 py-4 bg-primary text-secondary font-semibold  rounded-2xl text-lg cursor-pointer hover:bg-primary/95 transition-all shadow-2xl flex items-center gap-3 group"
              >
                <Icon path={mdiPhone} size={1} className="group-hover:rotate-12 transition-transform" />
                <span>Liên Hệ Ngay</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
