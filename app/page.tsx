import Link from 'next/link'
import { fetchBhajans, fetchAuthors } from '@/lib/fetchSheets'
import { getTagFrequencies } from '@/lib/search'
import { RECENT_BHAJANS_COUNT, SITE_NAME, SITE_TAGLINE } from '@/lib/config'
import BhajanCard from '@/components/BhajanCard'
import KeywordCloud from '@/components/KeywordCloud'
import SearchBar from '@/components/SearchBar'

export default async function HomePage() {
  const [bhajans, authors] = await Promise.all([fetchBhajans(), fetchAuthors()])

  const authorMap = Object.fromEntries(authors.map(a => [a.id, a.name]))
  const tagFreqs = getTagFrequencies(bhajans)
  const recent = [...bhajans]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, RECENT_BHAJANS_COUNT)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-orange-700 dark:text-orange-400 mb-1">{SITE_NAME}</h1>
        <p className="text-gray-500 dark:text-gray-400">{SITE_TAGLINE}</p>
        <p className="text-sm text-gray-400 mt-1">{bhajans.length} भजन</p>
      </div>

      <SearchBar />

      {tagFreqs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Keywords
          </h2>
          <KeywordCloud tags={tagFreqs} />
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Recent Bhajans / हाल के भजन
        </h2>
        <div className="flex flex-col gap-3">
          {recent.map(bhajan => (
            <BhajanCard key={bhajan.id} bhajan={bhajan} authorName={authorMap[bhajan.author_id]} />
          ))}
        </div>
        <div className="text-center mt-4">
          <Link href="/bhajans" className="text-orange-600 hover:underline text-sm">
            सभी भजन देखें →
          </Link>
        </div>
      </section>
    </div>
  )
}
