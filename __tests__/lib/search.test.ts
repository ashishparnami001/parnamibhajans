import { searchBhajans, getTagFrequencies } from '@/lib/search'
import { Bhajan } from '@/lib/types'

const BHAJANS: Bhajan[] = [
  {
    id: 1, title: 'राम नाम', text: 'राम राम सीता राम',
    author_id: 1, date: '2020-01-01', year: 2020,
    tags: ['राम', 'सीता'], collections: ['प्रभात भजन'],
    search_keywords: 'ram sita', youtube_url: '',
  },
  {
    id: 2, title: 'कृष्ण लीला', text: 'गोविंद गोपाल',
    author_id: 1, date: '2021-01-01', year: 2021,
    tags: ['कृष्ण'], collections: ['होली विशेष'],
    search_keywords: 'krishna govind', youtube_url: '',
  },
]

describe('searchBhajans', () => {
  it('finds bhajan by Hindi title', () => {
    const results = searchBhajans('राम', BHAJANS)
    expect(results.some(r => r.item.id === 1)).toBe(true)
  })

  it('finds bhajan by Hinglish search_keywords', () => {
    const results = searchBhajans('ram', BHAJANS)
    expect(results.some(r => r.item.id === 1)).toBe(true)
  })

  it('returns empty array for no match', () => {
    const results = searchBhajans('zzzzunknownzzz', BHAJANS)
    expect(results).toHaveLength(0)
  })

  it('returns empty array for empty query', () => {
    const results = searchBhajans('', BHAJANS)
    expect(results).toHaveLength(0)
  })

  it('does not match unrelated bhajans for Hinglish query', () => {
    const results = searchBhajans('ram', BHAJANS)
    expect(results.some(r => r.item.id === 2)).toBe(false)
  })
})

describe('getTagFrequencies', () => {
  it('counts tag occurrences across all bhajans', () => {
    const freqs = getTagFrequencies(BHAJANS)
    const ramTag = freqs.find(t => t.value === 'राम')
    expect(ramTag?.count).toBe(1)
  })

  it('sorts by frequency descending', () => {
    const moreBhajans = [...BHAJANS, { ...BHAJANS[0], id: 3 }]
    const freqs = getTagFrequencies(moreBhajans)
    expect(freqs[0].count).toBeGreaterThanOrEqual(freqs[1]?.count ?? 0)
  })
})
