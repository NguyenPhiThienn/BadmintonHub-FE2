"use client";

import React, { useRef, useEffect } from "react";
import { Drawer } from "vaul";
import { IVenue } from "@/interface/venue";
import { VenueCard } from "./VenueCard";

interface VenueListExplorerProps {
  venues: IVenue[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVenueId: string | null;
  onVenueClick: (id: string) => void;
}

const VenueListExplorer = ({
  venues,
  isOpen,
  onOpenChange,
  selectedVenueId,
  onVenueClick
}: VenueListExplorerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync scroll when selectedVenueId changes
  useEffect(() => {
    if (selectedVenueId && scrollRef.current) {
      const element = document.getElementById(`venue-card-${selectedVenueId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedVenueId]);

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      fadeFromIndex={0}
      dismissible={true}
      snapPoints={["320px", "70%", 1]}
      activeSnapPoint={"320px"}
    >
      <Drawer.Trigger asChild>
        <div className="absolute bottom-4 left-0 right-0 px-4 z-10">
          <div className="bg-darkCardV1/90 backdrop-blur-xl border border-darkBorderV1 rounded-2xl p-4 shadow-2xl cursor-pointer hover:bg-darkCardV1 transition-colors">
            <div className="w-12 h-1.5 bg-neutral-600 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-semibold text-lg">Khám phá các sân gần đây</h4>
                <p className="text-neutral-400 text-sm">{venues.length} sân trong khu vực này</p>
              </div>
              <div className="flex -space-x-2">
                {venues.slice(0, 3).map((v, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-darkCardV1 bg-accent overflow-hidden">
                    <img src={"/images/court-1.jpg"} alt={v.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-darkBackgroundV1 border-t border-darkBorderV1 flex flex-col rounded-t-[32px] h-[90vh] fixed bottom-0 left-0 right-0 z-[60]">
          <div className="p-4 bg-darkBackgroundV1 rounded-t-[32px] flex-1 overflow-hidden flex flex-col">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-neutral-700 mb-6" />

            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-semibold text-white">Danh sách sân cầu lông</h3>
              <span className="text-accent text-sm font-semibold">{venues.length} kết quả</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-10">
              <div className="flex flex-col gap-3">
                {venues.map((venue, index) => (
                  <div
                    key={venue._id}
                    id={`venue-card-${venue._id}`}
                    onClick={() => onVenueClick(venue._id)}
                    className={`transition-all duration-300 ${selectedVenueId === venue._id ? "ring-2 ring-accent ring-inset rounded-2xl" : ""}`}
                  >
                    <VenueCard venue={venue} />
                  </div>
                ))}
              </div>

              {venues.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                  <p>Không thấy sân nào ở khu vực này</p>
                  <p className="text-sm">Thử di chuyển bản đồ đến vùng khác</p>
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default VenueListExplorer;
