# Google Sheet Setup

**Spreadsheet:** https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I

## Tabs

### `bhajans` (gid=0)

Columns: `id | title | text | author_id | date | year | tags | collections | search_keywords | youtube_url`

- `id`: unique number (1, 2, 3, ...)
- `title`: Hindi title in Devanagari, e.g. `राम नाम`
- `text`: full bhajan lyrics — use newlines within the cell for line breaks
- `author_id`: FK to `authors.id`
- `date`: ISO date, e.g. `2020-01-15`
- `year`: just the year number, e.g. `2020`
- `tags`: comma-separated Hindi keywords, e.g. `राम,सीता`
- `collections`: comma-separated group names, e.g. `प्रभात भजन,होली विशेष`
- `search_keywords`: space-separated Hinglish/romanized synonyms, e.g. `ram sita`
- `youtube_url`: leave empty until a video is available

### `authors` (gid = check URL when tab is selected)

Columns: `id | name | bio | photo_url | contact`

- `id`: unique number
- `name`: author name in Devanagari, e.g. `स्वर्णा पारनामी`
- `bio`: short biography (optional)
- `photo_url`: link to photo (Google Drive or CDN) — optional
- `contact`: email / phone / social handle — optional

## Sample Data

### `authors` tab
```
id | name             | bio          | photo_url | contact
1  | स्वर्णा पारनामी  | भजन रचयिता  |           |
```

### `bhajans` tab
```
id | title       | text                  | author_id | date       | year | tags       | collections              | search_keywords | youtube_url
1  | राम नाम     | राम राम सीता राम      | 1         | 2020-01-15 | 2020 | राम,सीता   | प्रभात भजन               | ram sita        |
2  | कृष्ण लीला  | हरे कृष्ण हरे राम    | 1         | 2021-03-10 | 2021 | कृष्ण      | होली विशेष               | krishna govind  |
3  | शिव भजन     | ओम नमः शिवाय          | 1         | 2022-08-15 | 2022 | शिव        | प्रभात भजन               | shiv om         |
```

## Making the Sheet Public

File → Share → Share with others → Change to "Anyone with the link" → Viewer → Done.

## Connecting to the Site

After setting up the sheet and making it public:

1. Click the `authors` tab — note the `gid=XXXXXXX` in the URL
2. Create `.env.local` in the project root (never commit this file):

```
BHAJANS_CSV_URL=https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I/export?format=csv&gid=0
AUTHORS_CSV_URL=https://docs.google.com/spreadsheets/d/1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I/export?format=csv&gid=XXXXXXX
```

3. Run `npm run dev` — the site will fetch live data from the sheet at [http://localhost:3000](http://localhost:3000)

## Refresh Workflow

Whenever you update the sheet:

1. Push any code changes to GitHub (or trigger a manual redeploy on Vercel)
2. Next.js re-fetches the CSV at build time
3. Updated site goes live in ~1 minute

No database, no API keys, zero ongoing cost beyond the domain.
