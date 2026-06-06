"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { IVenue } from "@/types/venue";
import { mdiBadminton, mdiClock, mdiMapMarker, mdiStar, mdiStarHalfFull, mdiStarOutline, mdiTagOutline, mdiHeart, mdiHeartOutline } from "@mdi/js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useUser } from "@/context/useUserContext";
import { useFavoriteVenues, useToggleFavorite } from "@/hooks/useUsers";
import { calculateDistance, formatDistance } from "@/lib/utils/distance";

interface VenueCardHorizontalProps {
  venue: IVenue;
  onClick?: () => void;
  userLocation?: { lat: number; lng: number };
}

export const VenueCard = ({ venue, onClick, userLocation }: VenueCardHorizontalProps) => {
  const router = useRouter();
  const displayImage = venue.images?.[0]?.imageUrl || "/images/court-1.jpg";

  const { user } = useUser();
  const { data: favData } = useFavoriteVenues({}, { enabled: !!user });
  const { mutate: toggleFav } = useToggleFavorite();

  const isFavorite = favData?.data?.venues?.some((v: any) => v._id === venue._id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      toast.warn("Vui lòng đăng nhập để thêm sân yêu thích");
      return;
    }
    toggleFav(venue._id);
  };

  // Calculate distance
  const vLat = venue.coordinates?.coordinates[1];
  const vLng = venue.coordinates?.coordinates[0];

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
      className="flex flex-col h-full gap-3 p-3 bg-darkCardV1 border-2 border-darkBorderV1 rounded-2xl hover:border-accent transition-all group overflow-hidden cursor-pointer"
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
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-black/70 transition-all"
          >
            <Icon 
              path={isFavorite ? mdiHeart : mdiHeartOutline} 
              size={0.6} 
              className={isFavorite ? "text-red-500" : "text-white"} 
            />
          </button>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <h3 className="text-neutral-300 font-semibold text-base line-clamp-1 group-hover:text-accent transition-colors">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1">
            {venue.averageRating && venue.averageRating > 0 ? (
              <>
                {[1, 2, 3, 4, 5].map((star) => {
                  const rating = venue.averageRating || 0;
                  if (star <= Math.floor(rating)) {
                    return <Icon key={star} path={mdiStar} size={0.8} className="text-amber-400" />;
                  } else if (star - 0.5 <= rating) {
                    return <Icon key={star} path={mdiStarHalfFull} size={0.8} className="text-amber-400" />;
                  } else {
                    return <Icon key={star} path={mdiStarOutline} size={0.8} className="text-neutral-600" />;
                  }
                })}
                <span className="text-sm font-semibold text-amber-400 ml-1">({Number(venue.averageRating).toFixed(1)})</span>
              </>
            ) : (
              <span className="text-sm text-neutral-500">Chưa có đánh giá</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Icon path={mdiTagOutline} size={0.8} className="text-accent" />
            <div className="text-accent font-semibold text-lg leading-tight">
              {(venue.pricePerHour || 120000).toLocaleString()}đ<span className="text-sm">/h</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="neutral">
              <Icon path={mdiClock} size={0.6} className="flex-shrink-0" />{venue.openTime} - {venue.closeTime}
            </Badge>
            <Badge variant="neutral">
              {distanceStr}
            </Badge>
          </div>
        </div>
      </div>

      {/* Bottom Section: Address & Description */}
      <div className="flex flex-col flex-1 gap-1 border-t border-darkBorderV1 pt-3">
        <div className="flex items-center gap-1">
          <Icon path={mdiMapMarker} size={0.8} className="flex-shrink-0 text-accent" />
          <span className="text-neutral-300 text-sm font-semibold">Địa chỉ: </span>
        </div>
        <span className="text-neutral-300 text-sm">{venue.address}</span>

        {venue.description && (
          <div className="text-sm text-neutral-400 leading-relaxed line-clamp-2 mt-1">
            {venue.description}
          </div>
        )}

        <div className="mt-auto pt-2">
          <Link target="_blank" href={`/venues/${venue._id}`}>
            <Button
              variant="accent"
              className="w-full"
            >
              <Icon path={mdiBadminton} size={0.8} />
              Xem chi tiết
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
