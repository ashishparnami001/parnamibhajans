export const SHEET_ID = '1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I'

// Where the bhajans and lyricists come from, in this order:
//   1. The env var, when it is set: a CSV URL such as a published Google Sheet.
//   2. A local file in data/ (see LOCAL_*_CSV), when the env var is empty.
//   3. The default Google Sheet below, when the local file does not exist.
export const BHAJANS_CSV_URL = process.env.BHAJANS_CSV_URL || ''
export const AUTHORS_CSV_URL = process.env.AUTHORS_CSV_URL || ''

export const LOCAL_BHAJANS_CSV = 'bhajans.csv'
export const LOCAL_AUTHORS_CSV = 'lyricists.csv'

export const DEFAULT_BHAJANS_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`
export const DEFAULT_AUTHORS_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1984021733`

export const SITE_NAME = 'Parnami Bhajans'
export const SITE_TAGLINE = 'भजन संग्रह'
export const RECENT_BHAJANS_COUNT = 10
