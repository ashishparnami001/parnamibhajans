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
            className="bg-[#EDE3CD] dark:bg-[#1D4068] text-[#14629F] dark:text-[#CFE6F7] hover:bg-[#CFA620] hover:text-white dark:hover:bg-[#CFA620] dark:hover:text-white rounded-full px-3 py-1 transition-colors cursor-pointer"
          >
            {tag.value}
          </Link>
        )
      })}
    </div>
  )
}
