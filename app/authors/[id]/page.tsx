import { notFound } from 'next/navigation'
import { fetchAuthors, fetchBhajans } from '@/lib/fetchSheets'
import { compareNewestFirst } from '@/lib/sort'
import BhajanCard from '@/components/BhajanCard'
import Link from 'next/link'

export async function generateStaticParams() {
  const authors = await fetchAuthors()
  return authors.map(a => ({ id: String(a.id) }))
}

interface Props { params: Promise<{ id: string }> }

export default async function AuthorDetailPage({ params }: Props) {
  const { id } = await params
  const [authors, bhajans] = await Promise.all([fetchAuthors(), fetchBhajans()])

  const author = authors.find(a => a.id === Number(id))
  if (!author) notFound()

  const authorBhajans = bhajans
    .filter(b => b.author_id === author.id)
    .sort(compareNewestFirst)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/authors" className="text-sm text-[#CFA620] dark:text-[#EBD36B] hover:underline mb-4 block">
        ← रचयिता
      </Link>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-[#EDE3CD] dark:bg-[#1D4068] flex items-center justify-center text-3xl shrink-0">
          🙏
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#14629F] dark:text-[#CFE6F7]">{author.name}</h1>
          {author.bio && <p className="text-[#7A6550] dark:text-[#8A9AAA] mt-1 text-sm">{author.bio}</p>}
          {author.contact && <p className="text-sm text-[#7A6550] dark:text-[#8A9AAA] mt-1">📞 {author.contact}</p>}
        </div>
      </div>
      <h2 className="text-[#14629F] dark:text-[#8A9AAA] uppercase tracking-widest text-xs font-semibold mb-3">
        भजन ({authorBhajans.length})
      </h2>
      <div className="flex flex-col gap-3">
        {authorBhajans.map(({ text: _, ...summary }) => (
          <BhajanCard key={summary.id} bhajan={summary} authorName={author.name} />
        ))}
      </div>
    </div>
  )
}
