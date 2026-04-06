import Fuse from 'fuse.js'
import { Bhajan } from './types'

export interface TagFrequency {
  value: string
  count: number
}

export function createSearchIndex(bhajans: Bhajan[]) {
  return new Fuse(bhajans, {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'search_keywords', weight: 0.3 },
      { name: 'tags', weight: 0.15 },
      { name: 'collections', weight: 0.1 },
      { name: 'text', weight: 0.05 },
    ],
    threshold: 0.4,
    includeMatches: true,
    includeScore: true,
    minMatchCharLength: 2,
  })
}

export function searchBhajans(query: string, bhajans: Bhajan[]): Fuse.FuseResult<Bhajan>[] {
  if (!query.trim()) return []
  return createSearchIndex(bhajans).search(query)
}

export function getTagFrequencies(bhajans: Bhajan[]): TagFrequency[] {
  const counts: Record<string, number> = {}
  for (const bhajan of bhajans) {
    for (const tag of bhajan.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
}
