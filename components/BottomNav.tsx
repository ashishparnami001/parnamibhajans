'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, LayoutGrid, Search, Info } from 'lucide-react'
import DarkModeToggle from './DarkModeToggle'

const NAV_ITEMS = [
  { href: '/', label: 'Home', labelHi: 'होम', Icon: Home },
  { href: '/bhajans', label: 'Browse', labelHi: 'भजन', Icon: BookOpen },
  { href: '/collections', label: 'Collections', labelHi: 'संग्रह', Icon: LayoutGrid },
  { href: '/search', label: 'Search', labelHi: 'खोज', Icon: Search },
  { href: '/about', label: 'About', labelHi: 'परिचय', Icon: Info },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#0E4A7F] dark:border-[#1D4068] bg-[#14629F] dark:bg-[#0E2A4A] md:hidden">
      <ul className="flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md transition-colors ${
                  isActive
                    ? 'text-[#EBD36B] font-semibold'
                    : 'text-[#CFE6F7] dark:text-[#5BC0BC] hover:text-[#EBD36B]'
                }`}
              >
                <item.Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] mt-0.5">{item.labelHi}</span>
              </Link>
            </li>
          )
        })}
        <li className="border-l border-[#0E4A7F] dark:border-[#1D4068] pl-2">
          <DarkModeToggle />
        </li>
      </ul>
    </nav>
  )
}
