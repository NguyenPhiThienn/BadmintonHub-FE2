"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IVenue } from "@/interface/venue";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiMapMarker, mdiStar, mdiClock, mdiStarOutline, mdiStarHalfFull, mdiTagOutline } from "@mdi/js";
import { Badge } from "@/components/ui/badge";

import { calculateDistance, formatDistance } from "@/lib/utils/distance";

interface VenueCardHorizontalProps {
  venue: IVenue;
  onClick?: () => void;
  userLocation?: { lat: number; lng: number };
}

export const VenueCardHorizontal = ({ venue, onClick, userLocation }: VenueCardHorizontalProps) => {
  const displayImage = venue.images?.[0] || "/images/court-1.jpg";

  // Calculate distance
  const vLat = venue.coordinates?.coordinates[1] || venue.location?.lat;
  const vLng = venue.coordinates?.coordinates[0] || venue.location?.lng;

  let distanceStr = "---";
  if (vLat && vLng) {
    const refLat = userLocation?.lat || 10.762622;
    const refLng = userLocation?.lng || 106.660172;
    const dist = calculateDistance(refLat, refLng, vLat, vLng);
    distanceStr = formatDistance(dist);
  }

  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-3 p-3 bg-darkCardV1 border-2 border-darkBorderV1 rounded-2xl hover:border-accent transition-all group overflow-hidden cursor-pointer"
    >
      {/* Top Section: Image & Main Info */}
      <div className="flex gap-3">
        <div className="relative w-28 h-28 shrink-0 overflow-hidden rounded-xl bg-darkBackgroundV2">
          <Image
            src={displayImage}
            alt={venue.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <h3 className="text-neutral-300 font-semibold text-base line-clamp-1 group-hover:text-accent transition-colors">
            {venue.name}
          </h3>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const rating = venue.average_rating || 4.5;
              if (star <= Math.floor(rating)) {
                return <Icon key={star} path={mdiStar} size={0.8} className="text-amber-400" />;
              } else if (star - 0.5 <= rating) {
                return <Icon key={star} path={mdiStarHalfFull} size={0.8} className="text-amber-400" />;
              } else {
                return <Icon key={star} path={mdiStarOutline} size={0.8} className="text-neutral-600" />;
              }
            })}
            <span className="text-sm font-bold text-amber-400 ml-1">({venue.average_rating || 4.5})</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Icon path={mdiClock} size={0.6} className="flex-shrink-0" />
            <span className="text-sm">{venue.open_time} - {venue.close_time}</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 px-3 py-1 rounded-lg">
              <Icon path={mdiTagOutline} size={0.7} className="text-accent" />
              <div className="text-accent font-bold text-lg leading-tight">
                {(venue.price_per_hour || 120000).toLocaleString()}đ<span className="text-sm">/h</span>
              </div>
            </div>
            <Badge variant="neutral">
              {distanceStr}
            </Badge>
          </div>
        </div>
      </div>

      {/* Bottom Section: Address & Description */}
      <div className="flex flex-col gap-1.5 border-t border-darkBorderV1 pt-3">
        <div className="flex items-center gap-1">
          <Icon path={mdiMapMarker} size={0.8} className="flex-shrink-0 text-accent" />
          <span className="text-neutral-300 text-sm"><strong>Địa chỉ: </strong>{venue.address}</span>
        </div>

        {venue.description && (
          <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed bg-darkBackgroundV1 p-2 py-3 rounded-lg italic">
            "{venue.description}"
          </p>
        )}
      </div>
    </div>
  );
};
