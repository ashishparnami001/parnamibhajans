# parnamibhajans.in Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, statically-generated Next.js website that serves ~500–1000 Hindi bhajans from a Google Sheets CSV, with fuzzy search, voice input, keyword cloud, and a comfortable reading experience.

**Architecture:** Next.js 14 App Router with full SSG — all pages are statically generated at build time by fetching Google Sheets CSV data. Client components (search, navigation, font controls) receive pre-fetched data as props and handle interactivity in the browser. No backend, no database, no API keys.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Fuse.js, papaparse, Noto Sans Devanagari (next/font), Jest + React Testing Library

---

## File Map

| File | Responsibility |
|------|---------------|
| `lib/types.ts` | TypeScript interfaces: Bhajan, Author |
| `lib/config.ts` | Google Sheet CSV URLs, constants |
| `lib/fetchSheets.ts` | Fetch + parse CSV; exports pure `parseBhajansCSV` / `parseAuthorsCSV` for testing |
| `lib/search.ts` | Fuse.js index creation and search function |
| `app/layout.tsx` | Root layout: Noto Sans Devanagari font, BottomNav, dark mode class |
| `app/globals.css` | Base Tailwind directives, Devanagari font defaults |
| `app/page.tsx` | Home: fetches bhajans/authors, renders KeywordCloud + recent list |
| `app/bhajans/page.tsx` | Browse: all bhajans, client-side filter by author/year/collection |
| `app/bhajans/[id]/page.tsx` | Bhajan detail: full text, FontSizeControl, Wake Lock, share |
| `app/authors/page.tsx` | Authors list: author cards |
| `app/authors/[id]/page.tsx` | Author detail: bio, photo, contact, their bhajans |
| `app/collections/page.tsx` | Collections list: all named collections |
| `app/collections/[slug]/page.tsx` | Collection detail: bhajans in one collection |
| `app/search/page.tsx` | Search page: server wrapper that embeds bhajan data for client |
| `app/about/page.tsx` | About page: placeholder content |
| `components/BhajanCard.tsx` | Bhajan preview card (title, author, year, tags) |
| `components/KeywordCloud.tsx` | Tag cloud — client component |
| `components/SearchBar.tsx` | Text input + mic button — client component |
| `components/SearchResults.tsx` | Fuse.js search UI — client component, uses useSearchParams |
| `components/BottomNav.tsx` | Sticky mobile nav — client component, uses usePathname |
| `components/FontSizeControl.tsx` | A- / A+ buttons — client component, uses localStorage |
| `components/BrowseFilters.tsx` | Author/year/collection dropdowns — client component |
| `components/WakeLockButton.tsx` | Screen wake lock toggle — client component |
| `components/ShareButton.tsx` | Native share / clipboard copy — client component |
| `components/DarkModeToggle.tsx` | Dark mode toggle — client component |
| `__tests__/lib/fetchSheets.test.ts` | Unit tests for CSV parsing |
| `__tests__/lib/search.test.ts` | Unit tests for Fuse.js search |
| `__tests__/components/BhajanCard.test.tsx` | Render test for BhajanCard |
| `.env.local` | CSV URLs (not committed) |
| `.env.example` | Example env file (committed) |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts` (via create-next-app)
- Create: `jest.config.ts`, `jest.setup.ts`
- Create: `.env.example`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/ashishparnami/code/personal/parnamibhajans
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint
```

When prompted: Would you like to use Turbopack? → **No**. All other defaults are fine.

- [ ] **Step 2: Install project dependencies**

```bash
npm install fuse.js papaparse
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest @types/papaparse
```

- [ ] **Step 3: Configure Jest for Next.js**

Create `jest.config.ts`:

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

Create `jest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Create `.env.example`**

```
# Google Sheets CSV URLs
# Get these from: File → Share → Publish to web → CSV format
BHAJANS_CSV_URL=https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I/export?format=csv&gid=0
# Replace GID_HERE with the actual gid of the Authors tab (shown in URL when tab is selected)
AUTHORS_CSV_URL=https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I/export?format=csv&gid=GID_HERE
```

- [ ] **Step 5: Create `.env.local`** (copy from example, fill in actual gids)

```bash
cp .env.example .env.local
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: Next.js server starts on http://localhost:3000, default page loads.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 14 project with Tailwind and Jest"
```

---

## Task 2: TypeScript Types + Config

**Files:**
- Create: `lib/types.ts`
- Create: `lib/config.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```typescript
export interface Bhajan {
  id: number
  title: string
  text: string
  author_id: number
  date: string
  year: number
  tags: string[]        // parsed from comma-separated string
  collections: string[] // parsed from comma-separated string
  search_keywords: string
  youtube_url: string
}

export interface Author {
  id: number
  name: string
  bio: string
  photo_url: string
  contact: string
}
```

- [ ] **Step 2: Create `lib/config.ts`**

```typescript
export const SHEET_ID = '1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I'

export const BHAJANS_CSV_URL =
  process.env.BHAJANS_CSV_URL ??
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`

export const AUTHORS_CSV_URL =
  process.env.AUTHORS_CSV_URL ??
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1`

export const SITE_NAME = 'Parnami Bhajans'
export const SITE_TAGLINE = 'भजन संग्रह'
export const RECENT_BHAJANS_COUNT = 10
```

- [ ] **Step 3: Commit**

```bash
git add lib/
git commit -m "feat: add TypeScript types and config constants"
```

---

## Task 3: Data Fetching Layer

**Files:**
- Create: `lib/fetchSheets.ts`
- Create: `__tests__/lib/fetchSheets.test.ts`

- [ ] **Step 1: Write failing tests first**

Create `__tests__/lib/fetchSheets.test.ts`:

```typescript
import { parseBhajansCSV, parseAuthorsCSV } from '@/lib/fetchSheets'

const BHAJANS_CSV = `id,title,text,author_id,date,year,tags,collections,search_keywords,youtube_url
1,राम नाम,राम राम सीता राम,1,2020-01-15,2020,"राम,सीता","प्रभात भजन,राम भजन","ram sita",
2,कृष्ण भजन,हरे कृष्ण हरे राम,1,2021-03-10,2021,कृष्ण,होली विशेष,krishna,https://youtube.com/xyz`

const AUTHORS_CSV = `id,name,bio,photo_url,contact
1,स्वर्णा पारनामी,भजन रचयिता,,`

describe('parseBhajansCSV', () => {
  it('parses all fields correctly', () => {
    const bhajans = parseBhajansCSV(BHAJANS_CSV)
    expect(bhajans).toHaveLength(2)
    expect(bhajans[0].id).toBe(1)
    expect(bhajans[0].title).toBe('राम नाम')
    expect(bhajans[0].year).toBe(2020)
  })

  it('splits tags into arrays', () => {
    const bhajans = parseBhajansCSV(BHAJANS_CSV)
    expect(bhajans[0].tags).toEqual(['राम', 'सीता'])
  })

  it('splits collections into arrays', () => {
    const bhajans = parseBhajansCSV(BHAJANS_CSV)
    expect(bhajans[0].collections).toEqual(['प्रभात भजन', 'राम भजन'])
  })

  it('handles single tag (no comma) as array', () => {
    const bhajans = parseBhajansCSV(BHAJANS_CSV)
    expect(bhajans[1].tags).toEqual(['कृष्ण'])
  })

  it('handles empty tags gracefully', () => {
    const csv = `id,title,text,author_id,date,year,tags,collections,search_keywords,youtube_url\n3,भजन,text,1,2020-01-01,2020,,,,`
    const bhajans = parseBhajansCSV(csv)
    expect(bhajans[0].tags).toEqual([])
    expect(bhajans[0].collections).toEqual([])
  })
})

describe('parseAuthorsCSV', () => {
  it('parses authors correctly', () => {
    const authors = parseAuthorsCSV(AUTHORS_CSV)
    expect(authors).toHaveLength(1)
    expect(authors[0].id).toBe(1)
    expect(authors[0].name).toBe('स्वर्णा पारनामी')
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```bash
npx jest __tests__/lib/fetchSheets.test.ts
```

Expected: FAIL — `parseBhajansCSV` not found

- [ ] **Step 3: Implement `lib/fetchSheets.ts`**

```typescript
import Papa from 'papaparse'
import { Bhajan, Author } from './types'
import { BHAJANS_CSV_URL, AUTHORS_CSV_URL } from './config'

function splitCSVList(value: string): string[] {
  if (!value || !value.trim()) return []
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

export function parseBhajansCSV(csvText: string): Bhajan[] {
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })
  return data.map(row => ({
    id: Number(row.id),
    title: row.title ?? '',
    text: row.text ?? '',
    author_id: Number(row.author_id),
    date: row.date ?? '',
    year: Number(row.year),
    tags: splitCSVList(row.tags),
    collections: splitCSVList(row.collections),
    search_keywords: row.search_keywords ?? '',
    youtube_url: row.youtube_url ?? '',
  }))
}

export function parseAuthorsCSV(csvText: string): Author[] {
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })
  return data.map(row => ({
    id: Number(row.id),
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
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx jest __tests__/lib/fetchSheets.test.ts
```

Expected: PASS — all 6 tests

- [ ] **Step 5: Commit**

```bash
git add lib/fetchSheets.ts __tests__/lib/fetchSheets.test.ts
git commit -m "feat: add data fetching layer with CSV parsing and tests"
```

---

## Task 4: Search Library

**Files:**
- Create: `lib/search.ts`
- Create: `__tests__/lib/search.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/search.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests — expect failures**

```bash
npx jest __tests__/lib/search.test.ts
```

Expected: FAIL — `searchBhajans` not found

- [ ] **Step 3: Implement `lib/search.ts`**

```typescript
import Fuse from 'fuse.js'
import { Bhajan } from './types'

export interface TagFrequency {
  value: string
  count: number
}

export function searchBhajans(query: string, bhajans: Bhajan[]) {
  if (!query.trim()) return []

  const fuse = new Fuse(bhajans, {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'search_keywords', weight: 0.3 },
      { name: 'tags', weight: 0.15 },
      { name: 'collections', weight: 0.1 },
      { name: 'text', weight: 0.05 },
    ],
    threshold: 0.4,
    includeMatches: true,
    minMatchCharLength: 2,
  })

  return fuse.search(query)
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
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx jest __tests__/lib/search.test.ts
```

Expected: PASS — all 6 tests

- [ ] **Step 5: Commit**

```bash
git add lib/search.ts __tests__/lib/search.test.ts
git commit -m "feat: add Fuse.js search and tag frequency utilities with tests"
```

---

## Task 5: Root Layout + Fonts + BottomNav

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `components/BottomNav.tsx`

- [ ] **Step 1: Create `components/BottomNav.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Home', labelHi: 'होम' },
  { href: '/bhajans', label: 'Browse', labelHi: 'भजन' },
  { href: '/collections', label: 'Collections', labelHi: 'संग्रह' },
  { href: '/search', label: 'Search', labelHi: 'खोज' },
  { href: '/about', label: 'About', labelHi: 'परिचय' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 md:hidden">
      <ul className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs rounded-md transition-colors ${
                  isActive
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'
                }`}
              >
                <span className="text-sm">{item.labelHi}</span>
                <span className="text-[10px] opacity-70">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 2: Update `app/globals.css`**

Replace the default content with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-size-bhajan: 1.25rem;
  }

  body {
    @apply bg-amber-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100;
    font-family: var(--font-noto-devanagari), system-ui, sans-serif;
  }

  .bhajan-text {
    font-size: var(--font-size-bhajan);
    line-height: 1.8;
    font-family: var(--font-noto-devanagari), serif;
  }
}
```

- [ ] **Step 3: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/config'

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_TAGLINE,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className={`${notoDevanagari.variable} min-h-screen pb-20 md:pb-0`}>
        <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 sticky top-0 z-40">
          <span className="font-semibold text-orange-600 text-lg">{SITE_NAME}</span>
          <nav className="flex gap-6 text-sm">
            <a href="/">Home</a>
            <a href="/bhajans">Browse</a>
            <a href="/collections">Collections</a>
            <a href="/search">Search</a>
            <a href="/about">About</a>
          </nav>
        </header>
        <main>{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
```

Add `darkMode: 'class'` to `tailwind.config.ts` content section.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Expected: amber background, bottom nav visible on mobile viewport, desktop header on wide viewport.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css components/BottomNav.tsx tailwind.config.ts
git commit -m "feat: add root layout with Noto Devanagari font and mobile bottom nav"
```

---

## Task 6: BhajanCard Component

**Files:**
- Create: `components/BhajanCard.tsx`
- Create: `__tests__/components/BhajanCard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `__tests__/components/BhajanCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import BhajanCard from '@/components/BhajanCard'
import { Bhajan } from '@/lib/types'

const BHAJAN: Bhajan = {
  id: 1, title: 'राम नाम', text: 'राम राम सीता राम\nजय जय राम',
  author_id: 1, date: '2020-01-15', year: 2020,
  tags: ['राम', 'सीता'], collections: ['प्रभात भजन'],
  search_keywords: 'ram sita', youtube_url: '',
}

describe('BhajanCard', () => {
  it('renders the bhajan title', () => {
    render(<BhajanCard bhajan={BHAJAN} authorName="स्वर्णा पारनामी" />)
    expect(screen.getByText('राम नाम')).toBeInTheDocument()
  })

  it('renders the author name', () => {
    render(<BhajanCard bhajan={BHAJAN} authorName="स्वर्णा पारनामी" />)
    expect(screen.getByText('स्वर्णा पारनामी')).toBeInTheDocument()
  })

  it('renders the year', () => {
    render(<BhajanCard bhajan={BHAJAN} authorName="स्वर्णा पारनामी" />)
    expect(screen.getByText('2020')).toBeInTheDocument()
  })

  it('links to the bhajan detail page', () => {
    render(<BhajanCard bhajan={BHAJAN} authorName="स्वर्णा पारनामी" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/bhajans/1')
  })
})
```

- [ ] **Step 2: Run test — expect fail**

```bash
npx jest __tests__/components/BhajanCard.test.tsx
```

- [ ] **Step 3: Implement `components/BhajanCard.tsx`**

```tsx
import Link from 'next/link'
import { Bhajan } from '@/lib/types'

interface Props {
  bhajan: Bhajan
  authorName?: string
}

export default function BhajanCard({ bhajan, authorName }: Props) {
  const preview = bhajan.text.split('\n').slice(0, 2).join(' / ')

  return (
    <Link
      href={`/bhajans/${bhajan.id}`}
      className="block rounded-xl border border-amber-200 bg-white dark:bg-gray-900 dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:border-orange-300 transition-all"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {bhajan.title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
        {preview}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{authorName}</span>
        <span>{bhajan.year}</span>
      </div>
      {bhajan.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {bhajan.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npx jest __tests__/components/BhajanCard.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add components/BhajanCard.tsx __tests__/components/BhajanCard.test.tsx
git commit -m "feat: add BhajanCard component with tests"
```

---

## Task 7: SearchBar + SearchResults + Search Page

**Files:**
- Create: `components/SearchBar.tsx`
- Create: `components/SearchResults.tsx`
- Create: `app/search/page.tsx`

- [ ] **Step 1: Create `components/SearchBar.tsx`**

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

interface Props {
  defaultValue?: string
  placeholder?: string
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'भजन खोजें... (Hindi या Hinglish)',
}: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function startVoice() {
    // SpeechRecognition is a browser API — access via window to avoid SSR issues
    const SR =
      (window as typeof window & { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

    if (!SR) {
      alert('Voice search is not supported in this browser. Try Chrome.')
      return
    }

    const recognition = new SR()
    recognition.lang = 'hi-IN'
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      router.push(`/search?q=${encodeURIComponent(transcript)}`)
    }

    recognition.start()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-amber-300 bg-white dark:bg-gray-900 dark:border-gray-600 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <button
        type="button"
        onClick={startVoice}
        aria-label={listening ? 'Listening...' : 'Voice search'}
        className={`rounded-xl px-4 py-3 border text-xl transition-colors ${
          listening
            ? 'bg-red-100 border-red-400 text-red-600 animate-pulse'
            : 'bg-white dark:bg-gray-900 border-amber-300 dark:border-gray-600 hover:bg-amber-50'
        }`}
      >
        🎤
      </button>
      <button
        type="submit"
        className="rounded-xl px-4 py-3 bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
      >
        खोज
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Create `components/SearchResults.tsx`**

```tsx
'use client'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { Bhajan, Author } from '@/lib/types'
import { searchBhajans } from '@/lib/search'
import BhajanCard from './BhajanCard'
import SearchBar from './SearchBar'

interface Props {
  bhajans: Bhajan[]
  authors: Author[]
}

export default function SearchResults({ bhajans, authors }: Props) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const results = useMemo(() => searchBhajans(query, bhajans), [query, bhajans])

  const authorMap = useMemo(
    () => Object.fromEntries(authors.map(a => [a.id, a.name])),
    [authors]
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <SearchBar defaultValue={query} />

      {query && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {results.length} results for{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {results.map(({ item }) => (
          <BhajanCard key={item.id} bhajan={item} authorName={authorMap[item.author_id]} />
        ))}
        {query && results.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            कोई भजन नहीं मिला।
            <br />
            <span className="text-sm">Try different keywords or Hinglish spelling.</span>
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/search/page.tsx`**

```tsx
import { Suspense } from 'react'
import { fetchBhajans, fetchAuthors } from '@/lib/fetchSheets'
import SearchResults from '@/components/SearchResults'

export default async function SearchPage() {
  const [bhajans, authors] = await Promise.all([fetchBhajans(), fetchAuthors()])

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SearchResults bhajans={bhajans} authors={authors} />
    </Suspense>
  )
}
```

- [ ] **Step 4: Verify in browser**

Navigate to http://localhost:3000/search and type a query. Expected: search bar renders, results appear.

- [ ] **Step 5: Commit**

```bash
git add components/SearchBar.tsx components/SearchResults.tsx app/search/page.tsx
git commit -m "feat: add SearchBar with voice input and Search results page"
```

---

## Task 8: KeywordCloud + Home Page

**Files:**
- Create: `components/KeywordCloud.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/KeywordCloud.tsx`**

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { TagFrequency } from '@/lib/search'

interface Props {
  tags: TagFrequency[]
}

export default function KeywordCloud({ tags }: Props) {
  const router = useRouter()
  const max = Math.max(...tags.map(t => t.count), 1)

  return (
    <div className="flex flex-wrap gap-2 justify-center py-4">
      {tags.slice(0, 40).map(tag => {
        const size = 0.8 + (tag.count / max) * 1.2
        return (
          <button
            key={tag.value}
            onClick={() => router.push(`/search?q=${encodeURIComponent(tag.value)}`)}
            style={{ fontSize: `${size}rem` }}
            className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-orange-200 dark:hover:bg-orange-800/40 transition-colors cursor-pointer"
          >
            {tag.value}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Update `app/page.tsx`**

```tsx
import { fetchBhajans, fetchAuthors } from '@/lib/fetchSheets'
import { getTagFrequencies } from '@/lib/search'
import { RECENT_BHAJANS_COUNT, SITE_NAME, SITE_TAGLINE } from '@/lib/config'
import BhajanCard from '@/components/BhajanCard'
import KeywordCloud from '@/components/KeywordCloud'
import SearchBar from '@/components/SearchBar'

export default async function HomePage() {
  const [bhajans, authors] = await Promise.all([fetchBhajans(), fetchAuthors()])

  const authorMap = Object.fromEntries(authors.map(a => [a.id, a.name]))
  const tagFreqs = getTagFrequencies(bhajans)
  const recent = [...bhajans]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, RECENT_BHAJANS_COUNT)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-orange-700 dark:text-orange-400 mb-1">{SITE_NAME}</h1>
        <p className="text-gray-500 dark:text-gray-400">{SITE_TAGLINE}</p>
        <p className="text-sm text-gray-400 mt-1">{bhajans.length} भजन</p>
      </div>

      <SearchBar />

      {tagFreqs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Keywords
          </h2>
          <KeywordCloud tags={tagFreqs} />
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Recent Bhajans / हाल के भजन
        </h2>
        <div className="flex flex-col gap-3">
          {recent.map(bhajan => (
            <BhajanCard key={bhajan.id} bhajan={bhajan} authorName={authorMap[bhajan.author_id]} />
          ))}
        </div>
        <div className="text-center mt-4">
          <a href="/bhajans" className="text-orange-600 hover:underline text-sm">
            सभी भजन देखें →
          </a>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:3000. Expected: hero, search bar, keyword cloud, 10 recent bhajans.

- [ ] **Step 4: Commit**

```bash
git add components/KeywordCloud.tsx app/page.tsx
git commit -m "feat: add home page with keyword cloud and recent bhajans"
```

---

## Task 9: Browse Bhajans Page

**Files:**
- Create: `components/BrowseFilters.tsx`
- Create: `app/bhajans/page.tsx`

- [ ] **Step 1: Create `components/BrowseFilters.tsx`**

```tsx
'use client'
import { useState, useMemo } from 'react'
import { Bhajan, Author } from '@/lib/types'
import BhajanCard from './BhajanCard'

interface Props {
  bhajans: Bhajan[]
  authors: Author[]
}

export default function BrowseFilters({ bhajans, authors }: Props) {
  const [authorFilter, setAuthorFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [collectionFilter, setCollectionFilter] = useState('all')

  const authorMap = useMemo(
    () => Object.fromEntries(authors.map(a => [a.id, a.name])),
    [authors]
  )
  const years = useMemo(
    () => [...new Set(bhajans.map(b => b.year))].sort((a, b) => b - a),
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
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [bhajans, authorFilter, yearFilter, collectionFilter]
  )

  const sel = "rounded-lg border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"

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
      <p className="text-sm text-gray-500 mb-4">{filtered.length} भजन</p>
      <div className="flex flex-col gap-3">
        {filtered.map(b => (
          <BhajanCard key={b.id} bhajan={b} authorName={authorMap[b.author_id]} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/bhajans/page.tsx`**

```tsx
import { fetchBhajans, fetchAuthors } from '@/lib/fetchSheets'
import BrowseFilters from '@/components/BrowseFilters'

export default async function BhajansPage() {
  const [bhajans, authors] = await Promise.all([fetchBhajans(), fetchAuthors()])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        सभी भजन <span className="text-base font-normal text-gray-400">/ Browse All</span>
      </h1>
      <BrowseFilters bhajans={bhajans} authors={authors} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/BrowseFilters.tsx app/bhajans/page.tsx
git commit -m "feat: add browse bhajans page with author/year/collection filters"
```

---

## Task 10: Bhajan Detail Page

**Files:**
- Create: `components/FontSizeControl.tsx`
- Create: `components/WakeLockButton.tsx`
- Create: `components/ShareButton.tsx`
- Create: `app/bhajans/[id]/page.tsx`

- [ ] **Step 1: Create `components/FontSizeControl.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'

const SIZES = [16, 18, 20, 22, 24, 28, 32]
const DEFAULT_IDX = 2 // 20px
const STORAGE_KEY = 'bhajan-font-size'

export default function FontSizeControl() {
  const [idx, setIdx] = useState(DEFAULT_IDX)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const savedIdx = SIZES.indexOf(Number(saved))
    if (savedIdx >= 0) setIdx(savedIdx)
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-bhajan', `${SIZES[idx]}px`)
    localStorage.setItem(STORAGE_KEY, String(SIZES[idx]))
  }, [idx])

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIdx(i => Math.max(0, i - 1))}
        disabled={idx === 0}
        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
        aria-label="Decrease font size"
      >A−</button>
      <span className="text-xs text-gray-400 w-10 text-center">{SIZES[idx]}px</span>
      <button
        onClick={() => setIdx(i => Math.min(SIZES.length - 1, i + 1))}
        disabled={idx === SIZES.length - 1}
        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
        aria-label="Increase font size"
      >A+</button>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/WakeLockButton.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'

export default function WakeLockButton() {
  const [active, setActive] = useState(false)
  const [lock, setLock] = useState<WakeLockSentinel | null>(null)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported('wakeLock' in navigator)
  }, [])

  async function toggle() {
    if (active && lock) {
      await lock.release()
      setLock(null)
      setActive(false)
    } else {
      try {
        const sentinel = await navigator.wakeLock.request('screen')
        setLock(sentinel)
        setActive(true)
        sentinel.addEventListener('release', () => setActive(false))
      } catch {
        // Wake Lock denied or unsupported
      }
    }
  }

  useEffect(() => () => { lock?.release() }, [lock])

  if (!supported) return null

  return (
    <button
      onClick={toggle}
      title={active ? 'Screen will stay on' : 'Keep screen on while reading'}
      className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
        active
          ? 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400'
          : 'border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {active ? '🌞 On' : '💤 Sleep'}
    </button>
  )
}
```

- [ ] **Step 3: Create `components/ShareButton.tsx`**

```tsx
'use client'

interface Props { title: string }

export default function ShareButton({ title }: Props) {
  async function share() {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <button
      onClick={share}
      className="text-xs px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      📤 Share
    </button>
  )
}
```

- [ ] **Step 4: Create `app/bhajans/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { fetchBhajans, fetchAuthors } from '@/lib/fetchSheets'
import FontSizeControl from '@/components/FontSizeControl'
import WakeLockButton from '@/components/WakeLockButton'
import ShareButton from '@/components/ShareButton'
import Link from 'next/link'

export async function generateStaticParams() {
  const bhajans = await fetchBhajans()
  return bhajans.map(b => ({ id: String(b.id) }))
}

interface Props { params: Promise<{ id: string }> }

export default async function BhajanDetailPage({ params }: Props) {
  const { id } = await params
  const [bhajans, authors] = await Promise.all([fetchBhajans(), fetchAuthors()])

  const bhajan = bhajans.find(b => b.id === Number(id))
  if (!bhajan) notFound()

  const author = authors.find(a => a.id === bhajan.author_id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/bhajans" className="text-sm text-orange-600 hover:underline mb-4 block">
        ← सभी भजन
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{bhajan.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          {author && <span>{author.name}</span>}
          <span>{bhajan.year}</span>
          {bhajan.collections.map(c => (
            <Link key={c} href={`/collections/${encodeURIComponent(c)}`}
              className="text-orange-600 hover:underline">{c}</Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 py-3 border-y border-amber-200 dark:border-gray-700">
        <FontSizeControl />
        <div className="flex gap-2">
          <WakeLockButton />
          <ShareButton title={bhajan.title} />
        </div>
      </div>

      <div className="bhajan-text text-gray-900 dark:text-gray-100">
        {bhajan.text.split('\n').map((line, i) => (
          <p key={i} className={line.trim() === '' ? 'my-4' : 'my-1'}>
            {line || '\u00A0'}
          </p>
        ))}
      </div>

      {bhajan.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {bhajan.tags.map(tag => (
            <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
              className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm hover:bg-amber-200">
              {tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/FontSizeControl.tsx components/WakeLockButton.tsx components/ShareButton.tsx app/bhajans/
git commit -m "feat: add bhajan detail page with font controls, wake lock, and share"
```

---

## Task 11: Authors Pages

**Files:**
- Create: `app/authors/page.tsx`
- Create: `app/authors/[id]/page.tsx`

- [ ] **Step 1: Create `app/authors/page.tsx`**

```tsx
import { fetchAuthors, fetchBhajans } from '@/lib/fetchSheets'
import Link from 'next/link'

export default async function AuthorsPage() {
  const [authors, bhajans] = await Promise.all([fetchAuthors(), fetchBhajans()])
  const counts = Object.fromEntries(authors.map(a => [a.id, bhajans.filter(b => b.author_id === a.id).length]))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        रचयिता <span className="text-base font-normal text-gray-400">/ Authors</span>
      </h1>
      <div className="flex flex-col gap-4">
        {authors.map(author => (
          <Link key={author.id} href={`/authors/${author.id}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-white dark:bg-gray-900 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl shrink-0">
              🙏
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{author.name}</h2>
              <p className="text-sm text-gray-500">{counts[author.id] ?? 0} भजन</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

Note: `next/image` requires configuring `remotePatterns` in `next.config.ts` if photo URLs are from external domains. For now, use a plain `<img>` or the emoji placeholder shown above. Add `next/image` support when real photo URLs are known.

- [ ] **Step 2: Create `app/authors/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { fetchAuthors, fetchBhajans } from '@/lib/fetchSheets'
import BhajanCard from '@/components/BhajanCard'
import Link from 'next/link'

export async function generateStaticParams() {
  const authors = await fetchAuthors()
  return authors.map(a => ({ id: String(a.id) }))
}

interface Props { params: Promise<{ id: string }> }

export default async function AuthorDetailPage({ params }: Props) {
  const { id } = await params
  const [authors, bhajans] = await Promise.all([fetchAuthors(), fetchBhajans()])

  const author = authors.find(a => a.id === Number(id))
  if (!author) notFound()

  const authorBhajans = bhajans
    .filter(b => b.author_id === author.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/authors" className="text-sm text-orange-600 hover:underline mb-4 block">
        ← रचयिता
      </Link>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-3xl shrink-0">
          🙏
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{author.name}</h1>
          {author.bio && <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{author.bio}</p>}
          {author.contact && <p className="text-sm text-gray-500 mt-1">📞 {author.contact}</p>}
        </div>
      </div>
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
        भजन ({authorBhajans.length})
      </h2>
      <div className="flex flex-col gap-3">
        {authorBhajans.map(b => (
          <BhajanCard key={b.id} bhajan={b} authorName={author.name} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/authors/
git commit -m "feat: add authors list and detail pages"
```

---

## Task 12: Collections Pages

**Files:**
- Create: `app/collections/page.tsx`
- Create: `app/collections/[slug]/page.tsx`

- [ ] **Step 1: Create `app/collections/page.tsx`**

```tsx
import { fetchBhajans } from '@/lib/fetchSheets'
import Link from 'next/link'

export default async function CollectionsPage() {
  const bhajans = await fetchBhajans()

  const counts: Record<string, number> = {}
  for (const b of bhajans) {
    for (const c of b.collections) {
      counts[c] = (counts[c] ?? 0) + 1
    }
  }

  const collections = Object.entries(counts).sort((a, b) => b[1] - a[1])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        संग्रह <span className="text-base font-normal text-gray-400">/ Collections</span>
      </h1>
      <div className="grid grid-cols-2 gap-3">
        {collections.map(([name, count]) => (
          <Link key={name} href={`/collections/${encodeURIComponent(name)}`}
            className="p-4 rounded-xl border border-amber-200 bg-white dark:bg-gray-900 dark:border-gray-700 hover:shadow-md transition-all text-center">
            <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
            <p className="text-sm text-gray-400 mt-1">{count} भजन</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/collections/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { fetchBhajans, fetchAuthors } from '@/lib/fetchSheets'
import BhajanCard from '@/components/BhajanCard'
import Link from 'next/link'

export async function generateStaticParams() {
  const bhajans = await fetchBhajans()
  const collections = [...new Set(bhajans.flatMap(b => b.collections))]
  return collections.map(c => ({ slug: encodeURIComponent(c) }))
}

interface Props { params: Promise<{ slug: string }> }

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params
  const name = decodeURIComponent(slug)

  const [bhajans, authors] = await Promise.all([fetchBhajans(), fetchAuthors()])
  const authorMap = Object.fromEntries(authors.map(a => [a.id, a.name]))
  const filtered = bhajans
    .filter(b => b.collections.includes(name))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (filtered.length === 0) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/collections" className="text-sm text-orange-600 hover:underline mb-4 block">
        ← संग्रह
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {name}
        <span className="text-base font-normal text-gray-400 ml-2">({filtered.length} भजन)</span>
      </h1>
      <div className="flex flex-col gap-3">
        {filtered.map(b => (
          <BhajanCard key={b.id} bhajan={b} authorName={authorMap[b.author_id]} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/collections/
git commit -m "feat: add collections list and detail pages"
```

---

## Task 13: About Page

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: Create `app/about/page.tsx`**

```tsx
import { SITE_NAME } from '@/lib/config'

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        परिचय <span className="text-base font-normal text-gray-400">/ About</span>
      </h1>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-amber-200 dark:border-gray-700 p-6">
        <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-4xl mx-auto mb-4">
          🙏
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-2">
          स्वर्णा पारनामी
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          भजन रचयिता — [Bio to be added]
        </p>
        <div className="border-t border-amber-100 dark:border-gray-800 pt-4">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">संपर्क / Contact</h3>
          <p className="text-gray-500 text-sm">[Contact details to be added]</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-gray-400 text-center">
        {SITE_NAME} — भजन संग्रह · Built with Next.js
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/about/page.tsx
git commit -m "feat: add about page with placeholder content"
```

---

## Task 14: Dark Mode Toggle

**Files:**
- Create: `components/DarkModeToggle.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `components/DarkModeToggle.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved === 'dark' || (!saved && prefersDark)
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button onClick={toggle} aria-label="Toggle dark mode"
      className="text-xl p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
```

- [ ] **Step 2: Import `DarkModeToggle` in `app/layout.tsx`**

Add to the desktop header:
```tsx
import DarkModeToggle from '@/components/DarkModeToggle'
// ...inside <header>:
<DarkModeToggle />
```

- [ ] **Step 3: Ensure `darkMode: 'class'` is set in `tailwind.config.ts`**

```typescript
// tailwind.config.ts
const config = {
  darkMode: 'class',
  // ...rest of config
}
```

- [ ] **Step 4: Verify**

Toggle in browser — page goes dark/light. Reload — preference persists.

- [ ] **Step 5: Commit**

```bash
git add components/DarkModeToggle.tsx app/layout.tsx tailwind.config.ts
git commit -m "feat: add dark mode toggle with localStorage persistence"
```

---

## Task 15: Google Sheet Setup + Sample Data

**Files:**
- Create: `docs/google-sheet-setup.md`

- [ ] **Step 1: Set up the Google Sheet tabs**

In https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I:

1. Rename "Sheet1" tab → `bhajans`
2. Add a new tab → `authors`

- [ ] **Step 2: Add column headers**

`bhajans` tab row 1:
```
id | title | text | author_id | date | year | tags | collections | search_keywords | youtube_url
```

`authors` tab row 1:
```
id | name | bio | photo_url | contact
```

- [ ] **Step 3: Add sample data**

`authors` tab:
```
1 | स्वर्णा पारनामी | भजन रचयिता | |
```

`bhajans` tab (use actual newlines within the text cell or use \n notation if pasting via script):
```
1 | राम नाम | राम राम सीता राम | 1 | 2020-01-15 | 2020 | राम,सीता | प्रभात भजन | ram sita |
2 | कृष्ण लीला | हरे कृष्ण हरे राम | 1 | 2021-03-10 | 2021 | कृष्ण | होली विशेष | krishna govind |
3 | शिव भजन | ओम नमः शिवाय | 1 | 2022-08-15 | 2022 | शिव | प्रभात भजन | shiv om |
```

- [ ] **Step 4: Get the Authors tab GID and update `.env.local`**

Click the `authors` tab — the URL will show `gid=XXXXXXX`. Update `.env.local`:

```
AUTHORS_CSV_URL=https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I/export?format=csv&gid=XXXXXXX
```

- [ ] **Step 5: Make the sheet publicly viewable**

File → Share → Share with others → Change to "Anyone with the link" → Viewer → Done.

- [ ] **Step 6: Verify real data loads**

```bash
npm run dev
```

Navigate to http://localhost:3000. Expected: 3 sample bhajans, keyword cloud with राम, सीता, कृष्ण, शिव.

- [ ] **Step 7: Run all tests**

```bash
npx jest
```

Expected: all tests pass.

- [ ] **Step 8: Production build check**

```bash
npm run build
```

Expected: build succeeds with no TypeScript or lint errors.

- [ ] **Step 9: Write `docs/google-sheet-setup.md`**

Create the file with this content:

```markdown
# Google Sheet Setup

**Spreadsheet:** https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I

## Tabs

### `bhajans` (gid=0)
Columns: `id | title | text | author_id | date | year | tags | collections | search_keywords | youtube_url`

- `tags`: comma-separated Hindi keywords, e.g. `राम,सीता`
- `collections`: comma-separated group names, e.g. `प्रभात भजन,होली विशेष`
- `search_keywords`: space-separated Hinglish/romanized synonyms, e.g. `ram sita`
- `youtube_url`: leave empty until a video is available

### `authors` (gid = check URL when tab is selected)
Columns: `id | name | bio | photo_url | contact`

## Making it public

File → Share → Share with others → Anyone with the link → Viewer

## CSV URLs

- Bhajans: `https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=0`
- Authors: `https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=AUTHORS_GID`

Set these in `.env.local`.

## Adding new bhajans

Edit the sheet directly. Then trigger a site redeploy (push to GitHub or one-click on Vercel).
```

- [ ] **Step 10: Commit**

```bash
git add docs/
git commit -m "docs: add Google Sheet setup guide and verify sample data"
```

---

## Final Verification Checklist

1. `npx jest` — all tests pass
2. `npm run build` — build succeeds, no TypeScript errors
3. `npm run dev` → http://localhost:3000 — home page loads with bhajans and keyword cloud
4. Type Hindi in search bar → relevant results appear
5. Type "ram" (Hinglish) → finds bhajans with `ram` in `search_keywords`
6. Click mic button → voice prompt (Chrome required); speech navigates to search results
7. Click a bhajan → detail page: large text, font controls visible
8. A+ increases size, A− decreases, page reload keeps the size
9. Wake Lock button (if on HTTPS or localhost): keeps screen on
10. Share button: triggers native share sheet on mobile / copies link on desktop
11. Collections page → click a collection → only that collection's bhajans show
12. Authors page → click an author → bio and bhajans appear
13. Dark mode toggle → page goes dark, reload persists dark mode
14. Mobile view (DevTools device mode) → bottom nav visible, all 5 tabs navigate correctly
15. `npm run build && npm start` — production mode works locally
