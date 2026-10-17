import { toRoman, foldRoman, toSearchKey } from '@/lib/transliterate'

describe('toRoman', () => {
  it('drops the inherent vowel at the end of a word', () => {
    expect(toRoman('कमल')).toBe('kamal')
    expect(toRoman('राम')).toBe('raam')
  })

  it('keeps the inherent vowel inside a word', () => {
    expect(toRoman('हनुमान')).toBe('hanumaan')
  })

  it('handles conjuncts, matras, and anusvara', () => {
    expect(toRoman('कृष्ण')).toBe('krishn')
    expect(toRoman('श्याम')).toBe('shyaam')
    expect(toRoman('गोविंद')).toBe('govind')
    expect(toRoman('ज्ञान')).toBe('gyaan')
  })

  it('handles nukta consonants', () => {
    expect(toRoman('ज़िंदगी')).toBe('zindagii')
  })

  it('passes Latin text through in lowercase, without diacritics', () => {
    expect(toRoman('Ram Sita')).toBe('ram sita')
    expect(toRoman('Śyām')).toBe('syam')
  })

  it('treats the danda as a word break', () => {
    expect(toRoman('राम।सीता')).toBe('raam siitaa')
  })
})

describe('foldRoman', () => {
  it('folds long vowels, w/v and aspirates', () => {
    expect(foldRoman('Vaani')).toBe('vani')
    expect(foldRoman('Waani')).toBe('vani')
    expect(foldRoman('Radhe')).toBe('rade')
    expect(foldRoman('Shyam')).toBe('syam')
  })

  it('ignores punctuation and extra spaces', () => {
    expect(foldRoman('  Ram,   Sita! ')).toBe('ram sit')
  })

  it('returns an empty string for empty input', () => {
    expect(foldRoman('')).toBe('')
  })
})

describe('toSearchKey', () => {
  it('maps every common English spelling of वाणी to one key', () => {
    const key = toSearchKey('वाणी')
    for (const typed of ['Vaani', 'Waani', 'Wani', 'Vani', 'Vaanee', 'Vanee']) {
      expect(toSearchKey(typed)).toBe(key)
    }
  })

  it.each([
    ['हनुमान', 'Hanuman'],
    ['कृष्ण', 'Krishna'],
    ['सीता', 'Seeta'],
    ['राधे', 'Radhe'],
    ['गोविंद', 'Govind'],
    ['श्याम', 'Shyam'],
    ['स्वर्णा', 'Swarna'],
  ])('maps %s to the same key as %s', (hindi, english) => {
    expect(toSearchKey(hindi)).toBe(toSearchKey(english))
  })

  it('keeps multi-word titles as separate words', () => {
    expect(toSearchKey('राम नाम').split(' ')).toHaveLength(2)
  })
})
