"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { useMe } from "@/hooks/useAuth";
import { useCreateReview, useReviews, useToggleLikeReview } from "@/hooks/useReview";
import { mdiReply, mdiSend, mdiShimmer, mdiStar, mdiThumbUp, mdiThumbUpOutline } from "@mdi/js";
import { format, parseISO } from "date-fns";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "react-toastify";

const RichTextEditor = dynamic(() => import("@/components/ui/rich-text-editor").then(mod => mod.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-[130px] w-full bg-darkBackgroundV1 animate-pulse rounded-xl border border-darkBorderV1" />
});

interface ReviewSectionProps {
  venueId: string;
}

export const ReviewSection = ({ venueId }: ReviewSectionProps) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const { data: meRes } = useMe();
  const me = meRes?.data;

  const { data: reviewsRes, isLoading } = useReviews(venueId);
  const { mutate: createReview, isPending: isCreating } = useCreateReview(venueId);
  const { mutate: toggleLike } = useToggleLikeReview(venueId);

  const reviews = reviewsRes?.data || [];

  const handleSendReview = () => {
    if (!me) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá!");
      return;
    }
    if (!comment.trim()) return;

    createReview({
      venueId,
      rating,
      comment
    }, {
      onSuccess: () => {
        setComment("");
        setRating(5);
        toast.success("Gửi đánh giá thành công!");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Lỗi gửi đánh giá. Vui lòng thử lại.");
      }
    });
  };

  const handleLike = (reviewId: string) => {
    if (!me) {
      toast.error("Vui lòng đăng nhập để thích đánh giá!");
      return;
    }
    toggleLike(reviewId);
  };

  if (isLoading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Đang tải đánh giá...</p>
      </div>
    );
  }

  return (
    <section className="space-y-4 pb-4">
      <div className="flex-1 flex items-center gap-3 md:gap-4">
        <h3 className="text-accent font-semibold whitespace-nowrap">Đánh giá từ người chơi</h3>
        <div className="flex-1 border-b border-dashed border-accent mr-1" />
      </div>

      {/* Write Review Section */}
      <div className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4">
        {me ? (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-secondary font-semibold mb-2 flex items-center gap-2">
                  <Icon path={mdiShimmer} size={0.8} />
                  Viết đánh giá của bạn
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-neutral-300 text-sm font-semibold">Chất lượng sân:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        className="transition-transform hover:scale-110"
                      >
                        <Icon
                          path={mdiStar}
                          size={1}
                          className={s <= rating ? "text-yellow-500" : "text-neutral-600"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                variant="accent"
                disabled={!comment.trim() || isCreating}
                onClick={handleSendReview}
              >
                <Icon path={mdiSend} size={0.8} />
                {isCreating ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
            <RichTextEditor
              value={comment}
              onChange={setComment}
              placeholder="Chia sẻ trải nghiệm của bạn"
            />
          </>
        ) : (
          <div className="py-6 text-center space-y-2">
            <p className="text-neutral-400">Bạn cần đăng nhập để gửi đánh giá cho cơ sở này.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {reviews.length > 0 ? (
          reviews.map((review: any) => {
            const name = review.playerId?.fullName || "Người chơi";
            const avatar = review.playerId?.avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${name}`;
            const isLiked = me ? review.likes?.includes(me._id) : false;
            const likesCount = review.likes?.length || 0;
            const dateFormatted = review.createdAt ? format(parseISO(review.createdAt), 'dd/MM/yyyy') : "Gần đây";

            return (
              <div key={review._id} className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border border-primary">
                      <AvatarImage src={avatar} />
                    </Avatar>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Icon
                              key={i}
                              path={mdiStar}
                              size={0.6}
                              className={i < review.rating ? "text-yellow-500" : "text-neutral-600"}
                            />
                          ))}
                        </div>
                        <span className="text-neutral-400 text-sm">({dateFormatted})</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLike(review._id)}
                    className="hover:scale-105 transition-transform"
                  >
                    <Badge variant={isLiked ? "green" : "ghost"} className="cursor-pointer gap-1 select-none">
                      <Icon path={isLiked ? mdiThumbUp : mdiThumbUpOutline} size={0.6} />
                      {likesCount}
                    </Badge>
                  </button>
                </div>

                <div
                  className="text-neutral-300 text-base leading-relaxed prose prose-invert max-w-full"
                  dangerouslySetInnerHTML={{ __html: review.comment }}
                />

                {review.reply && (
                  <div className="bg-primary/5 border-l-2 border-primary p-4 rounded-r-xl space-y-4">
                    <div className="flex items-center gap-2 text-pneutral-500 font-bold text-sm">
                      <Icon path={mdiReply} size={0.8} />
                      Phản hồi từ chủ sân
                    </div>
                    <p className="text-neutral-400 text-base italic">
                      {review.reply}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-neutral-400 border border-dashed border-darkBorderV1 rounded-2xl bg-darkCardV1/50">
            <Icon path={mdiShimmer} size={2} className="text-gray-500" />
            <p className="text-sm font-medium">Chưa có đánh giá nào cho sân này. Hãy là người đầu tiên!</p>
          </div>
        )}
      </div>
    </section>
  );
};
