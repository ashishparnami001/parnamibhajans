import { searchBhajans, getTagFrequencies } from '@/lib/search'
import { Author, Bhajan } from '@/lib/types'

const PADDING = 'राम '.repeat(80)

const BHAJANS: Bhajan[] = [
  {
    id: 1, title: 'राम नाम', tarz: '', text: 'राम राम सीता राम',
    author_id: 1, date: '2020-01-01', year: 2020,
    tags: ['राम', 'सीता'], collections: ['प्रभात भजन'],
    search_keywords: 'ram sita', youtube_url: '',
  },
  {
    id: 2, title: 'कृष्ण लीला', tarz: '', text: 'गोविंद गोपाल',
    author_id: 1, date: '2021-01-01', year: 2021,
    tags: ['कृष्ण'], collections: ['होली विशेष'],
    search_keywords: 'krishna govind', youtube_url: '',
  },
  {
    id: 3, title: 'वाणी अमृत है', tarz: '', text: 'सत्संग की वाणी',
    author_id: 2, date: '2022-01-01', year: 2022,
    tags: ['वाणी'], collections: [],
    search_keywords: '', youtube_url: '',
  },
  {
    id: 4, title: 'हनुमान चालीसा', tarz: '', text: `${PADDING} अनोखा`,
    author_id: 2, date: '2023-01-01', year: 2023,
    tags: [], collections: [],
    search_keywords: '', youtube_url: '',
  },
]

const AUTHORS: Author[] = [
  { id: 1, name: 'दिनेश', bio: '', photo_url: '', contact: '' },
  { id: 2, name: 'स्वर्णा परनामी', bio: '', photo_url: '', contact: '' },
]

const ids = (query: string, authors: Author[] = AUTHORS) =>
  searchBhajans(query, BHAJANS, authors).map(r => r.item.id)

describe('searchBhajans', () => {
  it('finds bhajan by Hindi title', () => {
    expect(ids('राम')).toContain(1)
  })

  it('finds bhajan by Hinglish search_keywords', () => {
    expect(ids('ram')).toContain(1)
  })

  it('returns empty array for no match', () => {
    expect(ids('zzzzunknownzzz')).toHaveLength(0)
  })

  it('returns empty array for empty query', () => {
    expect(ids('')).toHaveLength(0)
    expect(ids('   ')).toHaveLength(0)
  })

  it('does not match unrelated bhajans for Hinglish query', () => {
    expect(ids('ram')).not.toContain(2)
  })

  it('works without an authors list', () => {
    expect(searchBhajans('ram', BHAJANS).some(r => r.item.id === 1)).toBe(true)
  })
})

describe('searchBhajans with English spellings of Hindi words', () => {
  it.each(['Vaani', 'Waani', 'Wani', 'Vani', 'Vaanee'])('finds वाणी when typed as %s', typed => {
    expect(ids(typed)).toContain(3)
  })

  it('finds a title with no search_keywords entry', () => {
    expect(ids('Hanuman')).toContain(4)
    expect(ids('Hanumaan chalisa')).toContain(4)
  })

  it('tolerates one or two typing mistakes in longer words', () => {
    expect(ids('Hanumn')).toContain(4)
    expect(ids('Hunumaan')).toContain(4)
  })

  it('finds a bhajan by author name in English', () => {
    expect(ids('Swarna')).toEqual(expect.arrayContaining([3, 4]))
  })

  it('finds a bhajan by tag in English', () => {
    expect(ids('Krishna')).toContain(2)
  })
})

describe('searchBhajans in lyrics', () => {
  it('finds a word that appears late in a long lyric (Hindi)', () => {
    expect(ids('अनोखा')).toContain(4)
  })

  it('finds a word that appears late in a long lyric (English)', () => {
    expect(ids('anokha')).toContain(4)
  })

  it('lists title matches before lyric-only matches', () => {
    const result = ids('ram')
    expect(result[0]).toBe(1)
  })
})

describe('getTagFrequencies', () => {
  it('counts tag occurrences across all bhajans', () => {
    const freqs = getTagFrequencies(BHAJANS)
    const ramTag = freqs.find(t => t.value === 'राम')
    expect(ramTag?.count).toBe(1)
  })

  it('sorts by frequency descending', () => {
    const moreBhajans = [...BHAJANS, { ...BHAJANS[0], id: 9 }]
    const freqs = getTagFrequencies(moreBhajans)
    expect(freqs[0].count).toBeGreaterThanOrEqual(freqs[1]?.count ?? 0)
  })
})
