import { notFound } from 'next/navigation'
import { fetchBhajans, fetchAuthors } from '@/lib/fetchSheets'
import BhajanCard from '@/components/BhajanCard'
import Link from 'next/link'

export async function generateStaticParams() {
  const bhajans = await fetchBhajans()
  const collections = [...new Set(bhajans.flatMap(b => b.collections))]
  return collections.map(c => ({ slug: c }))
}

interface Props { params: Promise<{ slug: string }> }

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params
  const name = slug

  const [bhajans, authors] = await Promise.all([fetchBhajans(), fetchAuthors()])
  const authorMap = Object.fromEntries(authors.map(a => [a.id, a.name]))
  const filtered = bhajans
    .filter(b => b.collections.includes(name))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (filtered.length === 0) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/collections" className="text-sm text-orange-600 hover:underline mb-4 block">
        ← संग्रह
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {name}
        <span className="text-base font-normal text-gray-400 ml-2">({filtered.length} भजन)</span>
      </h1>
      <div className="flex flex-col gap-3">
        {filtered.map(({ text: _, ...summary }) => (
          <BhajanCard key={summary.id} bhajan={summary} authorName={authorMap[summary.author_id]} />
        ))}
      </div>
    </div>
  )
}
