import { buildSuggestIndex, suggest, editDistance } from '@/lib/suggest'
import { Author, Bhajan } from '@/lib/types'

function bhajan(id: number, title: string, extra: Partial<Bhajan> = {}): Bhajan {
  return {
    id, title, tarz: '', text: '', author_id: 1, date: '2020-01-01', year: 2020,
    tags: [], collections: [], search_keywords: '', youtube_url: '', ...extra,
  }
}

const AUTHORS: Author[] = [{ id: 1, name: 'स्वर्णा परनामी', bio: '', photo_url: '', contact: '' }]

const ITEMS = buildSuggestIndex(
  [
    bhajan(1, 'वाणी अमृत है'),
    bhajan(2, 'सतगुरु की वाणी'),
    bhajan(3, 'वन्दना'),
    bhajan(4, 'हनुमान चालीसा', { tags: ['बजरंगबली'] }),
    bhajan(5, 'कृष्ण लीला'),
  ],
  AUTHORS
)

const suggestedIds = (query: string, limit?: number) => suggest(query, ITEMS, limit).map(s => s.id)

describe('editDistance', () => {
  it('counts insertions, deletions and substitutions', () => {
    expect(editDistance('vani', 'vani', 2)).toBe(0)
    expect(editDistance('vani', 'vni', 2)).toBe(1)
    expect(editDistance('vani', 'vaani', 2)).toBe(1)
    expect(editDistance('vani', 'vona', 2)).toBe(2)
  })

  it('returns more than max when the words are too far apart', () => {
    expect(editDistance('vani', 'krishn', 2)).toBeGreaterThan(2)
  })
})

describe('buildSuggestIndex', () => {
  it('keeps only small fields for the browser', () => {
    expect(Object.keys(ITEMS[0]).sort()).toEqual(['author', 'id', 'key', 'title', 'titleKey'])
  })
})

describe('suggest', () => {
  it('returns nothing for empty or one-letter input', () => {
    expect(suggestedIds('')).toEqual([])
    expect(suggestedIds('v')).toEqual([])
  })

  it('suggests titles that start with the typed English prefix', () => {
    expect(suggestedIds('van')).toEqual(expect.arrayContaining([1, 2, 3]))
  })

  it('puts titles that start with the prefix first', () => {
    const result = suggestedIds('wan')
    expect(result.indexOf(1)).toBeLessThan(result.indexOf(2))
  })

  it.each(['Vaani', 'Waani', 'Wani', 'Vani'])('suggests वाणी bhajans for %s', typed => {
    expect(suggestedIds(typed)).toEqual(expect.arrayContaining([1, 2]))
  })

  it('suggests from Devanagari input', () => {
    expect(suggestedIds('वाणी')).toEqual(expect.arrayContaining([1, 2]))
  })

  it('matches words in the middle of a title', () => {
    expect(suggestedIds('amrit')).toContain(1)
  })

  it('matches tags and author names', () => {
    expect(suggestedIds('bajrang')).toContain(4)
    expect(suggestedIds('swarna')).toHaveLength(5)
  })

  it('tolerates a typing mistake', () => {
    expect(suggestedIds('hanumn')).toContain(4)
    expect(suggestedIds('krisna')).toContain(5)
  })

  it('does not suggest unrelated titles', () => {
    expect(suggestedIds('zzzz')).toEqual([])
  })

  it('respects the limit', () => {
    expect(suggestedIds('swarna', 3)).toHaveLength(3)
  })
})
