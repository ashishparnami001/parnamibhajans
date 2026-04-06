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
