"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IVenue } from "@/interface/venue";
import { Icon } from "@/components/ui/mdi-icon";
import {
  mdiMap,
  mdiClock,
  mdiStar,
  mdiCheckCircle,
  mdiCreation,
  mdiChevronRightCircleOutline
} from "@mdi/js";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  // Mock data for missing fields
  const mockFeatures = ["Wi-Fi", "Gửi xe", "Căng tin", "Cho thuê vợt"];
  const displayPrice = `${venue.pricePerHour?.toLocaleString("vi-VN")}đ/h`;
  const displayImage = venue.images?.[0] || "/images/court-1.jpg";

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
            <Badge variant="badminton" className="absolute left-4 top-4 gap-1 shadow-lg bg-primary border-none text-white">
              <Icon path={mdiCreation} size={0.55} />
              Gợi ý AI {venue.matchScore && `(${venue.matchScore}%)`}
            </Badge>
          )}

          {/* Price tag */}
          <div className="absolute bottom-4 right-4 rounded-lg bg-white/95 px-3 py-1.5 text-sm font-semibold text-primary shadow-md backdrop-blur-sm">
            {displayPrice}
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">
              {venue.name}
            </h3>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5">
              <Icon path={mdiStar} size={0.6} className="text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">{venue.averageRating ? venue.averageRating.toFixed(1) : "4.5"}</span>
              <span className="text-xs font-semibold text-amber-700">(88)</span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1 text-sm text-neutral-500 font-semibold">
            <Icon path={mdiMap} size={0.6} className="flex-shrink-0" />
            <span className="line-clamp-1">{venue.address}</span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-sm text-neutral-500 font-semibold">
            <Icon path={mdiClock} size={0.6} />
            {venue.openTime} - {venue.closeTime}
          </div>

          {/* Features tags */}
          <div className="mt-4 flex flex-wrap gap-1">
            {mockFeatures.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-primary whitespace-nowrap"
              >
                <Icon path={mdiCheckCircle} size={0.6} />
                {feature}
              </span>
            ))}
          </div>

          {/* Bottom action row */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
            <span className="flex items-center gap-1 text-base font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {venue.available || 5} sân trống
            </span>
            <Button variant="accent">
              Đặt ngay
              <Icon path={mdiChevronRightCircleOutline} size={0.8} />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
