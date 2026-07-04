/**
 * phonemeAudioMap.ts
 * Dictionary mapping visual phoneme notations (IPA and ASCII representations)
 * to child-friendly descriptive sounds for Text-to-Speech (TTS) and screen readers.
 */

export const PHONEME_AUDIO_MAP: Record<string, string> = {
  // Consonants (IPA & standard notations)
  '/p/': 'puh',
  '/b/': 'buh',
  '/t/': 'tuh',
  '/d/': 'duh',
  '/k/': 'kuh',
  '/g/': 'guh',
  '/f/': 'fff',
  '/v/': 'vvv',
  '/θ/': 'th (thin)',
  '/ð/': 'th (this)',
  '/s/': 'sss',
  '/z/': 'zzz',
  '/ʃ/': 'sh',
  '/ʒ/': 'zh',
  '/h/': 'huh',
  '/tʃ/': 'ch',
  '/dʒ/': 'j',
  '/m/': 'mmm',
  '/n/': 'nnn',
  '/ŋ/': 'ng',
  '/l/': 'lll',
  '/r/': 'ruh',
  '/j/': 'yuh',
  '/w/': 'wuh',

  // Monophthongs
  '/iː/': 'ee',
  '/ɪ/': 'ih',
  '/e/': 'eh',
  '/æ/': 'aa',
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

  // Additional ASCII / app-specific phoneme representations used in games
  '/c/': 'kuh',
  '/x/': 'ks',
  '/sh/': 'sh',
  '/ch/': 'ch',
  '/th/': 'th',
  '/ee/': 'ee',
  '/oo/': 'oo',
  '/ue/': 'oo',
  '/ae/': 'ay',
  '/ie/': 'eye',
  '/ah/': 'ah',
  '/ow/': 'ow',
  '/ai/': 'ay',
  '/oe/': 'oh',
  '/a/': 'aa',
  '/i/': 'ih',
  '/u/': 'uh',
  '/o/': 'o'
};

export default PHONEME_AUDIO_MAP;
