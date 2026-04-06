# Parnami Bhajans

Mobile-first Hindi bhajan website for Swarna Parnami. Hosts ~500–1000 bhajans for devotees to read on their phone while singing.

**Live site:** parnamibhajans.in (TBD)
**Repo:** https://github.com/ashishparnami001/parnamibhajans

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, SSG) |
| Styling | Tailwind CSS v4 |
| Font | Noto Sans Devanagari + Noto Serif Devanagari |
| Search | Fuse.js (client-side, Hindi + Hinglish) |
| Voice input | Web Speech API |
| Database | Google Sheets (public CSV) |
| Hosting | Vercel (recommended) |

---

## Local Development

```bash
npm install
```

Create `.env.local` (never commit this):

```
BHAJANS_CSV_URL=https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I/export?format=csv&gid=0
AUTHORS_CSV_URL=https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I/export?format=csv&gid=1984021733
```

```bash
npm run dev      # http://localhost:3000
npm test         # run tests
npm run build    # production build
```

---

## Google Sheet

**Spreadsheet:** https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I

Two tabs:

**Bhajans** (gid=0) — columns: `id, title, text, author_id, date, year, tags, collections, search_keywords, youtube_url`
- `tags` — comma-separated Hindi keywords, e.g. `राम,सीता`
- `collections` — comma-separated group names, e.g. `प्रभात भजन,होली विशेष`
- `search_keywords` — Hinglish/romanized synonyms, e.g. `ram sita` (for cross-script search)

**Lyricists** (gid=1984021733) — columns: `id, name, bio, photo_url, contact`

See `docs/google-sheet-setup.md` for full setup instructions.

---

## Refreshing Content After Sheet Updates

### Editing existing bhajans (fixing text, tags, collections)

**Nothing to do.** The site automatically re-fetches the sheet and regenerates in the background every hour (`revalidate: 3600`). Changes appear within 60 minutes.

### Adding new bhajans (new rows)

A redeploy is required — `generateStaticParams` only runs at build time, so new bhajan IDs don't get their own pages until the next build.

**Option 1 — Vercel dashboard:** Go to your project → click **Redeploy**. Takes ~1 minute.

**Option 2 — Deploy Hook (recommended for frequent updates):**
1. Vercel dashboard → Settings → Git → **Deploy Hooks**
2. Create a hook named "Sheet update", copy the URL
3. After adding new bhajans to the sheet, trigger a rebuild:
   ```bash
   curl -X POST https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_URL
   ```
   Or simply open the hook URL in a browser tab.

| What changed in the sheet | Action needed |
|--------------------------|---------------|
| Edited existing bhajan text / tags / collections | None — auto-refreshes within 1 hour |
| Added new bhajans (new rows) | Redeploy on Vercel |
| Added new lyricist | Redeploy on Vercel |

---

## Deploying to Vercel

1. Push to GitHub (already done)
2. Go to https://vercel.com/new → import `ashishparnami001/parnamibhajans`
3. Add environment variables:
   - `BHAJANS_CSV_URL` — bhajans CSV export URL
   - `AUTHORS_CSV_URL` — lyricists CSV export URL
4. Deploy — site goes live in ~1 minute
5. Add custom domain `parnamibhajans.in` in Vercel project settings

---

## Project Structure

```
app/
├── page.tsx                  # Home — keyword cloud + recent bhajans
├── bhajans/
│   ├── page.tsx              # Browse all bhajans
│   └── [id]/page.tsx         # Bhajan detail — full text, font controls
├── authors/
│   ├── page.tsx              # Lyricists list
│   └── [id]/page.tsx         # Lyricist detail
├── collections/
│   ├── page.tsx              # Collections list
│   └── [slug]/page.tsx       # Collection detail
├── search/page.tsx           # Search results (Fuse.js)
└── about/page.tsx            # About page

components/
├── BhajanCard.tsx            # Bhajan preview card
├── SearchBar.tsx             # Text + voice search input
├── SearchResults.tsx         # Fuse.js results display
├── KeywordCloud.tsx          # Tag frequency cloud
├── BrowseFilters.tsx         # Author / year / collection filters
├── BottomNav.tsx             # Mobile sticky bottom navigation
├── DesktopNav.tsx            # Desktop header navigation
├── FontSizeControl.tsx       # A− / A+ reading size controls
├── WakeLockButton.tsx        # Keep screen on while reading
├── ShareButton.tsx           # Native share / copy link
└── DarkModeToggle.tsx        # Dark mode toggle

lib/
├── types.ts                  # Bhajan, Author TypeScript interfaces
├── config.ts                 # Sheet URLs, site constants
├── fetchSheets.ts            # CSV fetch + parse
└── search.ts                 # Fuse.js index + tag frequencies
```
