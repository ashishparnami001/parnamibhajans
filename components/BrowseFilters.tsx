'use client'
import { useState, useMemo } from 'react'
import { Bhajan, Author } from '@/lib/types'
import { compareNewestFirst } from '@/lib/sort'
import BhajanCard from './BhajanCard'

type BhajanSummary = Omit<Bhajan, 'text'>

interface Props {
  bhajans: BhajanSummary[]
  authors: Author[]
}

const sel = "rounded-lg border border-[#DACAAE] dark:border-[#1D4068] bg-[#FFFBF3] dark:bg-[#0E2A4A] text-[#44201A] dark:text-[#EDE3CD] px-3 py-2 text-sm"

export default function BrowseFilters({ bhajans, authors }: Props) {
  const [authorFilter, setAuthorFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [collectionFilter, setCollectionFilter] = useState('all')

  const authorMap = useMemo(
    () => Object.fromEntries(authors.map(a => [a.id, a.name])),
    [authors]
  )
  const years = useMemo(
    () => [...new Set(bhajans.map(b => b.year))].filter(y => y > 0).sort((a, b) => b - a),
    [bhajans]
  )
  const collections = useMemo(
    () => [...new Set(bhajans.flatMap(b => b.collections))].sort(),
    [bhajans]
  )
  const filtered = useMemo(
    () =>
      bhajans
        .filter(b => authorFilter === 'all' || String(b.author_id) === authorFilter)
        .filter(b => yearFilter === 'all' || String(b.year) === yearFilter)
        .filter(b => collectionFilter === 'all' || b.collections.includes(collectionFilter))
        .sort(compareNewestFirst),
    [bhajans, authorFilter, yearFilter, collectionFilter]
  )

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <select value={authorFilter} onChange={e => setAuthorFilter(e.target.value)} className={sel}>
          <option value="all">All Authors</option>
          {authors.map(a => <option key={a.id} value={String(a.id)}>{a.name}</option>)}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className={sel}>
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
        </select>
        <select value={collectionFilter} onChange={e => setCollectionFilter(e.target.value)} className={sel}>
          <option value="all">All Collections</option>
          {collections.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <p className="text-sm text-[#7A6550] mb-4">{filtered.length} भजन</p>
      <div className="flex flex-col gap-3">
        {filtered.map(b => (
          <BhajanCard key={b.id} bhajan={b} authorName={authorMap[b.author_id]} />
        ))}
      </div>
    </div>
  )
}
