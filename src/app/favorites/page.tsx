"use client";

import { Header } from "@/components/Landing/Header";
import { Footer } from "@/components/Landing/Footer";
import { VenueCard } from "@/components/Venues/VenueListExplorer/VenueCard";
import { useFavoriteVenues } from "@/hooks/useUsers";
import { useUser } from "@/context/useUserContext";
import { IVenue } from "@/types/venue";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiHeartOutline, mdiMagnify } from "@mdi/js";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FavoritesPage() {
  const { user } = useUser();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          setUserLocation({ lat: 10.762622, lng: 106.660172 });
        }
      );
    }
  }, []);

  const { data: favData, isLoading } = useFavoriteVenues({}, { enabled: !!user });
  const venues = favData?.data?.venues || [];

  return (
    <div className="min-h-screen bg-darkBackgroundV1 flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-8 border-b border-darkBorderV1 pb-4">
          <Icon path={mdiHeartOutline} size={1.5} className="text-red-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-white">Sân yêu thích của bạn</h1>
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center py-20 bg-darkCardV1 border border-darkBorderV1 rounded-2xl">
            <Icon path={mdiHeartOutline} size={3} className="text-neutral-500 mb-4 opacity-50" />
            <p className="text-neutral-300 text-lg mb-4">Vui lòng đăng nhập để xem sân yêu thích</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-3 p-3 bg-darkCardV1 border-2 border-darkBorderV1 rounded-2xl animate-pulse">
                <Skeleton className="w-full h-40 rounded-xl bg-darkBackgroundV2" />
                <Skeleton className="h-6 w-3/4 rounded bg-darkBackgroundV2 mt-2" />
                <Skeleton className="h-4 w-1/2 rounded bg-darkBackgroundV2" />
                <Skeleton className="h-10 w-full rounded-lg bg-darkBackgroundV2 mt-2" />
              </div>
            ))}
          </div>
        ) : venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-darkCardV1 border border-darkBorderV1 rounded-2xl">
            <Icon path={mdiMagnify} size={3} className="text-neutral-500 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">Chưa có sân nào</h3>
            <p className="text-neutral-400 text-center max-w-md mb-6">
              Bạn chưa thêm sân cầu lông nào vào danh sách yêu thích. Hãy khám phá và lưu lại những sân bạn ưng ý nhất nhé!
            </p>
            <Link href="/venues">
              <Button variant="accent" size="lg">
                Khám phá ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue: IVenue) => (
              <VenueCard 
                key={venue._id} 
                venue={venue} 
                userLocation={userLocation || undefined} 
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
