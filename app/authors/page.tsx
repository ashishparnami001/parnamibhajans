import { fetchAuthors, fetchBhajans } from '@/lib/fetchSheets'
import Link from 'next/link'

export default async function AuthorsPage() {
  const [authors, bhajans] = await Promise.all([fetchAuthors(), fetchBhajans()])
  const counts = Object.fromEntries(authors.map(a => [a.id, bhajans.filter(b => b.author_id === a.id).length]))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        रचयिता <span className="text-base font-normal text-gray-400">/ Authors</span>
      </h1>
      <div className="flex flex-col gap-4">
        {authors.map(author => (
          <Link key={author.id} href={`/authors/${author.id}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-white dark:bg-gray-900 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl shrink-0">
              🙏
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{author.name}</h2>
              <p className="text-sm text-gray-500">{counts[author.id] ?? 0} भजन</p>
            </div>
          </Link>
        ))}
        {authors.length === 0 && (
          <p className="text-gray-400 text-center py-8">No authors yet.</p>
        )}
      </div>
    </div>
  )
}
