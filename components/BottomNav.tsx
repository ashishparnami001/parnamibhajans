'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 md:hidden">
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
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'
                }`}
              >
                <span className="text-sm">{item.labelHi}</span>
                <span className="text-[10px] opacity-70">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
