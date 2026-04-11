"use client"

import dynamic from "next/dynamic";
import Link from "next/link";
import React, { Suspense } from "react";

const CommonHeader = dynamic(() => import("../Common/CommonHeader"), {
  ssr: false,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-darkBackgroundV1 flex flex-col" suppressHydrationWarning>
      <Suspense fallback={null}>
        <CommonHeader />
      </Suspense>
      <div className="flex flex-1 overflow-y-auto pt-[78px]">
        <main className="flex-1 flex flex-col h-[calc(100vh-78px)] overflow-y-auto custom-scrollbar">
          <div className="flex-1 py-4 px-4">
            {children}
          </div>
          <footer className="py-4 px-6 border-t border-t-darkBorderV1 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-sm text-neutral-400 font-medium">
              © 2026 Copyright, thuộc về{" "}
              <Link
                href="https://giaiphaptudongdien.com"
                target="_blank"
                className="text-accent hover:underline transition-all"
              >
                giaiphaptudongdien.com
              </Link>
            </p>
            <div className="flex flex-col md:flex-row items-center gap-1 text-sm text-neutral-400 font-medium">
              <strong>SĐT: </strong>
              <a href="tel:+84963968079" className="hover:text-accent transition-colors">
                (+84) 963.968.079
              </a>
              <span className="hidden md:block text-neutral-600">|</span>
              <strong>Email: </strong>
              <a href="mailto:electricautomation.info@gmail.com" className="hover:text-accent transition-colors">
                electricautomation.info@gmail.com
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div >
  );
}
