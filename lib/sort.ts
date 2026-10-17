import { Bhajan } from './types'

// Newest first. A bhajan with no valid date counts as oldest, and bhajans with
// the same date keep their book order (by id). Works on full bhajans and on the
// slimmer summaries used by the browse page.
export function compareNewestFirst(
  a: Pick<Bhajan, 'id' | 'date'>,
  b: Pick<Bhajan, 'id' | 'date'>
): number {
  const timeA = Date.parse(a.date) || 0
  const timeB = Date.parse(b.date) || 0
  return timeB - timeA || a.id - b.id
}
