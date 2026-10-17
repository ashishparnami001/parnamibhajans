import type { Metadata } from 'next'
import { Noto_Sans_Devanagari, Noto_Serif_Devanagari, Crimson_Pro } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import DesktopNav from '@/components/DesktopNav'
import DarkModeToggle from '@/components/DarkModeToggle'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/config'

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
  weight: ['400', '500', '600'],
})

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-serif-devanagari',
  display: 'swap',
  weight: ['400', '600', '700'],
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_TAGLINE,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" suppressHydrationWarning>
      {/* Browser extensions (e.g. ColorZilla) add attributes to <body> before React loads */}
      <body
        suppressHydrationWarning
        className={`${notoDevanagari.variable} ${notoSerifDevanagari.variable} ${crimsonPro.variable} min-h-screen pb-20 md:pb-0`}
      >
        <header className="hidden md:flex items-center justify-between px-6 py-3 bg-[#1B4E7A] dark:bg-[#0F2040] sticky top-0 z-40 shadow-md">
          <span className={`${crimsonPro.variable} font-semibold text-[#C4962A] text-xl tracking-wide`}>{SITE_NAME}</span>
          <div className="flex items-center gap-2">
            <DesktopNav />
            <DarkModeToggle />
          </div>
        </header>
        <main>{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
