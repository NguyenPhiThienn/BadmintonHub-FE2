import VenueDetailsPage from "@/components/VenueDetailsPage";

export const metadata = {
  title: "Chi tiết cơ sở sân | BadmintonHub",
  description: "Xem chi tiết sân, biểu đồ độ đông sân và chọn khung giờ đặt sân trực tuyến.",
};

export default function Page({ params }: { params: { id: string } }) {
  return <VenueDetailsPage id={params.id} />;
}
