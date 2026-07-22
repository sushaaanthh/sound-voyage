/**
 * phonemeAudioMap.ts
 * Dictionary mapping visual phoneme notations (IPA and ASCII representations)
 * to child-friendly descriptive sounds for Text-to-Speech (TTS) and screen readers.
 */

export const PHONEME_AUDIO_MAP: Record<string, string> = {
  // Single Consonants & Alphabet Sounds
  '/p/': 'puh',
  '/b/': 'buh',
  '/t/': 'tuh',
  '/d/': 'duh',
  '/k/': 'ka',
  '/f/': 'fuh',
  '/v/': 'vuh',
  '/θ/': 'th',
  '/ð/': 'dhuh',
  '/s/': 'suh',
  '/z/': 'zuh',
  '/ʃ/': 'sha',
  '/ʒ/': 'zha',
  '/h/': 'huh',
  '/tʃ/': 'ch',
  '/dʒ/': 'juh',
  '/m/': 'muh',
  '/n/': 'nah',
  '/l/': 'luh',
  '/ŋ/': 'ng',
  '/r/': 'ruh',

  // Variant Keys for Conditional Sounds
  '/c_hard/': 'kuh',
  '/c_soft/': 'suh',
  '/g_hard/': 'guh',
  '/g_soft/': 'juh',
  '/i_ai/': 'ai',
  '/i_ee/': 'yee',
  '/j_juh/': 'juh',
  '/j_yuh/': 'yuh',
  '/o_aww/': 'o',
  '/o_oo/': 'oo',
  '/o_oh/': 'oh',
  '/q_kuh/': 'kuh',
  '/q_kyuh/': 'kyuh',
  '/u_yuu/': 'yuu',
  '/u_uh/': 'uh',
  '/u_oo/': 'oo',
  '/w_wuh/': 'wuh',
  '/w_vuh/': 'vuh',
  '/x_ksuh/': 'ksuh',
  '/x_zuh/': 'zuh',
  '/x_kzuh/': 'kzuh',
  '/y_yuh/': 'yuh',
  '/y_ya/': 'ya',

  // Single Vowels & Monophthongs
  '/a/': 'ah',
  '/a_short/': 'ah',
  '/e/': 'ee',
  '/i/': 'ih',
  '/i_short/': 'ih',
  '/iː/': 'yee',
  '/ɪ/': 'ih',
  '/æ/': 'ah',
  '/ɑː/': 'ah',
  '/ɒ/': 'o',
  '/ɔː/': 'aw',
  '/ʊ/': 'uu',
  '/uː/': 'oo',
  '/ʌ/': 'uh',
  '/ɜː/': 'er',
  '/ə/': 'uh',

  // Diphthongs
  '/eɪ/': 'ay',
  '/aɪ/': 'eye',
  '/ɔɪ/': 'oy',
  '/aʊ/': 'ow',
  '/əʊ/': 'oh',
  '/oʊ/': 'oh',
  '/ɪə/': 'eer',
  '/eə/': 'air',
  '/ʊə/': 'oor',

  // Two-consonant clusters (blends)
  '/bl/': 'bluh',
  '/br/': 'bruh',
  '/cl/': 'cluh',
  '/cr/': 'cruh',
  '/dr/': 'druh',
  '/fl/': 'fluh',
  '/fr/': 'fruh',
  '/gl/': 'gluh',
  '/gr/': 'gruh',
  '/pl/': 'pluh',
  '/pr/': 'pruh',
  '/sl/': 'sluh',
  '/sm/': 'smuh',
  '/sn/': 'snuh',
  '/sp/': 'spuh',
  '/st/': 'stuh',
  '/sk/': 'skuh',
  '/sw/': 'swuh',
  '/tr/': 'truh',
  '/tw/': 'twuh',
  '/dw/': 'dwuh',
  '/kw/': 'kwuh',
  '/gw/': 'gwuh',
  '/ʃr/': 'shruh',
  '/θr/': 'thruh',
  '/sf/': 'sfuh',
  '/sv/': 'svuh',

  // Three-consonant clusters
  '/spl/': 'spluh',
  '/spr/': 'spruh',
  '/str/': 'struh',
  '/skr/': 'skruh',
  '/skw/': 'skwuh',
  '/skl/': 'skluh',

  // Common ending clusters
  '/mp/': 'mp',
  '/nd/': 'nd',
  '/nt/': 'nt',
  '/ŋk/': 'nk',
  '/ŋg/': 'ngg',
  '/ld/': 'ld',
  '/lf/': 'lf',
  '/lk/': 'lk',
  '/lp/': 'lp',
  '/lt/': 'lt',
  '/rd/': 'rd',
  '/rk/': 'rk',
  '/rm/': 'rm',
  '/rn/': 'rn',
  '/rp/': 'rp',
  '/rt/': 'rt',
  '/ft/': 'ft',
  '/kt/': 'kt',
  '/ks/': 'x',
  '/ps/': 'ps',
  '/ts/': 'ts',

  // Additional ASCII / app-specific phoneme representations used in games
  '/sh/': 'sha',
  '/ch/': 'ch',
  '/th/': 'th',
  '/ee/': 'yee',
  '/oo/': 'oo',
  '/ue/': 'oo',
  '/ae/': 'ay',
  '/ie/': 'eye',
  '/ah/': 'ah',
  '/ai/': 'ay',
  '/oe/': 'oh'
};

export const WORD_PHONEME_OVERRIDES: Record<string, Record<string, string>> = {
  'dog': {
    '/o/': 'aw' // Will look for '/sounds/aw.mp3' or TTS equivalent instead of default 'o'
  },
  'open': {
    '/o/': 'oh'
  },
  'orange': {
    '/o/': 'o_short'
  }
};

export const getPhonemeAudioStr = (phoneme: string, word?: string): string => {
  // 1. Check if this specific word has an override for this phoneme
  if (word && WORD_PHONEME_OVERRIDES[word.toLowerCase()]?.[phoneme]) {
    return WORD_PHONEME_OVERRIDES[word.toLowerCase()][phoneme];
  }
  // 2. Fallback to the standard map
  return PHONEME_AUDIO_MAP[phoneme] || phoneme;
};

export default PHONEME_AUDIO_MAP;
