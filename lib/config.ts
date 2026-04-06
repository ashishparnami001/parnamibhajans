export const SHEET_ID = '1m_xPFeWmm4IOZHO84kz2V3gkgrWZ5h2R-7ytIp_0p7I'

export const BHAJANS_CSV_URL =
  process.env.BHAJANS_CSV_URL ??
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`

export const AUTHORS_CSV_URL =
  process.env.AUTHORS_CSV_URL ??
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=GID_HERE`

export const SITE_NAME = 'Parnami Bhajans'
export const SITE_TAGLINE = 'भजन संग्रह'
export const RECENT_BHAJANS_COUNT = 10
