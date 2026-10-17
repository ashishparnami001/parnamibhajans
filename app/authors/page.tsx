import { fetchAuthors, fetchBhajans } from '@/lib/fetchSheets'
import Link from 'next/link'

export default async function AuthorsPage() {
  const [authors, bhajans] = await Promise.all([fetchAuthors(), fetchBhajans()])
  const counts = Object.fromEntries(authors.map(a => [a.id, bhajans.filter(b => b.author_id === a.id).length]))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#14629F] dark:text-[#CFE6F7] mb-6">
        रचयिता <span className="text-base font-normal text-[#7A6550] dark:text-[#8A9AAA]">/ Authors</span>
      </h1>
      <div className="flex flex-col gap-4">
        {authors.map(author => (
          <Link key={author.id} href={`/authors/${author.id}`}
            className="card-temple flex items-center gap-4 p-4">
            <div className="w-14 h-14 rounded-full bg-[#EDE3CD] dark:bg-[#1D4068] flex items-center justify-center text-2xl shrink-0">
              🙏
            </div>
            <div>
              <h2 className="font-semibold text-[#14629F] dark:text-[#CFE6F7]">{author.name}</h2>
              <p className="text-sm text-[#7A6550] dark:text-[#8A9AAA]">{counts[author.id] ?? 0} भजन</p>
            </div>
          </Link>
        ))}
        {authors.length === 0 && (
          <p className="text-[#7A6550] text-center py-8">No authors yet.</p>
        )}
      </div>
    </div>
  )
}
