import { compareNewestFirst } from '@/lib/sort'
import { Bhajan } from '@/lib/types'

function bhajan(id: number, date: string): Bhajan {
  return {
    id, title: `b${id}`, tarz: '', text: '', author_id: 1, date, year: 0,
    tags: [], collections: [], search_keywords: '', youtube_url: '',
  }
}

describe('compareNewestFirst', () => {
  it('puts newer dates first', () => {
    const sorted = [bhajan(1, '2020-01-01'), bhajan(2, '2022-05-01')].sort(compareNewestFirst)
    expect(sorted.map(b => b.id)).toEqual([2, 1])
  })

  it('keeps book order when no bhajan has a date', () => {
    const sorted = [bhajan(3, ''), bhajan(1, ''), bhajan(2, '')].sort(compareNewestFirst)
    expect(sorted.map(b => b.id)).toEqual([1, 2, 3])
  })

  it('puts bhajans without a valid date after dated ones', () => {
    const sorted = [bhajan(1, ''), bhajan(2, 'not a date'), bhajan(3, '2021-01-01')].sort(compareNewestFirst)
    expect(sorted.map(b => b.id)).toEqual([3, 1, 2])
  })
})
