import type { Metadata } from 'next'
import { Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import DesktopNav from '@/components/DesktopNav'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/config'

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_TAGLINE,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className={`${notoDevanagari.variable} min-h-screen pb-20 md:pb-0`}>
        <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 sticky top-0 z-40">
          <span className="font-semibold text-orange-600 text-lg">{SITE_NAME}</span>
          <DesktopNav />
        </header>
        <main>{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
