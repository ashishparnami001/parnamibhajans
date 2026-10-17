// Devanagari -> Roman transliteration plus a phonetic "fold" so that the many
// ways people type a Hindi word in English map to one search key.
//   वाणी -> vaanii -> vani      Vaani / Waani / Wani / Vanee -> vani

const CONSONANTS: Record<string, string> = {
  क: 'k', ख: 'kh', ग: 'g', घ: 'gh', ङ: 'n',
  च: 'ch', छ: 'chh', ज: 'j', झ: 'jh', ञ: 'n',
  ट: 't', ठ: 'th', ड: 'd', ढ: 'dh', ण: 'n',
  त: 't', थ: 'th', द: 'd', ध: 'dh', न: 'n',
  प: 'p', फ: 'ph', ब: 'b', भ: 'bh', म: 'm',
  य: 'y', र: 'r', ल: 'l', ळ: 'l', व: 'v',
  श: 'sh', ष: 'sh', स: 's', ह: 'h',
}

// Consonant + nukta (़), e.g. ज़ -> z
const NUKTA_CONSONANTS: Record<string, string> = {
  क: 'q', ख: 'kh', ग: 'g', ज: 'z', ड: 'r', ढ: 'rh', फ: 'f', य: 'y',
}

const VOWELS: Record<string, string> = {
  अ: 'a', आ: 'aa', इ: 'i', ई: 'ii', उ: 'u', ऊ: 'uu', ऋ: 'ri',
  ए: 'e', ऐ: 'ai', ओ: 'o', औ: 'au', ऑ: 'o', ऍ: 'e',
}

const MATRAS: Record<string, string> = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ii', 'ु': 'u', 'ू': 'uu', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॉ': 'o', 'ॅ': 'e',
}

const MARKS: Record<string, string> = { 'ं': 'n', 'ँ': 'n', 'ः': 'h' }

const VIRAMA = '्'
const NUKTA = '़'

function isDevanagari(ch: string | undefined): boolean {
  if (ch === undefined) return false
  const code = ch.charCodeAt(0)
  return code >= 0x0900 && code <= 0x097f
}

// The danda (। ॥) and Devanagari digits end a word for schwa deletion.
function endsWord(ch: string | undefined): boolean {
  if (!isDevanagari(ch)) return true
  const code = (ch as string).charCodeAt(0)
  return code === 0x0964 || code === 0x0965 || (code >= 0x0966 && code <= 0x096f)
}

// Anything that is not a consonant: independent vowels, marks, digits, and
// Latin text (lowercased, diacritics removed).
function passthrough(ch: string): string {
  if (VOWELS[ch] !== undefined) return VOWELS[ch]
  if (MARKS[ch] !== undefined) return MARKS[ch]
  if (MATRAS[ch] !== undefined) return MATRAS[ch]
  if (ch === 'ऽ' || ch === VIRAMA || ch === NUKTA) return ''
  if (ch === 'ॐ') return 'om'
  if (ch === '।' || ch === '॥') return ' '
  const code = ch.charCodeAt(0)
  if (code >= 0x0966 && code <= 0x096f) return String(code - 0x0966)
  if (isDevanagari(ch) || code === 0x200c || code === 0x200d) return ''
  return ch.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function toRoman(text: string): string {
  const s = text.normalize('NFC')
  let out = ''
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (CONSONANTS[ch] === undefined) {
      out += passthrough(ch)
      i++
      continue
    }

    let base = CONSONANTS[ch]
    i++
    if (s[i] === NUKTA) {
      base = NUKTA_CONSONANTS[ch] ?? base
      i++
    }
    // ज्ञ is pronounced "gy" in Hindi
    if (ch === 'ज' && s[i] === VIRAMA && s[i + 1] === 'ञ') {
      base = 'gy'
      i += 2
    }

    const next = s[i]
    if (next === VIRAMA) {
      out += base
      i++
    } else if (MATRAS[next] !== undefined) {
      out += base + MATRAS[next]
      i++
    } else if (endsWord(next)) {
      out += base // schwa deletion at the end of a word: कमल -> kamal
    } else {
      out += base + 'a'
    }
  }
  return out
}

// Collapse the spelling variants people use when typing Hindi in English.
export function foldRoman(text: string): string {
  const folded = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/sh/g, 's')
    .replace(/ch+/g, 'c')
    .replace(/([kgjtdpb])h/g, '$1')
    .replace(/w/g, 'v')
    .replace(/z/g, 'j')
    .replace(/q/g, 'k')
    .replace(/f/g, 'p')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/(.)\1+/g, '$1')

  return folded
    .split(/\s+/)
    .filter(Boolean)
    .map(word => (word.length > 2 && word.endsWith('a') ? word.slice(0, -1) : word))
    .join(' ')
}

// One key for Devanagari and Roman text alike.
export function toSearchKey(text: string): string {
  return foldRoman(toRoman(text))
}
