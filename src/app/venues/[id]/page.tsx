import VenueDetailsPage from "@/components/VenueDetailsPage";

export const metadata = {
  title: "Chi tiết cơ sở sân | BadmintonHub",
  description: "Xem chi tiết sân, biểu đồ độ đông sân và chọn khung giờ đặt sân trực tuyến.",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VenueDetailsPage id={id} />;
}
