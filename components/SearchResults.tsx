'use client'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { Bhajan, Author } from '@/lib/types'
import { createSearchIndex } from '@/lib/search'
import { buildSuggestIndex } from '@/lib/suggest'
import BhajanCard from './BhajanCard'
import SearchBar from './SearchBar'

interface Props {
  bhajans: Bhajan[]
  authors: Author[]
}

export default function SearchResults({ bhajans, authors }: Props) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const searchIndex = useMemo(() => createSearchIndex(bhajans, authors), [bhajans, authors])
  const results = useMemo(() => searchIndex.search(query), [searchIndex, query])
  const suggestions = useMemo(() => buildSuggestIndex(bhajans, authors), [bhajans, authors])

  const authorMap = useMemo(
    () => Object.fromEntries(authors.map(a => [a.id, a.name])),
    [authors]
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <SearchBar defaultValue={query} suggestions={suggestions} />

      {query && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {results.length} results for{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {results.map(({ item }) => (
          <BhajanCard key={item.id} bhajan={item} authorName={authorMap[item.author_id]} />
        ))}
        {query && results.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            कोई भजन नहीं मिला।
            <br />
            <span className="text-sm">Try different keywords or Hinglish spelling.</span>
          </p>
        )}
      </div>
    </div>
  )
}
