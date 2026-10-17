"""Run with:  python3 -m unittest scripts/test_devlys.py"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from devlys_docx_to_csv import devlys_to_unicode as c, _section_name  # noqa: E402


class SectionName(unittest.TestCase):
    def test_serial_numbers_and_typos_are_removed(self):
        cases = {
            'वन्दना-1': 'वन्दना', 'भजन 32': 'भजन', 'भजन -': 'भजन', '144 भजन': 'भजन',
            'भनज': 'भजन', 'कव्वाली': 'कव्वाली', '': 'भजन',
        }
        for source, expected in cases.items():
            with self.subTest(source=source):
                self.assertEqual(_section_name([source]), expected)


class DevlysToUnicode(unittest.TestCase):
    def test_lines_seen_in_the_document(self):
        self.assertEqual(c("'kkek 'kke gks] /kuh /kke gks]"), 'शामा शाम हो, धनी धाम हो,')
        self.assertEqual(c('rsjs pj.kksa esa esjk iz.kke gks'), 'तेरे चरणों में मेरा प्रणाम हो')
        self.assertEqual(c('pj.k dey ij okjh js okjh] bu pj.kksa ls fulcr gekjh'),
                         'चरण कमल पर वारी रे वारी, इन चरणों से निसबत हमारी')

    def test_words(self):
        cases = {
            'izse': 'प्रेम', 'fe=': 'मित्र', 'Jh': 'श्री', 'Kku': 'ज्ञान', 've`r': 'अमृत',
            'tksM+h': 'जोड़ी', 'mÙke': 'उत्तम', 'czãKku': 'ब्रह्मज्ञान', 'Lo:i': 'स्वरूप',
            "vn~Hkqr": 'अद्भुत', "bZ'oj": 'ईश्वर', 'ân;': 'हृदय', 'fuR;': 'नित्य',
            'oUnuk&1': 'वन्दना-1', 'gSA': 'है।', 'ØhM+k': 'क्रीड़ा', 'v}Sr': 'अद्वैत',
            ',Sjk': 'ऐरा', 'ns[s': 'देखे', 'tsMs+': 'जेड़े', 'v[k.M': 'अखण्ड', 'lk{kkr~': 'साक्षात्', 'izkr%': 'प्रातः', 'xkWM': 'गॉड', 'gS¡': 'हैँ',
        }
        for source, expected in cases.items():
            with self.subTest(source=source):
                self.assertEqual(c(source), expected)

    def test_reph_moves_before_the_consonant(self):
        self.assertEqual(c('/keZ'), 'धर्म')
        self.assertEqual(c('iw.kZ'), 'पूर्ण')
        self.assertEqual(c('dk;Z'), 'कार्य')
        self.assertEqual(c('Lo.kZ'), 'स्वर्ण')

    def test_imatra_moves_after_the_conjunct(self):
        self.assertEqual(c('fnu'), 'दिन')
        self.assertEqual(c('f"V'), 'ष्टि')
        self.assertEqual(c('l`f"V'), 'सृष्टि')
        self.assertEqual(c('fo"k'), 'विष')

    def test_non_devlys_text_is_kept(self):
        self.assertEqual(c('1 2 3'), '1 2 3')


if __name__ == '__main__':
    unittest.main()
