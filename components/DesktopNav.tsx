'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/bhajans', label: 'Browse' },
  { href: '/collections', label: 'Collections' },
  { href: '/search', label: 'Search' },
  { href: '/about', label: 'About' },
]

export default function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-6 text-sm">
      {NAV_ITEMS.map(item => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive
              ? 'text-[#E8C060] font-semibold border-b-2 border-[#E8C060]'
              : 'text-[#C8DFF0] hover:text-[#E8C060]'
            }
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
