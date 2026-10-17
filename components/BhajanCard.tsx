import Link from 'next/link'
import { Bhajan } from '@/lib/types'

type BhajanSummary = Omit<Bhajan, 'text'>

interface Props {
  bhajan: BhajanSummary
  authorName?: string
}

export default function BhajanCard({ bhajan, authorName }: Props) {
  return (
    <Link
      href={`/bhajans/${bhajan.id}`}
      className="card-temple block p-4"
    >
      <h2 className="text-lg font-semibold text-[#14629F] dark:text-[#CFE6F7] mb-1">
        {bhajan.title}
      </h2>
      <div className="flex items-center justify-between text-xs text-[#7A6550] dark:text-[#6A7A8A]">
        <span>{authorName ?? 'अज्ञात'}</span>
        {bhajan.year > 0 && <span>{bhajan.year}</span>}
      </div>
      {bhajan.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {bhajan.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="tag-temple"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
