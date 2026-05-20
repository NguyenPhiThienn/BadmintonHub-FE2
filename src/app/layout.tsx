import AIChatbox from '@/components/AIChatbox'
import { UserProvider } from '@/context/useUserContext'
import { ReactQueryClientProvider } from '@/provider/ReactQueryClientProvider'
import { ToastProvider } from '@/provider/ToastProvider'
import { Metadata } from 'next'
import { Lexend, Open_Sans } from "next/font/google"
import NextTopLoader from 'nextjs-toploader'
import React from 'react'
import './font.css'
import './globals.css'

const lexend = Lexend({
  subsets: ["latin", "vietnamese"],
  variable: "--font-lexend",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  variable: "--font-opensans",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'BadmintonHub - Nền tảng đặt sân cầu lông hàng đầu',
  description: 'Tìm kiếm và đặt sân cầu lông dễ dàng, nhanh chóng với BadmintonHub. Hệ thống quản lý sân bãi chuyên nghiệp.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${lexend.variable} ${openSans.variable}`} suppressHydrationWarning>
      <body className={`${openSans.className} bg-mainBackgroundV1 min-h-screen pb-20 md:pb-0`} suppressHydrationWarning>
        <NextTopLoader
          color="#41C651"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #41C651,0 0 5px #41C651"
          zIndex={1600}
          showAtBottom={false}
        />
        <ReactQueryClientProvider>
          <UserProvider>
            <ToastProvider />
            {children}
            <AIChatbox />
          </UserProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  )
}
