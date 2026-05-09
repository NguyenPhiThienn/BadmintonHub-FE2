"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/mdi-icon";
import { useUser } from "@/context/useUserContext";
import { useAiRecommendations } from "@/hooks/useVenue";
import { IAIRecommendationResponse, IVenue } from "@/interface/venue";
import { mdiClose, mdiCreation, mdiLoading, mdiPlaylistRemove, mdiStar } from "@mdi/js";
import { useState } from "react";
import { VenueCard } from "./VenueCard";

interface AIRecommendationSectionProps {
  allVenues: IVenue[];
}

export const AIRecommendationSection = ({ allVenues }: AIRecommendationSectionProps) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [recommendedVenues, setRecommendedVenues] = useState<IVenue[]>([]);
  const aiMutation = useAiRecommendations();

  const handleGetRecommendations = () => {
    if (!user?.id) return;
    
    setIsOpen(true);
    const lat = 10.762622;
    const lng = 106.660172;

    aiMutation.mutate(
      {
        userId: user.id as string,
        preferences: {},
        lat,
        lng
      },
      {
        onSuccess: (res: IAIRecommendationResponse) => {
          if (res.data && res.data.length > 0) {
            const recommended = res.data.map(rec => {
              const venue = allVenues.find((v: IVenue) => v._id === rec.venueId);
              if (venue) {
                return {
                  ...venue,
                  matchScore: rec.matchScore,
                  reason: rec.reason,
                  detailedAnalysis: rec.detailedAnalysis
                };
              }
              return null;
            }).filter(Boolean) as IVenue[];

            setRecommendedVenues(recommended);
          }
        },
      }
    );
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 mb-8">
      <section className="bg-[#0a0a0a] border-2 border-neutral-900 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2 border-b border-b-neutral-800 pb-4">
          <Icon path={mdiCreation} size={0.8} />
          Gợi ý sân từ AI
        </h3>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-300 text-sm">
            Để AI của chúng tôi giúp bạn tìm ra những sân cầu lông phù hợp nhất với vị trí và sở thích của bạn.
          </p>
          <Button variant="accent" onClick={handleGetRecommendations} disabled={aiMutation.isPending}>
            {aiMutation.isPending ? (
              <Icon path={mdiLoading} size={0.8} className="animate-spin" />
            ) : (
              <Icon path={mdiCreation} size={0.8} />
            )}
            Nhận đề xuất từ AI
          </Button>
        </div>
      </section>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent size="medium">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-secondary">
              <Icon path={mdiCreation} size={0.8} />
              <span>Sân đấu gợi ý dành riêng cho bạn</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
            <div className="flex items-center gap-3 md:gap-4">
              <h3 className="text-secondary font-semibold whitespace-nowrap">Kết quả phân tích</h3>
              <div className="flex-1 border-b border-dashed border-accent mr-1" />
            </div>

            {aiMutation.isPending ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Icon path={mdiLoading} size={1} className="text-accent animate-spin" />
                <p className="text-neutral-400 italic text-sm">AI đang phân tích dữ liệu sân...</p>
              </div>
            ) : recommendedVenues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedVenues.map((venue, idx) => (
                  <VenueCard key={venue._id} venue={venue} isAI index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                Không tìm thấy gợi ý phù hợp.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={aiMutation.isPending}>
              <Icon path={mdiClose} size={0.8} />
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
