#!/usr/bin/env python3
"""
Convert a Word table typed in the legacy DevLys 010 font into Unicode CSV files.

DevLys (like Kruti Dev) stores Latin letters and draws them as Devanagari, so
copy-paste gives garbage. This script reads the .docx directly, converts only
the runs whose font is DevLys, and writes the CSVs the site reads.

Expected table columns: number | title | lyrics | tarz | section

Usage:
    python3 scripts/devlys_docx_to_csv.py "data/NIJANAND BAJNA  WALI BHAG 2 (1).docx" \
        --lyricist "श्रीमती स्वर्ण आहूजा" --out data

Output:
    <out>/bhajans.csv    id,title,tarz,text,author_id,date,year,tags,collections,search_keywords,youtube_url
                         (section column -> tags; every bhajan -> --collection)
    <out>/lyricists.csv  id,name,bio,photo_url,contact

Standard library only.
"""

import argparse
import csv
import re
import sys
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

try:  # safer parser for untrusted XML; falls back to the standard library
    from defusedxml.ElementTree import fromstring as parse_xml
except ImportError:
    parse_xml = ET.fromstring

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
DEVLYS_FONT = 'DevLys 010'
REPH = ''  # placeholder for the reph sign, moved in post-processing

# Keys are DevLys characters, values are Unicode. devlys_to_unicode() tries the longest key first.
MAPPING = {
    # vowels
    'v': 'अ', 'vk': 'आ', 'vks': 'ओ', 'vkS': 'औ', 'vkW': 'ऑ', 'b': 'इ', 'bZ': 'ई',
    'm': 'उ', 'Å': 'ऊ', ',': 'ए', ',s': 'ऐ', ',S': 'ऐ',
    # consonants
    'd': 'क', '[k': 'ख', 'x': 'ग', '?k': 'घ', '³': 'ङ', 'p': 'च', 'N': 'छ',
    't': 'ज', '>': 'झ', '¥': 'ञ', 'V': 'ट', 'B': 'ठ', 'M': 'ड', '<': 'ढ',
    '.k': 'ण', 'r': 'त', 'Fk': 'थ', 'n': 'द', '/k': 'ध', 'u': 'न', 'i': 'प',
    'Q': 'फ', 'c': 'ब', 'Hk': 'भ', 'e': 'म', ';': 'य', 'j': 'र', 'y': 'ल',
    'o': 'व', "'k": 'श', '"k': 'ष', 'l': 'स', 'g': 'ह', 'G': 'ळ',
    # conjunct glyphs
    # 'Ù' is a half glyph: the following 'k' draws the bar, so 'Ùk' is the full त्त.
    'K': 'ज्ञ', 'J': 'श्र', '=': 'त्र', 'Ø': 'क्र', 'Ùk': 'त्त', 'Ù': 'त्त्', '}': 'द्व',
    'ã': 'ह्म', 'â': 'हृ', 'Ý': 'ग्र', '{k': 'क्ष', '{': 'क्ष्', ':': 'रू',
    # half forms (consonant + halant)
    'D': 'क्', '[': 'ख्', 'X': 'ग्', '?': 'घ्', 'P': 'च्', 'T': 'ज्', 'U': 'न्',
    'I': 'प्', 'C': 'ब्', 'H': 'भ्', 'E': 'म्', 'Y': 'ल्', 'O': 'व्', 'L': 'स्',
    'R': 'त्', 'F': 'थ्', '/': 'ध्', "'": 'श्', '"': 'ष्', '\xb8': 'य्', '.': 'ण्',
    # vowel signs and marks
    'k': 'ा', 'f': 'ि', 'h': 'ी', 'q': 'ु', 'w': 'ू', 's': 'े', 'S': 'ै',
    'ks': 'ो', 'kS': 'ौ', 'kW': 'ॉ', 'W': 'ॉ', 'a': 'ं', '¡': 'ँ', '%': 'ः', '`': 'ृ',
    '~': '्', 'z': '्र', '+': '़', 'Z': REPH,
    # punctuation
    ']': ',', '-': '.', '&': '-', 'A': '।', '*': '-', '^': '-', '·': '.',
}

# Mistakes in the source document that repeat often: the author typed 'f' where
# the shifted 'F' (half थ) was meant, so "प्राणनाथ" came out as "प्राणनािा".
KNOWN_TYPOS = {'प्राणनािा': 'प्राणनाथ'}

_MAX_KEY = max(len(k) for k in MAPPING)

_CONSONANT = '[क-ह]़?'
_CLUSTER = f'(?:{_CONSONANT}्)*{_CONSONANT}'
_VOWEL_SIGNS = '[ा-ौॉॢ]'
_IMATRA_RE = re.compile(f'ि({_CLUSTER})')
_REPH_RE = re.compile(f'({_CLUSTER})({_VOWEL_SIGNS}*){REPH}')


def devlys_to_unicode(text: str) -> str:
    out = []
    i = 0
    while i < len(text):
        for size in range(min(_MAX_KEY, len(text) - i), 0, -1):
            piece = MAPPING.get(text[i:i + size])
            if piece is not None:
                out.append(piece)
                i += size
                break
        else:
            out.append(text[i])  # not a DevLys glyph (space, digit, ...): keep
            i += 1

    result = ''.join(out)
    # The i-matra is typed before the consonant but written after it.
    result = _IMATRA_RE.sub(r'\1ि', result)
    # The reph is typed after the syllable but written before its consonant.
    result = _REPH_RE.sub(lambda m: 'र्' + m.group(1) + m.group(2), result)
    result = result.replace(REPH, 'र्')
    # Typists often enter the sign order that merely looks right in DevLys.
    result = re.sub('्([ा-ौ])', r'\1', result)  # ख्े -> खे (the 'k' bar was left out)
    result = re.sub('([ा-ौ]+)़', r'़\1', result)  # ेे़ -> ़े (nukta goes first)
    result = re.sub('([ँं])([ा-ौ])', r'\2\1', result)  # ंी -> ीं
    result = result.replace('ेा', 'ो').replace('ैा', 'ौ')  # ेा -> ो
    # '-' is a full stop in DevLys, but between two letters it was a hyphen: रोम-रोम
    result = re.sub('([ऀ-ॿ])\\.([ऀ-ॿ])', r'\1-\2', result)
    for typo, fixed in KNOWN_TYPOS.items():
        result = result.replace(typo, fixed)
    return unicodedata.normalize('NFC', result)


# ---------------------------------------------------------------- docx reading

def _run_font(run: ET.Element):
    fonts = run.find(f'{W}rPr/{W}rFonts')
    return fonts.get(f'{W}ascii') if fonts is not None else None


def _run_text(run: ET.Element) -> str:
    parts = []
    for node in run:
        if node.tag == f'{W}t':
            parts.append(node.text or '')
        elif node.tag == f'{W}tab':
            parts.append('\t')
        elif node.tag == f'{W}br':
            parts.append('\n')
    return ''.join(parts)


def paragraph_text(paragraph: ET.Element) -> str:
    # Merge neighbouring DevLys runs first: a syllable can be split across runs.
    segments = []  # [is_devlys, text]
    for run in paragraph.iter(f'{W}r'):
        text = _run_text(run)
        if not text:
            continue
        is_devlys = _run_font(run) == DEVLYS_FONT
        if segments and segments[-1][0] == is_devlys:
            segments[-1][1] += text
        else:
            segments.append([is_devlys, text])
    return ''.join(devlys_to_unicode(t) if d else t for d, t in segments)


def read_table_rows(docx_path: Path):
    """Return the first table as a list of rows; each cell is a list of paragraphs."""
    with zipfile.ZipFile(docx_path) as z:
        root = parse_xml(z.read('word/document.xml'))
    table = root.find(f'.//{W}tbl')
    if table is None:
        sys.exit('No table found in the document.')
    rows = []
    for tr in table.findall(f'{W}tr'):
        cells = []
        for tc in tr.findall(f'{W}tc'):
            paragraphs = [paragraph_text(p).strip() for p in tc.findall(f'{W}p')]
            cells.append([p for p in paragraphs if p])
        rows.append(cells)
    return rows


# ------------------------------------------------------------------- CSV output

BHAJAN_COLUMNS = ['id', 'title', 'tarz', 'text', 'author_id', 'date', 'year',
                  'tags', 'collections', 'search_keywords', 'youtube_url']
LYRICIST_COLUMNS = ['id', 'name', 'bio', 'photo_url', 'contact']
LATIN_LETTER = re.compile('[A-Za-z]')


def _one_line(paragraphs):
    return re.sub(r'\s+', ' ', ' '.join(paragraphs)).strip()


# Used when the section cell is empty.
DEFAULT_SECTION = 'भजन'

# Typos in the section column of the source document.
SECTION_TYPOS = {'भनज': 'भजन'}


def _section_name(paragraphs):
    # "वन्दना-1", "भजन 32", "भजन -", "144 भजन" -> "वन्दना", "भजन": a serial number
    # before or after the name is dropped.
    name = re.sub(r'^\d+\s*', '', _one_line(paragraphs))
    name = re.sub(r'\s*-?\s*\d*\s*$', '', name)
    return SECTION_TYPOS.get(name, name) or DEFAULT_SECTION


def build_bhajans(rows, author_id: int, collection: str):
    bhajans, problems = [], []
    seen_ids = set()
    for position, cells in enumerate(rows[1:], start=2):  # row 1 is the header
        if len(cells) < 5:
            problems.append(f'row {position}: expected 5 columns, found {len(cells)}')
            continue
        number, title, lyrics, tarz, section = cells[:5]
        bhajan_id = _one_line(number)
        if not bhajan_id.isdigit():
            problems.append(f'row {position}: number {bhajan_id!r} is not an integer')
            continue
        if bhajan_id in seen_ids:
            problems.append(f'row {position}: duplicate id {bhajan_id}')
        seen_ids.add(bhajan_id)

        record = {
            'id': bhajan_id,
            'title': _one_line(title),
            'tarz': _one_line(tarz),
            'text': '\n'.join(lyrics),
            'author_id': author_id,
            'date': '', 'year': '',
            'tags': _section_name(section),  # भजन, वन्दना, कव्वाली, ... are search tags
            'collections': collection,       # the book all these bhajans come from
            'search_keywords': '', 'youtube_url': '',
        }
        if not record['title'] and record['text']:
            record['title'] = _one_line(lyrics[:1])
            problems.append(f'row {position} (id {bhajan_id}): empty title, used the first lyric line')
        if not record['text']:
            problems.append(f'row {position} (id {bhajan_id}): empty lyrics')
        leftovers = {c for c in LATIN_LETTER.findall(
            ' '.join(str(record[k]) for k in ('title', 'tarz', 'text', 'tags')))}
        if leftovers:
            problems.append(f'row {position} (id {bhajan_id}): unconverted Latin letters '
                            f'{"".join(sorted(leftovers))}')
        bhajans.append(record)
    return bhajans, problems


def write_csv(path: Path, columns, records):
    with path.open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(records)


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('docx', type=Path)
    parser.add_argument('--lyricist', required=True, help='name used for every bhajan')
    parser.add_argument('--collection', default='Bhajnawali 1',
                        help='collection name used for every bhajan (the book)')
    parser.add_argument('--out', type=Path, default=Path('data'))
    args = parser.parse_args()

    rows = read_table_rows(args.docx)
    bhajans, problems = build_bhajans(rows, author_id=1, collection=args.collection)

    args.out.mkdir(parents=True, exist_ok=True)
    write_csv(args.out / 'bhajans.csv', BHAJAN_COLUMNS, bhajans)
    write_csv(args.out / 'lyricists.csv', LYRICIST_COLUMNS,
              [{'id': 1, 'name': args.lyricist, 'bio': '', 'photo_url': '', 'contact': ''}])

    print(f'Wrote {len(bhajans)} bhajans to {args.out / "bhajans.csv"}')
    print(f'Wrote 1 lyricist to {args.out / "lyricists.csv"}')
    if problems:
        print(f'\n{len(problems)} item(s) to review:')
        for p in problems:
            print('  -', p)


if __name__ == '__main__':
    main()
