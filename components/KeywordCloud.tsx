'use client'
import Link from 'next/link'
import { TagFrequency } from '@/lib/search'

interface Props {
  tags: TagFrequency[]
}

export default function KeywordCloud({ tags }: Props) {
  const max = Math.max(...tags.map(t => t.count), 1)

  return (
    <div className="flex flex-wrap gap-2 justify-center py-4">
      {tags.slice(0, 40).map(tag => {
        const size = 0.8 + (tag.count / max) * 1.2
        return (
          <Link
            key={tag.value}
            href={`/search?q=${encodeURIComponent(tag.value)}`}
            style={{ fontSize: `${size}rem` }}
            className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-orange-200 dark:hover:bg-orange-800/40 transition-colors cursor-pointer"
          >
            {tag.value}
          </Link>
        )
      })}
    </div>
  )
}
