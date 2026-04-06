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
