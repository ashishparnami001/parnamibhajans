import Link from 'next/link'
import { Bhajan } from '@/lib/types'

interface Props {
  bhajan: Bhajan
  authorName?: string
}

export default function BhajanCard({ bhajan, authorName }: Props) {
  const preview = bhajan.text.split('\n').slice(0, 2).join(' / ')

  return (
    <Link
      href={`/bhajans/${bhajan.id}`}
      className="block rounded-xl border border-amber-200 bg-white dark:bg-gray-900 dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:border-orange-300 transition-all"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {bhajan.title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
        {preview}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{authorName}</span>
        <span>{bhajan.year}</span>
      </div>
      {bhajan.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {bhajan.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
