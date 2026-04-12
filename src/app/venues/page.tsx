import Script from "next/script";
import MapExplorer from "@/components/Venues/MapExplorer";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const metadata = {
  title: "Khám phá & Bản đồ - BadmintonHub",
  description: "Tìm kiếm sân cầu lông gần bạn nhất thông qua bản đồ trực quan.",
};

export default function VenuesPage() {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;

  return (
    <>
      {!apiKey && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white p-10 text-center">
          <div>
            <h1 className="text-2xl font-semibold text-red-500 mb-2">Thiếu Google Maps API Key</h1>
            <p className="text-neutral-400">Vui lòng kiểm tra file .env hoặc cấu hình môi trường.</p>
            <code className="block mt-4 p-2 bg-neutral-800 rounded">NEXT_PUBLIC_MAPS_API_KEY</code>
          </div>
        </div>
      )}
      {apiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
          strategy="afterInteractive"
        />
      )}
      <main className="h-screen w-full bg-black overflow-hidden flex flex-col">
        <div className="p-4 bg-darkBackgroundV1 border-b border-darkBorderV1 md:hidden">
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
        <div className="flex-1">
          <MapExplorer />
        </div>
      </main>
    </>
  );
}
