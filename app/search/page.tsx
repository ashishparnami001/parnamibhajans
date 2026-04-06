import { Suspense } from 'react'
import { fetchBhajans, fetchAuthors } from '@/lib/fetchSheets'
import SearchResults from '@/components/SearchResults'

export default async function SearchPage() {
  const [bhajans, authors] = await Promise.all([fetchBhajans(), fetchAuthors()])

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SearchResults bhajans={bhajans} authors={authors} />
    </Suspense>
  )
}
