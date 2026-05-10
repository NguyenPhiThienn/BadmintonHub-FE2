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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/mdi-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenues } from "@/hooks/useVenue";
import { IVenue } from "@/interface/venue";
import { mdiBadminton, mdiChevronLeft, mdiCrosshairsGps, mdiFire, mdiMagnify, mdiMapMarkerRadius, mdiRefresh, mdiTagOutline } from "@mdi/js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import VenueListExplorer from "../VenueListExplorer";
import { VenueCard } from "../VenueListExplorer/VenueCard";

const VenueCardSkeleton = () => (
  <div className="flex flex-col gap-3 p-3 bg-darkCardV1 border-2 border-darkBorderV1 rounded-2xl animate-pulse">
    <div className="flex gap-3">
      <Skeleton className="w-28 h-28 shrink-0 rounded-xl bg-darkBackgroundV2" />
      <div className="flex flex-col gap-2 w-full">
        <Skeleton className="h-5 w-3/4 rounded bg-darkBackgroundV2" />
        <Skeleton className="h-4 w-1/2 rounded bg-darkBackgroundV2" />
        <Skeleton className="h-6 w-1/3 rounded bg-darkBackgroundV2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full bg-darkBackgroundV2" />
          <Skeleton className="h-6 w-16 rounded-full bg-darkBackgroundV2" />
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-2 border-t border-darkBorderV1 pt-3">
      <Skeleton className="h-4 w-full rounded bg-darkBackgroundV2" />
      <Skeleton className="h-4 w-5/6 rounded bg-darkBackgroundV2" />
      <Skeleton className="h-10 w-full rounded-lg bg-darkBackgroundV2 mt-2" />
    </div>
  </div>
);

const MapExplorer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [map, setMap] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState({ lat: 10.762622, lng: 106.660172 }); // Default: Ho Chi Minh City
  const [zoom, setZoom] = useState(14);
  const [search, setSearch] = useState(searchParams?.get("search") || "");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string | null>(searchParams?.get("sortBy") || null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  const { data: venuesData, isLoading } = useVenues({
    search: search,
    limit: limit,
    sortBy: sortBy || undefined,
    lat: userLocation?.lat,
    lng: userLocation?.lng,
  });

  const venues = venuesData?.data?.venues || [];
  const pagination = venuesData?.data?.pagination;
  const hasMore = pagination ? venues.length < pagination.total : false;
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [search, router, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (sortBy) {
      params.set("sortBy", sortBy);
    } else {
      params.delete("sortBy");
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [sortBy, router, searchParams]);

  useEffect(() => {
    setLimit(10);
  }, [search, sortBy]);

  const [isGoogleReady, setIsGoogleReady] = useState(false);

  // Check for Google Maps availability
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).google) {
        setIsGoogleReady(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (isGoogleReady && mapRef.current && !map) {
      const gMap = new (window as any).google.maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: true,
        clickableIcons: false,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#191919" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#ea8a39" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#ea8a39" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#303030" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212121" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
        ]
      });

      gMap.addListener("idle", () => {
        const newCenter = gMap.getCenter();
        if (newCenter) {
          setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
        }
      });

      setMap(gMap);
    }
  }, [isGoogleReady, map]);

  // Handle Marker Clicks
  const handleMarkerClick = (venueId: string) => {
    setSelectedVenueId(venueId);
    router.push(`/venues/${venueId}`);
  };

  const handleBookConfirm = () => {
    setIsBooking(true);
    // Simulate booking process
    setTimeout(() => {
      setIsBooking(false);
      setIsConfirmOpen(false);

      const selectedVenue = venues.find((v: IVenue) => v._id === selectedVenueId);
      if (selectedVenue) {
        const queryParams = new URLSearchParams({
          venueId: selectedVenue._id,
          venueName: selectedVenue.name,
          price: (selectedVenue.pricePerHour || 120000).toString(),
        }).toString();

        router.push(`/booking?${queryParams}`);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!map || !venues || !(window as any).google) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    venues.forEach((venue: IVenue) => {
      const vLat = venue.coordinates?.coordinates[1];
      const vLng = venue.coordinates?.coordinates[0];

      if (vLat && vLng) {
        const marker = new (window as any).google.maps.OverlayView();

        marker.onAdd = function () {
          const div = document.createElement('div');
          div.style.position = 'absolute';
          div.className = 'custom-marker-wrapper';
          div.innerHTML = `
            <div class="custom-price-marker" style="display: flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white" style="flex-shrink: 0;">
                <path d="${mdiBadminton}"></path>
              </svg>
              <span class="price-val">${venue.name}</span>
              <div class="marker-pin"></div>
            </div>
          `;

          div.onclick = (e) => {
            e.stopPropagation();
            handleMarkerClick(venue._id);
          };

          const panes = this.getPanes();
          panes?.overlayMouseTarget.appendChild(div);
          (this as any).div = div;
        };

        marker.draw = function () {
          const projection = this.getProjection();
          if (!projection) return;
          const pos = new (window as any).google.maps.LatLng(vLat, vLng);
          const position = projection.fromLatLngToDivPixel(pos);

          if (position && (this as any).div) {
            (this as any).div.style.left = position.x + 'px';
            (this as any).div.style.top = position.y + 'px';
          }
        };

        marker.onRemove = function () {
          if ((this as any).div) {
            (this as any).div.parentNode.removeChild((this as any).div);
            (this as any).div = null;
          }
        };

        marker.setMap(map);
        markersRef.current.push(marker);
      }
    });
  }, [map, venues]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map?.setCenter(pos);
        map?.setZoom(15);
        setCenter(pos);
      });
    }
  };

  const handleLoadMore = () => {
    setLimit(prev => prev + 10);
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortBy(null);
      return;
    }

    if (newSortBy === 'nearest') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setSortBy(newSortBy);
          },
          (error) => {
            console.error("Error getting location:", error);
            alert("Vui lòng cho phép truy cập vị trí để sử dụng tính năng này.");
          }
        );
      } else {
        alert("Trình duyệt của bạn không hỗ trợ định vị.");
      }
    } else {
      setSortBy(newSortBy);
    }
  };

  const filterButtons = [
    { id: 'nearest', label: 'Gần nhất', icon: mdiMapMarkerRadius },
    { id: 'price_asc', label: 'Giá rẻ nhất', icon: mdiTagOutline },
    { id: 'rating_desc', label: 'Đánh giá cao', icon: mdiFire },
  ];

  return (
    <div className="flex h-screen w-full bg-darkBackgroundV1 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-[400px] border-r border-darkBorderV1 bg-darkBackgroundV1 z-20">
        <div className="p-4 border-b border-darkBorderV1 bg-darkBackgroundV2/30">
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Khám phá & Bản đồ</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="relative w-full">
            <Input
              placeholder="Tìm tên sân, khu vực..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              className="pl-9 py-2 w-full"
            />
            <Icon
              path={mdiMagnify}
              size={0.8}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
            />
          </div>

          <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
            {filterButtons.map((btn) => (
              <Button
                size="sm"
                variant={sortBy === btn.id ? "default" : "outline"}
                key={btn.id}
                onClick={() => handleSortChange(btn.id)}
                className="rounded-full"
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-400 text-base font-medium">Tìm thấy {venues.length} sân</span>
          </div>

          <div className="flex flex-col gap-4">
            {isLoading && limit === 10 ? (
              Array.from({ length: 5 }).map((_, i) => <VenueCardSkeleton key={i} />)
            ) : (
              <>
                {venues.map((venue: IVenue, index: number) => (
                  <div
                    key={venue._id}
                    id={`venue-card-desktop-${venue._id}`}
                    onClick={() => {
                      setSelectedVenueId(venue._id);
                      const vLat = venue.coordinates?.coordinates[1];
                      const vLng = venue.coordinates?.coordinates[0];
                      if (vLat && vLng) {
                        map?.panTo({ lat: vLat, lng: vLng });
                        map?.setZoom(16);
                      }
                    }}
                    className={`transition-all duration-300 cursor-pointer ${selectedVenueId === venue._id ? "ring-2 ring-accent ring-inset rounded-2xl" : ""
                      }`}
                  >
                    <VenueCard venue={venue} />
                  </div>
                ))}
                {isLoading && limit > 10 && (
                  Array.from({ length: 3 }).map((_, i) => <VenueCardSkeleton key={`more-${i}`} />)
                )}
              </>
            )}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center pb-4">
              <Button
                variant="outline"
                onClick={() => setLimit(prev => prev + 10)}
                disabled={isLoading}
                className="w-full bg-darkCardV2 border-darkBorderV1 text-neutral-300 hover:text-white hover:bg-accent/20 disabled:opacity-50"
              >
                {isLoading ? "Đang tải..." : "Hiển thị thêm"}
              </Button>
            </div>
          )}

          {venues.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 text-center">
              <Icon path={mdiMagnify} size={1.5} className="mb-2 opacity-20" />
              <p>Không thấy sân nào ở khu vực này</p>
              <p className="text-sm">Hãy thử thu nhỏ hoặc di chuyển bản đồ</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="relative flex-1 h-full">
        {!isGoogleReady && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-darkBackgroundV1">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-neutral-400 animate-pulse">Đang tải bản đồ...</p>
          </div>
        )}

        {isGoogleReady && !map && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-darkBackgroundV1">
            <div className="mt-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <Icon path={mdiRefresh} size={0.8} />
                Thử lại
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="absolute top-4 left-4 right-4 z-10 flex md:hidden items-center gap-2">
          <div className="bg-darkCardV1/80 backdrop-blur-md border border-darkBorderV1 rounded-full p-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <Icon path={mdiChevronLeft} size={0.8} />
            </Button>
          </div>

          <div className="relative flex-1">
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              className="pl-9 py-2 w-full"
            />
            <Icon
              path={mdiMagnify}
              size={0.8}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
            />
          </div>
        </div>

        {/* Mobile Filter Chips */}
        <div className="absolute top-20 left-4 right-4 z-10 flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleSortChange(btn.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap backdrop-blur-md shadow-lg transition-all ${sortBy === btn.id
                ? "bg-accent border-accent text-white"
                : "bg-darkCardV1/80 border-darkBorderV1 text-neutral-200 hover:bg-darkCardV1"
                }`}
            >
              <Icon path={btn.icon} size={0.6} />
              {btn.label}
            </button>
          ))}
        </div>

        {/* Map */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Floating Actions */}
        <div className="absolute bottom-10 right-4 z-10 flex flex-col gap-2">
          <div className="bg-darkCardV1/80 backdrop-blur-md border border-darkBorderV1 rounded-full p-1 shadow-lg">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleGetCurrentLocation}
            >
              <Icon path={mdiCrosshairsGps} size={0.8} className="text-accent" />
            </Button>
          </div>
        </div>

        {/* Mobile Bottom Sheet (Hidden on Desktop) */}
        <div className="md:hidden">
          <VenueListExplorer
            venues={venues}
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            selectedVenueId={selectedVenueId}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onVenueClick={(id: string) => {
              setSelectedVenueId(id);
              const v = venues.find((v: IVenue) => v._id === id);
              const vLat = v?.coordinates?.coordinates[1];
              const vLng = v?.coordinates?.coordinates[0];
              if (vLat && vLng) {
                map?.panTo({ lat: vLat, lng: vLng });
                map?.setZoom(16);
              }
            }}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleBookConfirm}
        title="Xác nhận đặt sân"
        description={`Bạn có chắc chắn muốn đặt sân "${venues.find((v: IVenue) => v._id === selectedVenueId)?.name}" không?`}
        confirmText="Đặt sân ngay"
        cancelText="Để sau"
        isPending={isBooking}
      />

      <style jsx global>{`
        .custom-marker-wrapper {
          z-index: 10;
        }
        .custom-price-marker {
          position: relative;
          background: #ff7e33; /* accent color fallback */
          background: hsl(var(--accent));
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          transform: translate(-50%, -100%);
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 2px solid white;
        }
        .custom-price-marker {
          transform: translate(-50%, -110%) scale(1.1);
          z-index: 50;
          background: #ff9152;
        }
        .marker-pin {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid white;
        }
        .gm-style-cc, .gm-svpc, .gm-style-mtc, .gm-fullscreen-control, .gm-style-at {
          display: none !important;
        }
        .gmnoprint {
            display: none !important;
        }
      `}</style>
    </div>
  );
};

export default MapExplorer;
