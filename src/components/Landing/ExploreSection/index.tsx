"use client";

import { Icon } from "@/components/ui/mdi-icon";
import { useUser } from "@/context/useUserContext";
import { useAiRecommendations, useVenues } from "@/hooks/useVenue";
import { IAIRecommendationResponse, IVenue } from "@/interface/venue";
import { mdiFire, mdiLoading } from "@mdi/js";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AIRecommendationSection } from "./AIRecommendationSection";
import { VenueCard } from "./VenueCard";

// Swiper imports
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
export const ExploreSection = () => {
  const router = useRouter();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: venuesRes, isLoading } = useVenues({ limit: 12, search: debouncedSearch });
  const aiMutation = useAiRecommendations();
  const [activeFilter, setActiveFilter] = useState("nearby");
  const [recommendedVenues, setRecommendedVenues] = useState<IVenue[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setRecommendedVenues([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (val: string) => {
    if (val.trim()) {
      router.push(`/venues?search=${encodeURIComponent(val)}`);
    }
  };

  const venues = Array.isArray(venuesRes?.data) ? venuesRes.data : venuesRes?.data?.venues || [];

  const handleGetAIRecommendations = () => {
    const lat = 10.762622;
    const lng = 106.660172;

    aiMutation.mutate(
      {
        userId: user?.id || "",
        preferences: {},
        lat,
        lng
      },
      {
        onSuccess: (res: IAIRecommendationResponse) => {
          if (res.data && res.data.length > 0) {
            setRecommendedVenues(res.data);
          }
        },
      }
    );
  };

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
      {/* AI Recommendation Section */}
      <AIRecommendationSection
        onTrigger={handleGetAIRecommendations}
        isLoading={aiMutation.isPending}
      />

      {/* General Venue List */}
      <div className="space-y-4">
        <motion.div
          className="flex items-center justify-between max-w-7xl mx-auto"
          initial="hidden" animate="visible" variants={fadeUp} custom={5}
        >
          <h2 className={`text-xl font-semibold flex items-center gap-2 ${recommendedVenues.length > 0 || aiMutation.isPending ? "text-secondary" : "text-white"}`}>
            {aiMutation.isPending ? (
              <>
                <Icon path={mdiLoading} size={1} className="animate-spin" />
                AI ĐANG PHÂN TÍCH...
              </>
            ) : recommendedVenues.length > 0 ? (
              <>
                <Icon path={mdiFire} size={1} />
                DANH SÁCH SÂN ĐƯỢC GỢI Ý TỪ AI
              </>
            ) : (
              "DANH SÁCH SÂN QUANH ĐÂY"
            )}
          </h2>
          <span className="text-base text-neutral-400 cursor-pointer hover:underline">
            {recommendedVenues.length > 0 ? "Kết quả phù hợp nhất" : "Gần bạn nhất"}
          </span>
        </motion.div>

        {isLoading || aiMutation.isPending ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((idx: number) => (
              <div key={idx} className="aspect-[3/4] bg-darkCardV1 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {(recommendedVenues.length > 0 ? recommendedVenues : venues).map((venue: IVenue, i: number) => (
              <VenueCard key={venue._id} venue={venue} index={i} isAI={recommendedVenues.length > 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
