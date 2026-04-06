import { notFound } from 'next/navigation'
import { fetchBhajans, fetchAuthors } from '@/lib/fetchSheets'
import FontSizeControl from '@/components/FontSizeControl'
import WakeLockButton from '@/components/WakeLockButton'
import ShareButton from '@/components/ShareButton'
import Link from 'next/link'

export async function generateStaticParams() {
  const bhajans = await fetchBhajans()
  return bhajans.map(b => ({ id: String(b.id) }))
}

interface Props { params: Promise<{ id: string }> }

export default async function BhajanDetailPage({ params }: Props) {
  const { id } = await params
  const [bhajans, authors] = await Promise.all([fetchBhajans(), fetchAuthors()])

  const bhajan = bhajans.find(b => b.id === Number(id))
  if (!bhajan) notFound()

  const author = authors.find(a => a.id === bhajan.author_id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/bhajans" className="text-sm text-orange-600 hover:underline mb-4 block">
        ← सभी भजन
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{bhajan.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          {author && <span>{author.name}</span>}
          <span>{bhajan.year}</span>
          {bhajan.collections.map(c => (
            <Link key={c} href={`/collections/${encodeURIComponent(c)}`}
              className="text-orange-600 hover:underline">{c}</Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 py-3 border-y border-amber-200 dark:border-gray-700">
        <FontSizeControl />
        <div className="flex gap-2">
          <WakeLockButton />
          <ShareButton title={bhajan.title} />
        </div>
      </div>

      <div className="bhajan-text text-gray-900 dark:text-gray-100">
        {bhajan.text.split('\n').map((line, i) => (
          <p key={i} className={line.trim() === '' ? 'my-4' : 'my-1'}>
            {line || '\u00A0'}
          </p>
        ))}
      </div>

      {bhajan.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {bhajan.tags.map(tag => (
            <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
              className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm hover:bg-amber-200">
              {tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
