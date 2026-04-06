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
              ? 'text-orange-600 dark:text-orange-400 font-semibold'
              : 'text-gray-600 dark:text-gray-300 hover:text-orange-500'
            }
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
