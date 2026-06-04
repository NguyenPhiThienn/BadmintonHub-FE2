"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiLoading, mdiShimmer } from "@mdi/js";

interface AIRecommendationSectionProps {
  onTrigger: () => void;
  isLoading: boolean;
}

export const AIRecommendationSection = ({ onTrigger, isLoading }: AIRecommendationSectionProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 mb-4">
      <section
        className="relative border border-neutral-800 rounded-2xl p-6 py-8 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/ai-suggestion.png')" }}
      >
        {/* Overlay gradient for premium look and readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <p className="text-neutral-300 text-xl font-bold leading-tight">
                Tìm kiếm sân chơi lý tưởng từ trợ lý AI của chúng tôi
              </p>
              <p className="text-neutral-400 text-base">
                Hãy để chúng tôi giúp bạn tìm ra những sân cầu lông phù hợp nhất với vị trí và sở thích của bạn một cách nhanh chóng và chính xác nhất.
              </p>
              <Button
                variant="accent"
                onClick={onTrigger}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                ) : (
                  <Icon path={mdiShimmer} size={0.8} />
                )}
                Nhận đề xuất ngay
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
