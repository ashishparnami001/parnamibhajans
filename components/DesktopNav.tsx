'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, LayoutGrid, Search, Info } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/bhajans', label: 'Browse', Icon: BookOpen },
  { href: '/collections', label: 'Collections', Icon: LayoutGrid },
  { href: '/search', label: 'Search', Icon: Search },
  { href: '/about', label: 'About', Icon: Info },
]

export default function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1">
      {NAV_ITEMS.map(item => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              isActive
                ? 'text-[#E8C060] font-semibold bg-white/10'
                : 'text-[#C8DFF0] hover:text-[#E8C060] hover:bg-white/10'
            }`}
          >
            <item.Icon size={14} strokeWidth={isActive ? 2.5 : 1.8} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
