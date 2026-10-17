import { notFound } from 'next/navigation'
import { fetchBhajans, fetchAuthors } from '@/lib/fetchSheets'
import { compareNewestFirst } from '@/lib/sort'
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
    .sort(compareNewestFirst)

  if (filtered.length === 0) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/collections" className="text-sm text-[#C4962A] dark:text-[#E8C060] hover:underline mb-4 block">
        ← संग्रह
      </Link>
      <h1 className="text-2xl font-bold text-[#1B4E7A] dark:text-[#C8DFF0] mb-6">
        {name}
        <span className="text-base font-normal text-[#7A6550] dark:text-[#8A9AAA] ml-2">({filtered.length} भजन)</span>
      </h1>
      <div className="flex flex-col gap-3">
        {filtered.map(({ text: _, ...summary }) => (
          <BhajanCard key={summary.id} bhajan={summary} authorName={authorMap[summary.author_id]} />
        ))}
      </div>
    </div>
  )
}
