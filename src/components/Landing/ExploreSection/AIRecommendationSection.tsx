"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiCreation, mdiLoading } from "@mdi/js";

interface AIRecommendationSectionProps {
  onTrigger: () => void;
  isLoading: boolean;
}

export const AIRecommendationSection = ({ onTrigger, isLoading }: AIRecommendationSectionProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 mb-8">
      <section className="bg-[#0a0a0a] border-2 border-neutral-900 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2 border-b border-b-neutral-800 pb-4">
          <Icon path={mdiCreation} size={0.8} />
          Trợ lý ảo AI
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-400 text-base">
            Hãy để chúng tôi giúp bạn tìm ra những sân cầu lông phù hợp nhất với vị trí và sở thích của bạn.
          </p>
          <Button variant="accent" onClick={onTrigger} disabled={isLoading}>
            {isLoading ? (
              <Icon path={mdiLoading} size={0.8} className="animate-spin" />
            ) : (
              <Icon path={mdiCreation} size={0.8} />
            )}
            Nhận đề xuất từ AI
          </Button>
        </div>
      </section>
    </div>
  );
};
