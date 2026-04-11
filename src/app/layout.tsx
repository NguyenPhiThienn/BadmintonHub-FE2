import { UserProvider } from '@/context/useUserContext'
import { ReactQueryClientProvider } from '@/provider/ReactQueryClientProvider'
import { ToastProvider } from '@/provider/ToastProvider'
import { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'
import React from 'react'
import './font.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'CompanyManagement - Hệ thống quản lý doanh nghiệp thông minh',
  description: 'Giải pháp quản lý nhân sự, thiết bị, công việc và công ty toàn diện cho doanh nghiệp.',
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      // { url: '/favicon/favicon.ico' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-mainBackgroundV1 min-h-screen" suppressHydrationWarning>
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
          </UserProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  )
}
