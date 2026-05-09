"use client";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiChevronLeft, mdiMapMarker, mdiShareVariantOutline, mdiStar } from "@mdi/js";
import { useRouter } from "next/navigation";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface VenueHeaderProps {
  venue: any;
}

export const VenueHeader = ({ venue }: VenueHeaderProps) => {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Image Slider */}
      <div className="relative h-72 md:h-96 w-full">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          className="h-full w-full"
        >
          {(venue?.images?.length ? venue.images : ["/images/court-1.jpg", "/images/court-2.jpg", "/images/court-3.jpg"]).map((img: string, i: number) => (
            <SwiperSlide key={i}>
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${img})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50"
          >
            <Icon path={mdiChevronLeft} size={0.8} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50"
          >
            <Icon path={mdiShareVariantOutline} size={0.8} />
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 z-10 space-y-4">
          <h1 className="text-2xl font-semibold text-white drop-shadow-lg">{venue?.name}</h1>
        </div>
      </div>

      {/* Info Section */}
      <div className="mx-auto px-8 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/venues">Cơ sở sân</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{venue?.name || "Chi tiết sân"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="yellow">
            <span className="text-nowrap">Đánh giá:</span>
            {Number(venue?.averageRating || 4.5).toFixed(1)}
            <Icon path={mdiStar} size={0.6} className="text-yellow-500" />
          </Badge>
          <Badge variant="green">
            <Icon path={mdiMapMarker} size={0.6} className="text-accent" />
            <span>{venue?.address}</span>
          </Badge>
        </div>
      </div>
    </div>
  );
};
