import Fuse from 'fuse.js'
import { Author, Bhajan } from './types'
import { toSearchKey } from './transliterate'

export interface TagFrequency {
  value: string
  count: number
}

export interface SearchHit {
  item: Bhajan
  score: number // 0 = best
}

// Every field is stored as a search key (see toSearchKey), so Devanagari text
// and any English spelling of it are compared in the same Roman form.
interface IndexedBhajan {
  bhajan: Bhajan
  title: string
  keywords: string
  tags: string
  author: string
  collections: string
  lyrics: string
}

const FUZZY_MIN_CHARS = 4
const LYRICS_MIN_CHARS = 3
const LYRICS_SCORE = 1 // lyric-only matches rank after every fuzzy match

export function createSearchIndex(bhajans: Bhajan[], authors: Author[] = []) {
  const authorNames = new Map(authors.map(a => [a.id, a.name]))
  const docs: IndexedBhajan[] = bhajans.map(bhajan => ({
    bhajan,
    title: toSearchKey(bhajan.title),
    keywords: toSearchKey(bhajan.search_keywords),
    tags: toSearchKey(bhajan.tags.join(' ')),
    author: toSearchKey(authorNames.get(bhajan.author_id) ?? ''),
    collections: toSearchKey(bhajan.collections.join(' ')),
    lyrics: toSearchKey(bhajan.text),
  }))

  // Lyrics are long, so they are matched exactly below instead of fuzzily:
  // fuzzy matching on long text returns too many false results.
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'keywords', weight: 0.25 },
      { name: 'tags', weight: 0.15 },
      { name: 'author', weight: 0.1 },
      { name: 'collections', weight: 0.1 },
    ],
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  }
  // Threshold 0.4 allows about 1 typing mistake in a 4-letter word and 2 in a 5-letter word.
  const fuzzyFuse = new Fuse(docs, { ...fuseOptions, threshold: 0.4 })
  // Short queries must match exactly: one typo in 3 letters matches unrelated words.
  const exactFuse = new Fuse(docs, { ...fuseOptions, threshold: 0 })

  return {
    search(query: string): SearchHit[] {
      const key = toSearchKey(query)
      if (!key) return []

      const fuse = key.length >= FUZZY_MIN_CHARS ? fuzzyFuse : exactFuse
      const hits: SearchHit[] = fuse
        .search(key)
        .map(result => ({ item: result.item.bhajan, score: result.score ?? 0 }))

      if (key.length >= LYRICS_MIN_CHARS) {
        const seen = new Set(hits.map(hit => hit.item.id))
        for (const doc of docs) {
          if (!seen.has(doc.bhajan.id) && doc.lyrics.includes(key)) {
            hits.push({ item: doc.bhajan, score: LYRICS_SCORE })
          }
        }
      }
      return hits
    },
  }
}

export function searchBhajans(
  query: string,
  bhajans: Bhajan[],
  authors: Author[] = []
): SearchHit[] {
  return createSearchIndex(bhajans, authors).search(query)
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
