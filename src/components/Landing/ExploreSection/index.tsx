"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { SearchBar } from "./SearchBar";
import { FilterChip } from "./FilterChip";
import { VenueCard } from "./VenueCard";
import { useVenues, useAiRecommendations } from "@/hooks/useVenue";
import { useUser } from "@/context/useUserContext";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiFlashOutline, mdiMapMarkerRadiusOutline, mdiFire, mdiFilterVariant } from "@mdi/js";
import { IVenue, IAIRecommendationResponse } from "@/interface/venue";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

const filters = [
  { label: "Gần bạn", icon: <Icon path={mdiMapMarkerRadiusOutline} size={0.6} />, id: "nearby" },
  { label: "Giá rẻ", icon: <Icon path={mdiFlashOutline} size={0.6} />, id: "cheap" },
  { label: "Đánh giá cao", icon: <Icon path={mdiFire} size={0.6} />, id: "trending" },
];

export const ExploreSection = () => {
  const { user } = useUser();
  const { data: venuesRes, isLoading } = useVenues({ limit: 12 });
  const aiMutation = useAiRecommendations();
  const [activeFilter, setActiveFilter] = useState("nearby");
  const [recommendedVenues, setRecommendedVenues] = useState<IVenue[]>([]);

  useEffect(() => {
    if (user?.id) {
      aiMutation.mutate(
        { user_id: user.id as string, preferences: {} },
        {
          onSuccess: (res: IAIRecommendationResponse) => {
            if (res.data && venuesRes?.data) {
              const scored = venuesRes.data.slice(0, 5).map((v: IVenue, i: number) => ({
                ...v,
                match_score: res.data[i]?.match_score || 95 + i,
              }));
              setRecommendedVenues(scored);
            }
          },
        }
      );
    }
  }, [user?.id, venuesRes]);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <section className="relative py-12 px-4 md:px-8 space-y-4 bg-darkBackgroundV1">
      {/* Search & Filter Header */}
      <div className="max-w-7xl mx-auto space-y-4">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <SearchBar />
        </motion.div>

        <motion.div
          className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              icon={filter.icon}
              active={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            />
          ))}
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-darkBorderV1 text-neutral-400 text-sm hover:text-accent transition-colors">
            <Icon path={mdiFilterVariant} size={0.6} />
            <span>Lọc thêm</span>
          </button>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      {recommendedVenues.length > 0 && (
        <div className="space-y-6">
          <motion.div
            className="flex items-center justify-between max-w-7xl mx-auto"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              DÀNH RIÊNG CHO BẠN
            </h2>
            <span className="text-base text-accent cursor-pointer hover:underline">Xem tất cả</span>
          </motion.div>

          <div className="w-full">
            <Swiper
              slidesPerView={1.2}
              spaceBetween={20}
              freeMode={true}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: { slidesPerView: 2.2 },
                1024: { slidesPerView: 3.2 },
                1280: { slidesPerView: 4 },
              }}
              modules={[FreeMode, Autoplay, Pagination]}
              className="px-4 md:px-8 !pb-10"
            >
              {recommendedVenues.map((venue: IVenue, i: number) => (
                <SwiperSlide key={`ai-${venue._id}`}>
                  <VenueCard venue={venue} isAI index={i} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* General Venue List */}
      <div className="space-y-6">
        <motion.div
          className="flex items-center justify-between max-w-7xl mx-auto"
          initial="hidden" animate="visible" variants={fadeUp} custom={5}
        >
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            DANH SÁCH SÂN QUANH ĐÂY
          </h2>
          <span className="text-base text-neutral-400 cursor-pointer hover:underline">Gần bạn nhất</span>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((idx: number) => (
              <div key={idx} className="aspect-[3/4] bg-darkCardV1 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="w-full">
            <Swiper
              slidesPerView={1.2}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                480: { slidesPerView: 2.2 },
                768: { slidesPerView: 3.2 },
                1024: { slidesPerView: 4.2 },
                1440: { slidesPerView: 5.2 },
              }}
              modules={[FreeMode]}
              className="px-4 md:px-8"
            >
              {venuesRes?.data?.map((venue: IVenue, i: number) => (
                <SwiperSlide key={venue._id}>
                  <VenueCard venue={venue} index={i} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
};
