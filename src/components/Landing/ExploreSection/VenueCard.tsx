"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { IVenue } from "@/interface/venue";
import {
  mdiChevronRightCircleOutline,
  mdiClock,
  mdiMap,
  mdiShimmer,
  mdiStar
} from "@mdi/js";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface VenueCardProps {
  venue: IVenue;
  isAI?: boolean;
  index?: number;
}

export const VenueCard = ({ venue, isAI, index = 0 }: VenueCardProps) => {
  const fadeUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const displayPrice = `${venue.pricePerHour?.toLocaleString("vi-VN")}đ/h`;
  const displayImage = venue.images?.[0]?.imageUrl || "/images/court-1.jpg";

  return (
    <motion.div
      key={venue._id}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border-2 border-darkBorderV1 bg-card transition-all duration-500 hover:-translate-y-1.5 hover:border-accent hover:shadow-xl hover:shadow-accent/15 h-full flex flex-col"
    >
      <Link href={`/venues/${venue._id}`} className="flex flex-col h-full">
        {/* Court image with overlay */}
        <div className="relative h-48 w-full overflow-hidden shrink-0">
          <Image
            src={displayImage}
            alt={venue.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {isAI && (
            <Badge variant="badminton" className="absolute left-2 top-2">
              <Icon path={mdiShimmer} size={0.6} />
              Gợi ý AI {venue.matchScore && `(${venue.matchScore}%)`}
            </Badge>
          )}

          {/* Price tag */}
          <div className="flex gap-1 absolute bottom-2 right-2">
            <Badge variant="badminton">
              {displayPrice}
            </Badge>
            <Badge variant="badminton">
              <Icon path={mdiClock} size={0.6} />
              {venue.openTime} - {venue.closeTime}
            </Badge>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-semibold text-primary line-clamp-2">
              {venue.name}
            </h3>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5">
              <Icon path={mdiStar} size={0.6} className="text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">{venue.averageRating ? venue.averageRating.toFixed(1) : "4.5"}</span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1 text-sm text-neutral-500 font-semibold">
            <Icon path={mdiMap} size={0.6} className="flex-shrink-0" />
            <span className="line-clamp-1">{venue.address}</span>
          </div>
          {/* AI Analysis */}
          {isAI && venue.detailedAnalysis && (
            <div className="mt-2 rounded-xl bg-primary/5 p-3 border border-primary/10">
              <div className="flex items-center gap-1.5 text-primary text-sm font-bold mb-1 uppercase">
                <Icon path={mdiShimmer} size={0.8} />
                Phân tích từ AI
              </div>
              <p className="text-base text-neutral-600 italic">
                {venue.detailedAnalysis}
              </p>
            </div>
          )}
          {/* Bottom action row */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
            <span className="flex items-center gap-1 text-base font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {venue.available || 5} sân trống
            </span>
            <Button>
              Xem chi tiết sân
              <Icon path={mdiChevronRightCircleOutline} size={0.8} />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
