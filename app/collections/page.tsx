import { fetchBhajans } from '@/lib/fetchSheets'
import Link from 'next/link'

export default async function CollectionsPage() {
  const bhajans = await fetchBhajans()

  const counts: Record<string, number> = {}
  for (const b of bhajans) {
    for (const c of b.collections) {
      counts[c] = (counts[c] ?? 0) + 1
    }
  }

  const collections = Object.entries(counts).sort((a, b) => b[1] - a[1])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        संग्रह <span className="text-base font-normal text-gray-400">/ Collections</span>
      </h1>
      <div className="grid grid-cols-2 gap-3">
        {collections.map(([name, count]) => (
          <Link key={name} href={`/collections/${encodeURIComponent(name)}`}
            className="p-4 rounded-xl border border-amber-200 bg-white dark:bg-gray-900 dark:border-gray-700 hover:shadow-md transition-all text-center">
            <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
            <p className="text-sm text-gray-400 mt-1">{count} भजन</p>
          </Link>
        ))}
        {collections.length === 0 && (
          <p className="text-gray-400 col-span-2 text-center py-8">No collections yet.</p>
        )}
      </div>
    </div>
  )
}
