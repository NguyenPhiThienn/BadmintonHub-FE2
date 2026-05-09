"use client";

import { Icon } from "@/components/ui/mdi-icon";
import { useUser } from "@/context/useUserContext";
import { useAiRecommendations, useVenues } from "@/hooks/useVenue";
import { IAIRecommendationResponse, IVenue } from "@/interface/venue";
import { mdiFilterVariant, mdiFire, mdiFlashOutline, mdiMapMarkerRadiusOutline } from "@mdi/js";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FilterChip } from "./FilterChip";
import { SearchBar } from "./SearchBar";
import { VenueCard } from "./VenueCard";

// Swiper imports
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const filters = [
  { label: "Gần bạn", icon: <Icon path={mdiMapMarkerRadiusOutline} size={0.6} />, id: "nearby" },
  { label: "Giá rẻ", icon: <Icon path={mdiFlashOutline} size={0.6} />, id: "cheap" },
  { label: "Đánh giá cao", icon: <Icon path={mdiFire} size={0.6} />, id: "trending" },
];

export const ExploreSection = () => {
  const router = useRouter();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: venuesRes, isLoading } = useVenues({ limit: 12, search: debouncedSearch });
import { AIRecommendationSection } from "./AIRecommendationSection";

// ... inside ExploreSection component ...
  const venues = Array.isArray(venuesRes?.data) ? venuesRes.data : venuesRes?.data?.venues || [];

  const fadeUp: Variants = {
// ...
  return (
    <section className="relative py-12 px-4 md:px-8 space-y-4 bg-darkBackgroundV1">
      {/* Search & Filter Header */}
      <div className="max-w-7xl mx-auto space-y-4">
        {/* ... SearchBar and FilterChips ... */}
      </div>

      {/* New AI Recommendation Section */}
      <AIRecommendationSection allVenues={venues} />

      {/* General Venue List */}
      <div className="space-y-4">
// ...

      {/* General Venue List */}
      <div className="space-y-4">
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
              {venues.map((venue: IVenue, i: number) => (
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
