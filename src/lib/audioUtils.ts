import { PHONEME_AUDIO_MAP, getPhonemeAudioStr } from '../data/phonemeAudioMap';

export const PHONEME_PRONUNCIATION_MAP: Record<string, string> = {
  // Two-consonant clusters
  '/bl/': 'bla', '/br/': 'bra', '/cl/': 'cla', '/cr/': 'cra', '/dr/': 'dra',
  '/fl/': 'fla', '/fr/': 'fra', '/gl/': 'gla', '/gr/': 'gra', '/pl/': 'pla',
  '/pr/': 'pra', '/sl/': 'sla', '/sm/': 'sma', '/sn/': 'sna', '/sp/': 'spa',
  '/st/': 'sta', '/sk/': 'ska', '/sw/': 'swa', '/tr/': 'tra', '/tw/': 'twa',
  '/dw/': 'dwuh', '/kw/': 'kwuh', '/gw/': 'gwuh', '/ʃr/': 'shruh', '/θr/': 'thruh',
  '/sf/': 'sfuh', '/sv/': 'svuh',

  // Three-consonant clusters
  '/spl/': 'spluh', '/spr/': 'spruh', '/str/': 'struh', '/skr/': 'skruh',
  '/skw/': 'skwuh', '/skl/': 'skluh',

  // Common ending clusters
  '/mp/': 'mp', '/nd/': 'nd', '/nt/': 'nt', '/ŋk/': 'nk', '/ŋg/': 'ngg',
  '/ld/': 'ld', '/lf/': 'lf', '/lk/': 'lk', '/lp/': 'lp', '/lt/': 'lt',
  '/rd/': 'rd', '/rk/': 'rk', '/rm/': 'rm', '/rn/': 'rn', '/rp/': 'rp',
  '/rt/': 'rt', '/ft/': 'ft', '/kt/': 'kt', '/ks/': 'ksa', '/ps/': 'psa',
  '/ts/': 'tsa',

  // Consonants
  '/p/': 'pa', '/b/': 'buh', '/t/': 'ta', '/d/': 'da', '/k/': 'ka',
  '/g/': 'gah', '/f/': 'fa', '/v/': 'va', '/θ/': 'th', '/ð/': 'th',
  '/s/': 'sa', '/z/': 'za', '/ʃ/': 'sha', '/sh/': 'sha', '/ʒ/': 'zha',
  '/h/': 'huh', '/ch/': 'cha', '/dʒ/': 'ja', '/j/': 'ja', '/m/': 'ma',
  '/n/': 'na', '/ŋ/': 'ng', '/l/': 'la', '/r/': 'ra', '/y/': 'yuh',
  '/w/': 'wah',

  // Monophthongs
  '/iː/': 'ee', '/ɪ/': 'ih', '/e/': 'eh', '/æ/': 'aa', '/ɑː/': 'ah',
  '/ɒ/': 'o', '/ɔː/': 'aw', '/ʊ/': 'uu', '/uː/': 'oo', '/ʌ/': 'uh',
  '/ɜː/': 'er', '/ə/': 'uh',

  // Diphthongs
  '/eɪ/': 'ay', '/aɪ/': 'eye', '/ɔɪ/': 'oy', '/aʊ/': 'ow', '/əʊ/': 'oh',
  '/oʊ/': 'oh', '/ɪə/': 'eer', '/eə/': 'air', '/ʊə/': 'oor',

  // Variant Keys for Conditional Sounds
  '/c_hard/': 'kuh', '/c_soft/': 'suh', '/g_hard/': 'guh', '/g_soft/': 'juh',
  '/i_ai/': 'ai', '/i_ee/': 'ee', '/j_juh/': 'juh', '/j_yuh/': 'yuh',
  '/o_aww/': 'aww', '/o_oo/': 'oo', '/o_oh/': 'oh', '/q_kuh/': 'kuh',
  '/q_kyuh/': 'kyuh', '/u_yuu/': 'yuu', '/u_uh/': 'uh', '/u_oo/': 'oo',
  '/w_wuh/': 'wuh', '/w_vuh/': 'vuh', '/x_ksuh/': 'ksuh', '/x_zuh/': 'zuh',
  '/x_kzuh/': 'kzuh', '/y_yuh/': 'yuh', '/y_ya/': 'ya'
};

const phonemeMap: Record<string, string> = {
  // Slash format
  '/k/': ' , ka , ',
  '/ch/': ' , cha , ',
  '/p/': ' , pa , ',
  '/s/': ' , sa , ',
  '/m/': ' , ma , ',
  '/b/': ' , ba , ',
  '/d/': ' , da , ',
  '/f/': ', fa, ',
  '/g/': ' , ga , ',
  '/h/': ', ha, ',
  '/j/': ', ja, ',
  '/l/': ' , la , ',
  '/n/': ', na, ',
  '/r/': ', ra, ',
  '/t/': ' , ta , ',
  '/v/': ', va, ',
  '/w/': ', wa, ',
  '/y/': ', ya, ',
  '/z/': ', zha, ',
  '/sh/': ' , sha , ',
  '/th/': ' , thuh , ',
  '/a/': ', ah, ',
  '/a_short/': ', ah, ',
  '/e/': ', eh, ',
  '/i/': ', ih, ',
  '/i_short/': ', ih, ',
  '/o/': ', ah, ',
  '/u/': ', uh, ',
  '/c/': ' , k-uh , ',
  '/ee/': ' , ee , ',
  '/oo/': ' , oo , ',
  '/ue/': ' , yoo , ',
  '/ae/': ' , ay , ',
  '/ie/': ' , eye , ',
  '/ah/': ' , ah , ',
  '/ow/': ' , ow , ',
  '/ai/': ' , ay , ',
  '/oe/': ' , oh , ',

  // Normal format
  'k': ' , ka , ',
  'ch': ' , chuh , ',
  'p': ' , p-uh , ',
  's': ' , sss , ',
  'm': ' , mmm , ',
  'b': ' , b-uh , ',
  'd': ' , d-uh , ',
  'f': ', fff, ',
  'g': ' , g-uh , ',
  'h': ', huh, ',
  'j': ', juh, ',
  'l': ' , ull , ',
  'n': ', nnn, ',
  'r': ', rrr, ',
  't': ' , t-uh , ',
  'v': ', vvv, ',
  'w': ', wuh, ',
  'y': ', yuh, ',
  'z': ', zzz, ',
  'sh': ' , sha , ',
  'th': ' , thuh , ',
  'a': ', ah, ',
  'e': ', eh, ',
  'i': ', ih, ',
  'o': ', ah, ',
  'u': ', uh, ',
  'c': ' , k-uh , ',
  'ee': ' , ee , ',
  'oo': ' , oo , ',
  'ue': ' , yoo , ',
  'ae': ' , ay , ',
  'ie': ' , eye , ',
  'ah': ' , ah , ',
  'ow': ' , ow , ',
  'ai': ' , ay , ',
  'oe': ' , oh , ',

  // Space-wrapped and special phonetic notations
  ' l ': ' , ull , ',
  ' k ': ' , k-uh , ',
  'll': ' , ull , '
};

let lockedVoice: SpeechSynthesisVoice | null = null;

export const initVoiceLock = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;

  // 1. Filter for Indian English voices
  const indianVoices = voices.filter(v => v.lang === 'en-IN' || v.lang === 'en_IN');

  if (indianVoices.length > 0) {
    // 2. iOS specifically uses "Rishi" for male and "Veena" for female. 
    // Try to explicitly grab Veena, or fallback to the first non-Rishi Indian voice.
    lockedVoice = indianVoices.find(v => v.name.includes('Veena')) ||
      indianVoices.find(v => !v.name.includes('Rishi')) ||
      indianVoices[0];
  } else {
    // Fallback: If no en-IN is installed, grab a generic female English voice
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    lockedVoice = englishVoices.find(v => v.name.includes('Samantha') || v.name.includes('Female')) || englishVoices[0];
  }
};

// iOS Safari requires this event listener because voices load asynchronously
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = initVoiceLock;
  initVoiceLock(); // Call immediately in case they are already loaded
}

/**
 * Translates phonetic cues and slash-wrapped phonemes into hacked spellings 
 * to force standard TTS engines to make the correct sounds.
 */
export function translateText(text: string): string {
  const trimmed = text.trim();
  const normalized = trimmed.toLowerCase();

  // 0. Intercept exact phoneme notation from PHONEME_AUDIO_MAP with prosodic pauses
  if (PHONEME_AUDIO_MAP[trimmed]) {
    return `, ${PHONEME_AUDIO_MAP[trimmed]}, `;
  }
  if (PHONEME_AUDIO_MAP[text]) {
    return `, ${PHONEME_AUDIO_MAP[text]}, `;
  }

  // 1. Direct match check (trim outer commas/spaces for isolated option words)
  if (phonemeMap[normalized]) {
    return phonemeMap[normalized].replace(/^[\s,]+|[\s,]+$/g, '');
  }

  // 2. Slash-wrapped core checks (trim outer commas/spaces for isolated option words)
  if (normalized.startsWith('/') && normalized.endsWith('/')) {
    const core = normalized.slice(1, -1);
    if (phonemeMap[core]) {
      return phonemeMap[core].replace(/^[\s,]+|[\s,]+$/g, '');
    }
  }

  // 3. Replace all phonetic keys in the sentence dynamically
  let translated = text;

  // First replace phoneme notations using PHONEME_AUDIO_MAP with prosodic breaks
  const audioMapKeys = Object.keys(PHONEME_AUDIO_MAP).sort((a, b) => b.length - a.length);
  for (const key of audioMapKeys) {
    const pauseFormattedSound = `, ${PHONEME_AUDIO_MAP[key]}, `;
    if (key.startsWith('/') && key.endsWith('/')) {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      translated = translated.replace(regex, pauseFormattedSound);
    } else {
      translated = translated.split(key).join(pauseFormattedSound);
    }
  }

  // Sort keys by length descending to replace longer/more specific patterns first
  const keys = Object.keys(phonemeMap).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    const value = phonemeMap[key];
    let regex: RegExp;

    if (key.startsWith('/') && key.endsWith('/')) {
      // Escape for regex and match globally (case-insensitive)
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(escaped, 'gi');
    } else if (key.startsWith(' ') && key.endsWith(' ')) {
      // Space-wrapped keys: match exactly with spaces
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(escaped, 'gi');
    } else {
      // Word boundary for other keys to prevent matching inside words
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    }

    translated = translated.replace(regex, value);
  }

  return translated;
}

/**
 * Speaks the text aloud using SpeechSynthesis, canceling existing playbacks,
 * translating phonemes, and targeting the en-IN voice.
 */
export function playAudio(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    wordContext?: string;
  },
  wordContext?: string
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    options?.onEnd?.();
    return null;
  }

  // Cancel ongoing speech gracefully to handle rapid clicks
  window.speechSynthesis.cancel();

  // Check the comprehensive dictionary first
  // Trims any accidental whitespace and checks for a direct match
  const lookupKey = text.trim();
  const directMatch = PHONEME_PRONUNCIATION_MAP[lookupKey] || PHONEME_PRONUNCIATION_MAP[lookupKey.toLowerCase()];

  let sanitizedText: string;
  if (directMatch) {
    sanitizedText = directMatch;
  } else {
    const targetWord = wordContext || options?.wordContext || '';
    const exactSound = getPhonemeAudioStr(lookupKey, targetWord);
    sanitizedText = (exactSound && exactSound !== lookupKey && exactSound !== text)
      ? `, ${exactSound}, `
      : translateText(lookupKey);
  }

  const spokenText = sanitizedText.toLowerCase();

  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.rate = 0.9;
  utterance.volume = 1.0;
  utterance.pitch = 1.1;

  // Apply the Voice Lock
  if (!lockedVoice) {
    initVoiceLock();
  }
  if (lockedVoice) {
    utterance.voice = lockedVoice;
  }
  utterance.lang = 'en-IN'; // Failsafe for OS overrides

  // Attach status callbacks
  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}
