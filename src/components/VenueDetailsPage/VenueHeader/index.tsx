"use client";

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
import { useUser } from "@/context/useUserContext";
import { useFavoriteVenues, useToggleFavorite } from "@/hooks/useUsers";
import { mdiAccountTie, mdiCalendarMonthOutline, mdiChevronLeft, mdiHeart, mdiHeartOutline, mdiHomeOutline, mdiLogout, mdiShareVariantOutline } from "@mdi/js";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { NotificationBell } from "@/components/Common/NotificationBell";
import { useMe } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface VenueHeaderProps {
  venue: any;
}

export const VenueHeader = ({ venue }: VenueHeaderProps) => {
  const router = useRouter();
  const { user, logoutUser } = useUser();
  const { data: favData } = useFavoriteVenues({}, { enabled: !!user });
  const { mutate: toggleFav } = useToggleFavorite();
  const { data: profileResponse } = useMe();
  const profile = profileResponse?.data;

  const isFavorite = favData?.data?.venues?.some((v: any) => v._id === venue?._id);

  const handleToggleFavorite = () => {
    if (!user) {
      toast.warn("Vui lòng đăng nhập để thêm sân yêu thích");
      return;
    }
    toggleFav(venue._id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 xl:px-0 pt-1">
      <style>{`
        .venue-slider .swiper-pagination-bullet {
          width: 24px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.4);
          transition: all 0.3s ease;
          opacity: 1;
          margin: 0 4px !important;
        }
        .venue-slider .swiper-pagination-bullet-active {
          background: #fff;
          width: 40px;
        }
        .venue-slider .swiper-pagination {
          bottom: 24px !important;
        }
      `}</style>

      {/* Image Slider */}
      <div className="relative h-[300px] md:h-[420px] w-full rounded-[2rem] overflow-hidden shadow-2xl">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          className="h-full w-full venue-slider"
        >
          {(venue?.images?.length ? venue.images : [{ imageUrl: "/images/court-1.jpg" }, { imageUrl: "/images/court-2.jpg" }, { imageUrl: "/images/court-3.jpg" }]).map((img: any, i: number) => (
            <SwiperSlide key={i}>
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${img.imageUrl || img})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 w-11 h-11 border border-white/10"
          >
            <Icon path={mdiChevronLeft} size={1} className="text-white" />
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className="rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 w-11 h-11 border border-white/10"
            >
              <Icon
                path={isFavorite ? mdiHeart : mdiHeartOutline}
                size={0.9}
                className={isFavorite ? "text-red-500" : "text-white"}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 w-11 h-11 border border-white/10"
            >
              <Icon path={mdiShareVariantOutline} size={0.9} className="text-white" />
            </Button>
            
            {/* User Pill with Avatar and Notifications */}
            {profile && (
              <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1 pl-1.5 pr-1 gap-1.5 ml-2 shadow-lg">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95 border border-white/5">
                      <img
                        src={profile?.role === "OWNER" ? profile?.avatarUrl : (profile?.employee?.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${profile?.username || "Sophie"}`)}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="flex flex-col !p-0 !py-1">
                      <div className="flex gap-2 px-2 items-center">
                        <Icon path={mdiAccountTie} size={0.8} className="flex-shrink-0" />
                        <span className="text-sm font-semibold capitalize">{profile?.fullName || profile?.employeeName || profile?.username || "Khách"}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/" className="cursor-pointer flex items-center gap-2">
                        <Icon path={mdiHomeOutline} size={0.8} className="flex-shrink-0" />
                        <span>Trang chủ</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-bookings" className="cursor-pointer flex items-center gap-2">
                        <Icon path={mdiCalendarMonthOutline} size={0.8} className="flex-shrink-0" />
                        <span>Lịch sử đặt sân</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logoutUser}
                      className="hover:!bg-red-500/10 hover:!text-red-400 text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                    >
                      <Icon path={mdiLogout} size={0.8} className="flex-shrink-0" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="scale-[0.95] origin-right">
                  <NotificationBell />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-10 left-8 md:left-10 z-10 space-y-4 pr-8">
          <h1 className="text-3xl md:text-[44px] font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] tracking-tight leading-tight">
            {venue?.name}
          </h1>
        </div>
      </div>

      {/* Info Section */}
      <div className="px-2 flex items-center justify-between">
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

      </div>
    </div>
  );
};
