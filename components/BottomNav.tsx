'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DarkModeToggle from './DarkModeToggle'

const NAV_ITEMS = [
  { href: '/', label: 'Home', labelHi: 'होम' },
  { href: '/bhajans', label: 'Browse', labelHi: 'भजन' },
  { href: '/collections', label: 'Collections', labelHi: 'संग्रह' },
  { href: '/search', label: 'Search', labelHi: 'खोज' },
  { href: '/about', label: 'About', labelHi: 'परिचय' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#0F3A5C] dark:border-[#1B3055] bg-[#1B4E7A] dark:bg-[#0F2040] md:hidden">
      <ul className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs rounded-md transition-colors ${
                  isActive
                    ? 'text-[#E8C060] dark:text-[#E8C060] font-semibold'
                    : 'text-[#C8DFF0] dark:text-[#7AB0A0]'
                }`}
              >
                <span className="text-sm">{item.labelHi}</span>
                <span className="text-[10px] opacity-70">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="flex items-center pl-2 border-l border-[#0F3A5C] dark:border-[#1B3055] ml-1">
        <DarkModeToggle />
      </div>
    </nav>
  )
}
