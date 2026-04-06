# parnamibhajans.in — Design Spec

**Date:** 2026-04-06
**Project:** Bhajan website for Swarna Parnami (and future lyricists)
**Domain:** parnamibhajans.in (TBD, to be purchased separately)

---

## Overview

A mobile-first website hosting ~500–1000 Hindi bhajans. Primary use case: devotees reading on their phone while singing. No user login required for reading. Content managed via a shared Google Spreadsheet. Data sourced from 5 scanned PDF books (one-time extraction script, out of scope for this spec).

---

## Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 (App Router) | SSG, future API routes, large ecosystem |
| Styling | Tailwind CSS | Mobile-first utilities, dark mode support |
| Font | Noto Sans Devanagari (next/font) | Best Hindi readability, zero layout shift |
| Search | Fuse.js (client-side) | Fuzzy, no backend, handles Hindi + Hinglish |
| Voice input | Web Speech API (browser built-in) | Free, no API key |
| CSV parsing | papaparse | Robust CSV → JS object parsing |
| Keyword cloud | react-tagcloud | Simple frequency-based tag cloud |
| Hosting | TBD — Vercel recommended (free tier) | Auto-deploy, free SSL, custom domain |

---

## Data Model

### Google Spreadsheet: `parnamibhajans-db`

**Sheet ID:** `1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I`

**CSV URLs** (sheet must be shared as "Anyone with link can view"):
- Bhajans tab (gid=0): `https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I/export?format=csv&gid=0`
- Authors tab: URL will use the gid of the Authors sheet tab (to be created in the spreadsheet)

**Tab: `bhajans`**

| Column | Type | Notes |
|--------|------|-------|
| id | number | Unique ID |
| title | text | Hindi title (Devanagari) |
| text | text | Full bhajan text |
| author_id | number | FK → authors.id |
| date | date | Full date written/published |
| year | number | Year — for browsing/filtering by year |
| tags | text | Comma-separated Hindi keywords (loose) |
| collections | text | Comma-separated named groups (e.g. "प्रभात भजन, होली विशेष") |
| search_keywords | text | Romanized/Hinglish synonyms for cross-script search |
| youtube_url | text | Empty now — future YouTube video link |

**Tab: `authors`**

| Column | Type | Notes |
|--------|------|-------|
| id | number | Unique ID |
| name | text | Author name |
| bio | text | Short bio |
| photo_url | text | Link to photo (Google Drive or CDN) |
| contact | text | Email/phone/social handle |

**Design notes:**
- `tags` = loose keywords for search/discovery
- `collections` = named curated groups for structured browsing (like playlists)
- `search_keywords` = Hinglish/romanized synonyms — bridges the Devanagari ↔ Latin script gap for Fuse.js
- Both sheets published as public CSV URLs (no API key needed)
- Refresh: update sheet → trigger redeploy → site rebuilds in ~1 min

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Keyword cloud, search bar, recent bhajans |
| `/bhajans` | All Bhajans | Browsable list; filter by author, year, collection |
| `/bhajans/[id]` | Bhajan Detail | Full text, font controls, wake lock, share |
| `/authors` | Authors List | Author cards |
| `/authors/[id]` | Author Detail | Bio, photo, contact info, full bhajan list |
| `/search?q=` | Search Results | Fuse.js results with match highlights |
| `/collections` | Collections | Browse all named collections |
| `/collections/[slug]` | Collection Detail | All bhajans in a collection |
| `/about` | About | Site intro, dummy content initially |

---

## Navigation

- **Mobile:** Sticky bottom nav bar — Home, Browse, Collections, Search, About
- **Desktop:** Top header nav with the same links
- Back button / breadcrumb on all detail pages

---

## Search

- All bhajan data fetched at **build time** (SSG) and embedded as a JSON prop — no runtime API call needed. At 500–1000 bhajans this is well under 1 MB.
- Fuse.js indexes: `title`, `text`, `tags`, `collections`, `search_keywords` — initialised client-side from the embedded JSON
- Fuzzy threshold: 0.4 (permissive enough for typos, strict enough to avoid noise)
- Voice input: mic button in search bar → Web Speech API → transcript fed to Fuse.js
- Keyword cloud (homepage): tag frequency from `tags` column; click = filter bhajan list

---

## Mobile Reading UX

- **Font:** Noto Sans Devanagari, minimum 20px, line-height 1.8
- **Font size controls:** A- / A+ buttons, persisted in `localStorage`
- **Wake Lock API:** prevents screen sleep during reading
- **Share button:** native share sheet (WhatsApp, copy link, etc.)
- **Scroll memory:** `sessionStorage` restores scroll position on back navigation
- **Dark mode:** Tailwind `dark:` classes, toggle persisted in `localStorage`

---

## Project Structure

```
parnamibhajans/
├── app/
│   ├── layout.tsx                # Root layout, fonts, bottom nav
│   ├── page.tsx                  # Home: keyword cloud + recent bhajans
│   ├── bhajans/
│   │   ├── page.tsx              # Browse all bhajans
│   │   └── [id]/page.tsx         # Bhajan detail
│   ├── authors/
│   │   ├── page.tsx              # Authors list
│   │   └── [id]/page.tsx         # Author detail
│   ├── collections/
│   │   ├── page.tsx              # All collections
│   │   └── [slug]/page.tsx       # Collection detail
│   ├── search/page.tsx           # Search results
│   └── about/page.tsx            # About page
├── components/
│   ├── BhajanCard.tsx            # Bhajan preview card
│   ├── KeywordCloud.tsx          # Tag frequency cloud
│   ├── SearchBar.tsx             # Text input + voice mic button
│   ├── BottomNav.tsx             # Mobile sticky nav
│   └── FontSizeControl.tsx       # A- / A+ controls
├── lib/
│   ├── fetchSheets.ts            # Fetch + parse both CSV sheets
│   └── types.ts                  # Bhajan, Author TypeScript interfaces
└── public/
    └── (images, icons, og images)
```

---

## Refresh Strategy

No database, no API keys, zero ongoing cost beyond the domain.

1. Admin edits Google Sheet
2. Trigger a redeploy (push to GitHub, or one-click on Vercel — the chosen host)
3. Next.js re-fetches CSV at build time
4. Updated site live in ~1 minute

---

## Future Extensions (Out of Scope)

- Admin login (Next.js API routes + NextAuth)
- YouTube video embeds on bhajan detail pages
- Multiple lyricists (already modelled via `author_id`)
- Backend phonetic/semantic search API
- Google Form → Sheet submission for new bhajans

---

## Verification Checklist

1. `npm run dev` → site loads at localhost:3000
2. Home page shows keyword cloud and 10 most recent bhajans
3. Typing Hindi in search returns relevant bhajans
4. Typing Hinglish (e.g. "ram") finds bhajans with matching `search_keywords`
5. Voice search button works on Chrome (Android/desktop)
6. Bhajan detail: A+/A- controls change font size and it persists on reload
7. Screen does not sleep while reading a bhajan (Wake Lock active)
8. Share button triggers native share sheet on mobile
9. Collections page lists all collections; clicking one shows filtered bhajans
10. Authors page shows all authors; author detail shows their bhajans
11. Dark mode toggle works and persists across page refresh
12. Mobile bottom nav visible; all links work; active state highlights current page
