import Papa from 'papaparse'
import { Bhajan, Author } from './types'
import { BHAJANS_CSV_URL, AUTHORS_CSV_URL } from './config'

function splitCSVList(value: string): string[] {
  if (!value || !value.trim()) return []
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

export function parseBhajansCSV(csvText: string): Bhajan[] {
  const { data, errors } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })
  if (errors.length > 0) {
    console.warn('CSV parse warnings:', errors)
  }
  return data.map(row => ({
    id: Number(row.id) || 0,
    title: row.title ?? '',
    text: row.text ?? '',
    author_id: Number(row.author_id) || 0,
    date: row.date ?? '',
    year: Number(row.year) || 0,
    tags: splitCSVList(row.tags),
    collections: splitCSVList(row.collections),
    search_keywords: row.search_keywords ?? '',
    youtube_url: row.youtube_url ?? '',
  }))
}

export function parseAuthorsCSV(csvText: string): Author[] {
  const { data, errors } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })
  if (errors.length > 0) {
    console.warn('CSV parse warnings:', errors)
  }
  return data.map(row => ({
    id: Number(row.id) || 0,
    name: row.name ?? '',
    bio: row.bio ?? '',
    photo_url: row.photo_url ?? '',
    contact: row.contact ?? '',
  }))
}

export async function fetchBhajans(): Promise<Bhajan[]> {
  const res = await fetch(BHAJANS_CSV_URL, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Failed to fetch bhajans: ${res.status}`)
  return parseBhajansCSV(await res.text())
}

export async function fetchAuthors(): Promise<Author[]> {
  const res = await fetch(AUTHORS_CSV_URL, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Failed to fetch authors: ${res.status}`)
  return parseAuthorsCSV(await res.text())
}
