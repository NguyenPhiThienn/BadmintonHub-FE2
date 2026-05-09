"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/mdi-icon";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { mdiCreation, mdiReply, mdiSend, mdiStar, mdiThumbUpOutline } from "@mdi/js";
import { useMemo, useState } from "react";
const MOCK_NAMES = [
  "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Minh Đức", "Hoàng Anh Tuấn",
  "Đặng Quang Huy", "Bùi Thị Mai", "Vũ Minh Hải", "Ngô Thanh Tâm", "Lý Gia Thành",
  "Trịnh Công Sơn", "Mai Thu Huyền", "Đỗ Hùng Dũng", "Nguyễn Quang Hải", "Đoàn Văn Hậu"
];

const MOCK_COMMENTS = [
  "Sân rất đẹp, ánh sáng tốt, thảm tiêu chuẩn chơi cực sướng. Độ nảy của cầu rất ổn định.",
  "Thảm hơi trơn một chút ở các góc, nhưng tổng thể dịch vụ rất ok, chủ sân nhiệt tình hỗ trợ.",
  "Vị trí hơi khó tìm nhưng sân chất lượng bù lại, giá cả hợp lý so với khu vực Gò Vấp.",
  "Đèn hơi chói mắt khi nhìn lên cao cứu cầu, mong sân điều chỉnh lại góc chiếu hoặc thêm lưới che.",
  "Sân rộng rãi, trần cao thoáng mát, có quạt công nghiệp nên không bị bí bách khi đánh đông người.",
  "Dịch vụ gửi xe miễn phí và an toàn. Căn tin có bán nhiều loại nước giải khát giá sinh viên.",
  "Khung giờ vàng (18h-20h) thường xuyên hết sân, mọi người nên đặt trước ít nhất 4-5 ngày.",
  "Sân mới được bảo trì, lưới căng đều, vạch kẻ rõ ràng, không gian chuyên nghiệp.",
  "Phòng thay đồ và nhà vệ sinh rất sạch sẽ, có cả phòng tắm cho anh em ở xa tới.",
  "Giá thuê sân vào cuối tuần hơi cao, nhưng chất lượng mặt thảm Yonex thì hoàn toàn xứng đáng.",
  "Chủ sân vui tính, hay tổ chức các giải phong trào cho anh em giao lưu học hỏi.",
  "Sân có cho thuê vợt và giày chất lượng khá tốt cho những ai quên mang đồ.",
  "Khoảng cách giữa các sân hơi sát nhau, thỉnh thoảng hay bị va chạm khi cứu cầu ở biên.",
  "Hệ thống thông gió hoạt động tốt, dù sân kín nhưng không có mùi mồ hôi khó chịu.",
  "Sân có lớp dạy cầu lông cho trẻ em và người mới bắt đầu vào buổi sáng, thầy dạy rất tận tâm.",
  "Wifi mạnh, có chỗ ngồi chờ rộng rãi cho người nhà hoặc đồng đội nghỉ ngơi.",
  "Hơi nóng vào buổi trưa do mái tôn chưa cách nhiệt tốt, nhưng buổi tối thì cực kỳ mát mẻ.",
  "Mặt sân bám giày, di chuyển linh hoạt không lo chấn thương cổ chân.",
  "Cầu bán tại quầy là cầu Hải Yến chính hãng, giá phải chăng.",
  "Sân này phù hợp cho cả đánh phong trào lẫn tập luyện chuyên nghiệp."
];

const MOCK_REPLIES = [
  "Cảm ơn bạn đã ủng hộ sân! Rất vui khi thấy bạn hài lòng với chất lượng thảm và ánh sáng.",
  "Dạ, chúng tôi sẽ cho nhân viên lau sàn thường xuyên hơn để khắc phục tình trạng trơn trượt ạ.",
  "Rất vui khi bạn hài lòng với dịch vụ. Chúng tôi sẽ sớm cập nhật bảng chỉ dẫn ngoài đường lớn.",
  "Cảm ơn góp ý của bạn về hệ thống đèn, chúng tôi đang nghiên cứu lắp thêm tấm chắn chống chói.",
  "Vệ sinh và độ thoáng của sân luôn là ưu tiên hàng đầu. Chúc bạn có những trận cầu nảy lửa!",
  "Dạ, khung giờ tối thường rất đông khách, quý khách vui lòng đặt qua App để giữ chỗ chắc chắn ạ.",
  "Sân luôn cố gắng nâng cấp định kỳ để đảm bảo mặt thảm và lưới luôn trong trạng thái tốt nhất.",
  "Dịch vụ khách hàng là niềm tự hào của chúng tôi. Hẹn gặp lại bạn vào buổi tập tới!",
  "Chúng tôi ghi nhận ý kiến về mái tôn và sẽ sớm triển khai phương án cách nhiệt vào tháng tới.",
  "Cảm ơn bạn đã đánh giá cao các giải đấu phong trào. Mong bạn tiếp tục tham gia cùng hội sân!",
  "Rất tiếc về sự bất tiện ở khoảng cách sân, chúng tôi sẽ điều chỉnh lại sơ đồ bố trí khi có thể.",
  "Cảm ơn bạn! Đội ngũ nhân viên sân luôn sẵn sàng hỗ trợ mọi yêu cầu của anh em lông thủ."
];

export const ReviewSection = () => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const reviews = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
      const comment = MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)];
      const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
      const hasReply = Math.random() > 0.3;
      const reply = hasReply ? MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)] : null;

      return {
        id: i,
        name,
        comment,
        rating,
        date: "2 ngày trước",
        reply,
        likes: Math.floor(Math.random() * 20)
      };
    });
  }, []);

  return (
    <section className="space-y-4 pb-4">
      <div className="flex-1 flex items-center gap-3 md:gap-4">
        <h3 className="text-accent font-semibold whitespace-nowrap">Đánh giá từ người chơi</h3>
        <div className="flex-1 border-b border-dashed border-accent mr-1" />
      </div>

      {/* Write Review Section */}
      <div className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-secondary font-semibold mb-2 flex items-center gap-2">
              <Icon path={mdiCreation} size={0.8} />
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
          <Button variant="accent" disabled={!comment.trim()}>
            <Icon path={mdiSend} size={0.8} />
            Gửi đánh giá
          </Button>
        </div>
        <RichTextEditor
          value={comment}
          onChange={setComment}
          placeholder="Chia sẻ trải nghiệm của bạn"
        />
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border border-primary">
                  <AvatarImage src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${review.name}`} />
                </Avatar>
                <div>
                  <h4 className="text-white font-semibold text-sm">{review.name}</h4>
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
                    <span className="text-neutral-400 text-sm">({review.date})</span>
                  </div>
                </div>
              </div>
              <Badge variant="ghost">
                <Icon path={mdiThumbUpOutline} size={0.6} className="mr-1" />
                {review.likes}
              </Badge>
            </div>

            <p className="text-neutral-300 text-base leading-relaxed">
              {review.comment}
            </p>

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
        ))}
      </div>
    </section>
  );
};
