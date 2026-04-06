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
