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
      <h1 className="text-2xl font-bold text-[#14629F] dark:text-[#CFE6F7] mb-6">
        संग्रह <span className="text-base font-normal text-[#7A6550] dark:text-[#8A9AAA]">/ Collections</span>
      </h1>
      <div className="grid grid-cols-2 gap-3">
        {collections.map(([name, count]) => (
          <Link key={name} href={`/collections/${encodeURIComponent(name)}`}
            className="card-temple p-4 text-center">
            <p className="font-medium text-[#14629F] dark:text-[#CFE6F7]">{name}</p>
            <p className="text-sm text-[#7A6550] dark:text-[#8A9AAA] mt-1">{count} भजन</p>
          </Link>
        ))}
        {collections.length === 0 && (
          <p className="text-[#7A6550] col-span-2 text-center py-8">No collections yet.</p>
        )}
      </div>
    </div>
  )
}
