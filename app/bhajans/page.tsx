import { fetchBhajans, fetchAuthors } from '@/lib/fetchSheets'
import BrowseFilters from '@/components/BrowseFilters'

export default async function BhajansPage() {
  const [bhajans, authors] = await Promise.all([fetchBhajans(), fetchAuthors()])
  const bhajanSummaries = bhajans.map(({ text: _, ...rest }) => rest)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        सभी भजन <span className="text-base font-normal text-gray-400">/ Browse All</span>
      </h1>
      <BrowseFilters bhajans={bhajanSummaries} authors={authors} />
    </div>
  )
}
