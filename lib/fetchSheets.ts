import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Papa from 'papaparse'
import { Bhajan, Author } from './types'
import {
  BHAJANS_CSV_URL,
  AUTHORS_CSV_URL,
  LOCAL_BHAJANS_CSV,
  LOCAL_AUTHORS_CSV,
  DEFAULT_BHAJANS_CSV_URL,
  DEFAULT_AUTHORS_CSV_URL,
} from './config'

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
    tarz: row.tarz ?? '',
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

// Reads data/<fileName>. Returns null when the file does not exist.
async function readLocalCSV(fileName: string): Promise<string | null> {
  try {
    const text = await readFile(path.join(process.cwd(), 'data', fileName), 'utf-8')
    return text.replace(/^﻿/, '') // a spreadsheet export may start with a byte-order mark
  } catch {
    return null
  }
}

async function fetchCSV(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

// envUrl set -> that URL; else the local file; else the default sheet.
export async function loadCSV(envUrl: string, localFile: string, defaultUrl: string): Promise<string> {
  if (envUrl) return fetchCSV(envUrl)
  const local = await readLocalCSV(localFile)
  if (local !== null) return local
  return fetchCSV(defaultUrl)
}

export async function fetchBhajans(): Promise<Bhajan[]> {
  return parseBhajansCSV(await loadCSV(BHAJANS_CSV_URL, LOCAL_BHAJANS_CSV, DEFAULT_BHAJANS_CSV_URL))
}

export async function fetchAuthors(): Promise<Author[]> {
  try {
    return parseAuthorsCSV(await loadCSV(AUTHORS_CSV_URL, LOCAL_AUTHORS_CSV, DEFAULT_AUTHORS_CSV_URL))
  } catch (err) {
    console.warn('fetchAuthors: fetch failed — returning empty array.', err)
    return []
  }
}
