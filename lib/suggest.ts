import { Author, Bhajan } from './types'
import { toSearchKey } from './transliterate'

// Small, browser-friendly record used for the auto-suggest dropdown.
// The keys are computed on the server so the browser only compares strings.
export interface SuggestItem {
  id: number
  title: string
  author: string
  titleKey: string // search key of the title only
  key: string      // search key of title + tags + keywords + collections + author
}

export const SUGGEST_MIN_CHARS = 2
export const SUGGEST_DEFAULT_LIMIT = 6

export function buildSuggestIndex(bhajans: Bhajan[], authors: Author[] = []): SuggestItem[] {
  const authorNames = new Map(authors.map(a => [a.id, a.name]))
  return bhajans.map(b => {
    const author = authorNames.get(b.author_id) ?? ''
    return {
      id: b.id,
      title: b.title,
      author,
      titleKey: toSearchKey(b.title),
      key: toSearchKey(
        [b.title, ...b.tags, ...b.collections, b.search_keywords, author].join(' ')
      ),
    }
  })
}

// Levenshtein distance. Returns max + 1 as soon as the distance is known to exceed max.
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost)
      rowMin = Math.min(rowMin, row[j])
    }
    if (rowMin > max) return max + 1
    prev = row
  }
  return prev[b.length]
}

// True when some word starts with something within `max` edits of `query`.
function fuzzyPrefixMatch(query: string, words: string[], max: number): boolean {
  return words.some(word => {
    for (let len = query.length - 1; len <= query.length + 1; len++) {
      if (len > 0 && editDistance(query, word.slice(0, len), max) <= max) return true
    }
    return false
  })
}

function matchTier(q: string, item: SuggestItem): number {
  const spaced = ` ${q}`
  if (item.titleKey.startsWith(q)) return 0
  if (` ${item.titleKey}`.includes(spaced)) return 1
  if (` ${item.key}`.includes(spaced)) return 2
  if (q.length >= 3 && item.key.includes(q)) return 3

  // A typing mistake: only for a single word of three or more letters
  if (q.length >= 3 && !q.includes(' ')) {
    const max = q.length >= 5 ? 2 : 1
    if (fuzzyPrefixMatch(q, item.titleKey.split(' '), max)) return 4
    if (fuzzyPrefixMatch(q, item.key.split(' '), max)) return 5
  }
  return -1
}

// Works for English spellings and Devanagari alike: both become the same search key.
export function suggest(
  query: string,
  items: SuggestItem[],
  limit: number = SUGGEST_DEFAULT_LIMIT
): SuggestItem[] {
  const q = toSearchKey(query)
  if (q.length < SUGGEST_MIN_CHARS) return []

  return items
    .map((item, index) => ({ item, index, tier: matchTier(q, item) }))
    .filter(entry => entry.tier >= 0)
    .sort((a, b) => a.tier - b.tier || a.index - b.index)
    .slice(0, limit)
    .map(entry => entry.item)
}
