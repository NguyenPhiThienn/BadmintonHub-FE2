"use client";

import { forwardRef, useState, Suspense } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/useAuth";
import { useCreateReview, useReplyReview, useReviews, useToggleLikeReview } from "@/hooks/useReview";
import { mdiClose, mdiReplay, mdiSend, mdiShimmer, mdiStar, mdiThumbUp, mdiThumbUpOutline } from "@mdi/js";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/api/booking";
import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

const RichTextEditor = dynamic(() => import("@/components/ui/rich-text-editor").then(mod => mod.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-[130px] w-full bg-darkBackgroundV1 animate-pulse rounded-xl border border-darkBorderV1" />
});

interface ReviewSectionProps {
  venueId: string;
  venueOwnerId?: any;
}

const ReviewSectionContent = forwardRef<HTMLDivElement, ReviewSectionProps>(({ venueId, venueOwnerId }, ref) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isEditingReview, setIsEditingReview] = useState(false);

  const { data: meRes } = useMe();
  const me = meRes?.data;

  const { data: reviewsRes, isLoading } = useReviews(venueId);
  const { mutate: createReview, isPending: isCreating } = useCreateReview(venueId);
  const { mutate: toggleLike } = useToggleLikeReview(venueId);
  const { mutate: replyReview, isPending: isReplying } = useReplyReview(venueId);

  const reviews = reviewsRes?.data || [];
  
  // Find if user already reviewed
  const myReview = useMemo(() => {
    if (!me) return null;
    return reviews.find((r: any) => 
      (r.playerId?._id === me._id || r.playerId?.id === me.id) ||
      (r.userId === me._id)
    );
  }, [reviews, me]);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
      setIsEditingReview(false);
    } else {
      setIsEditingReview(true);
    }
  }, [myReview]);

  const searchParams = useSearchParams();
  const reviewBookingId = searchParams.get("review_booking_id");

  // Kiểm tra user hiện tại có phải là chủ sân của cơ sở này không
  const getOwnerId = () => {
    if (!venueOwnerId) return null;
    if (typeof venueOwnerId === 'string') return venueOwnerId;
    if (typeof venueOwnerId === 'object') return venueOwnerId._id || venueOwnerId.id;
    return null;
  };

  const ownerIdString = getOwnerId();
  const isOwner = me?.role === "OWNER" && ownerIdString && (
    ownerIdString === me._id ||
    ownerIdString === me.id ||
    (me as any).id === ownerIdString
  );

  const handleSendReview = () => {
    if (!me) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá!");
      return;
    }

    if (!reviewBookingId) {
      toast.error("Vui lòng chọn đơn đặt sân để đánh giá từ trang Quản lý đơn.");
      return;
    }

    createReview(
      { venueId, rating, comment, bookingId: reviewBookingId },
      {
        onSuccess: () => {
        if (!myReview) {
          setComment("");
          setRating(5);
        } else {
          setIsEditingReview(false);
        }
        toast.success(myReview ? "Cập nhật đánh giá thành công!" : "Gửi đánh giá thành công!");
      },
      onError: (err: any) => {
        const errorMsg = err?.response?.data?.message || err?.message || "Lỗi gửi đánh giá. Vui lòng thử lại.";
        toast.error(errorMsg);
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

  const handleSubmitReply = (reviewId: string) => {
    if (!replyText.trim()) return;

    replyReview(
      { reviewId, reply: replyText },
      {
        onSuccess: () => {
          toast.success("Phản hồi thành công!");
          setReplyingTo(null);
          setReplyText("");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Lỗi phản hồi. Vui lòng thử lại.");
        }
      }
    );
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  if (isLoading) {
    return (
      <section ref={ref} className="space-y-4 pb-4">
        <div className="flex-1 flex items-center gap-3 md:gap-4">
          <h3 className="text-accent font-semibold whitespace-nowrap">Đánh giá từ người chơi</h3>
          <div className="flex-1 border-b border-dashed border-accent mr-1" />
        </div>
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Đang tải đánh giá...</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="space-y-4 pb-4">
      <div className="flex-1 flex items-center gap-3 md:gap-4">
        <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-2">
          Đánh giá từ người chơi
          {isOwner && (
            <Badge variant="green" className="text-xs gap-1">
              <Icon path={mdiShimmer} size={0.5} />
              Chế độ chủ sân
            </Badge>
          )}
        </h3>
        <div className="flex-1 border-b border-dashed border-accent mr-1" />
      </div>

      {/* Write Review Section - Chỉ hiện cho người chơi thường */}
      {!isOwner && (
        <div className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4">
          {me ? (
            reviewBookingId ? (
              isEditingReview ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h3 className="text-secondary font-semibold mb-2 flex items-center gap-2">
                        <Icon path={mdiShimmer} size={0.8} />
                        {myReview ? "Cập nhật đánh giá của bạn" : "Viết đánh giá của bạn"}
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
                    <div className="flex items-center gap-2">
                      {myReview && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsEditingReview(false);
                            setRating(myReview.rating);
                            setComment(myReview.comment);
                          }}
                        >
                          Hủy
                        </Button>
                      )}
                      <Button
                        variant="accent"
                        disabled={!comment.trim() || isCreating}
                        onClick={handleSendReview}
                      >
                        <Icon path={mdiSend} size={0.8} />
                        {isCreating ? "Đang xử lý..." : myReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
                      </Button>
                    </div>
                  </div>
                  <RichTextEditor
                    value={comment}
                    onChange={setComment}
                    placeholder="Chia sẻ trải nghiệm của bạn"
                  />
                </>
              ) : (
                <div className="py-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <Icon path={mdiStar} size={1.2} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Bạn đã đánh giá cơ sở này</h4>
                      <p className="text-neutral-400 text-sm">Cảm ơn bạn đã để lại đánh giá {myReview.rating} sao!</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setIsEditingReview(true)} className="border-accent text-accent hover:bg-accent/10 w-full sm:w-auto">
                    <Icon path={mdiStar} size={0.8} className="mr-2" />
                    Cập nhật đánh giá
                  </Button>
                </div>
              )
            ) : (
              <div className="py-6 flex flex-col items-center text-center space-y-2">
                {myReview ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <Icon path={mdiStar} size={1.2} className="text-accent" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-white font-semibold">Bạn đã đánh giá cơ sở này</h4>
                        <p className="text-neutral-400 text-sm">Cảm ơn bạn đã để lại đánh giá {myReview.rating} sao!</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Icon path={mdiShimmer} size={1.5} className="text-neutral-500 opacity-50" />
                    <p className="text-neutral-400">Bạn có thể đánh giá sau khi hoàn thành đơn đặt sân (qua trang Quản lý đơn).</p>
                  </>
                )}
              </div>
            )
          ) : (
            <div className="py-6 text-center space-y-2">
              <p className="text-neutral-400">Bạn cần đăng nhập để gửi đánh giá cho cơ sở này.</p>
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
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

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {/* Reply button - chỉ hiện cho chủ sân (chưa reply) */}
                    {isOwner && !review.reply && (
                      <button
                        onClick={() => setReplyingTo(review._id)}
                        className="hover:scale-105 transition-transform"
                      >
                        <Badge variant="orange" className="cursor-pointer gap-1 select-none">
                          <Icon path={mdiReplay} size={0.6} />
                          Reply
                        </Badge>
                      </button>
                    )}

                    {/* Like button - hiện cho tất cả mọi người */}
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
                </div>

                <div
                  className="text-neutral-300 text-base leading-relaxed prose prose-invert max-w-full"
                  dangerouslySetInnerHTML={{ __html: review.comment }}
                />

                {/* Owner Reply Form */}
                {isOwner && replyingTo === review._id && (
                  <div className="bg-darkBackgroundV1 border border-darkBorderV1 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                      <Icon path={mdiReplay} size={0.6} />
                      Viết phản hồi cho đánh giá này
                    </div>
                    <Input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Nhập phản hồi của bạn..."
                      className="bg-darkCardV1 border-darkBorderV1"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="accent"
                        size="sm"
                        disabled={!replyText.trim() || isReplying}
                        onClick={() => handleSubmitReply(review._id)}
                      >
                        <Icon path={mdiSend} size={0.6} />
                        {isReplying ? "Đang gửi..." : "Gửi phản hồi"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelReply}
                      >
                        <Icon path={mdiClose} size={0.6} />
                        Hủy
                      </Button>
                    </div>
                  </div>
                )}

                {/* Owner Reply Display */}
                {isOwner && review.reply && (
                  <div className="bg-primary/5 border-l-2 border-primary p-4 rounded-r-xl space-y-3">
                    <div className="flex items-center gap-2 text-accent font-semibold text-xs">
                      <Icon path={mdiReplay} size={0.6} />
                      Phản hồi của bạn
                      {review.repliedAt && (
                        <span className="text-neutral-500 font-normal">
                          • {format(parseISO(review.repliedAt), "dd/MM/yyyy HH:mm")}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-neutral-300 text-base leading-relaxed prose prose-invert max-w-full pl-5"
                      dangerouslySetInnerHTML={{ __html: review.reply }}
                    />
                  </div>
                )}

                {/* Non-owner reply display */}
                {!isOwner && review.reply && (
                  <div className="bg-primary/5 border-l-2 border-primary p-4 rounded-r-xl space-y-3">
                    <div className="flex items-center gap-2 text-accent font-semibold text-xs">
                      <Icon path={mdiReplay} size={0.6} />
                      Phản hồi từ chủ sân
                    </div>
                    <div
                      className="text-neutral-300 text-base leading-relaxed prose prose-invert max-w-full"
                      dangerouslySetInnerHTML={{ __html: review.reply }}
                    />
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
});

ReviewSectionContent.displayName = "ReviewSection";

export const ReviewSection = forwardRef<HTMLDivElement, ReviewSectionProps>((props, ref) => {
  return (
    <Suspense fallback={
      <div className="space-y-4 p-4">
        <div className="flex gap-3">
          <Skeleton className="h-12 w-12 rounded-full bg-darkBackgroundV1" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/2 bg-darkBackgroundV1" />
            <Skeleton className="h-3 w-1/3 bg-darkBackgroundV1" />
          </div>
        </div>
        <Skeleton className="h-24 w-full bg-darkBackgroundV1 rounded-xl" />
      </div>
    }>
      <ReviewSectionContent {...props} ref={ref} />
    </Suspense>
  );
});
