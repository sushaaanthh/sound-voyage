import { PHONEME_AUDIO_MAP, getPhonemeAudioStr } from '../data/phonemeAudioMap';

const phonemeMap: Record<string, string> = {
  // Slash format
  '/k/': ' , k-uh , ',
  '/ch/': ' , chuh , ',
  '/p/': ' , p-uh , ',
  '/s/': ' , sss , ',
  '/m/': ' , mmm , ',
  '/b/': ' , b-uh , ',
  '/d/': ' , d-uh , ',
  '/f/': ', fff, ',
  '/g/': ' , g-uh , ',
  '/h/': ', huh, ',
  '/j/': ', juh, ',
  '/l/': ' , ull , ',
  '/n/': ', nnn, ',
  '/r/': ', rrr, ',
  '/t/': ' , t-uh , ',
  '/v/': ', vvv, ',
  '/w/': ', wuh, ',
  '/y/': ', yuh, ',
  '/z/': ', zzz, ',
  '/sh/': ' , shh , ',
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
  'k': ' , k-uh , ',
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
  'sh': ' , shh , ',
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

// Warm up the speech synthesis engine to force browser to load voices immediately on mount
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
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

  // Intercept text using getPhonemeAudioStr before speaking
  const rawText = text.trim();
  const targetWord = wordContext || options?.wordContext || '';
  const exactSound = getPhonemeAudioStr(rawText, targetWord);
  const textToSpeak = (exactSound && exactSound !== rawText && exactSound !== text) ? `, ${exactSound}, ` : translateText(rawText);
  const spokenText = textToSpeak.toLowerCase();

  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.rate = 0.8;
  utterance.volume = 1.0;
  utterance.pitch = 1.1;

  // Retrieve voices and select a high-quality, consistent English voice
  const voices = window.speechSynthesis.getVoices();
  // Look for Indian English specifically
  const indianVoice = voices.find(voice => voice.lang === 'en-IN' || voice.lang === 'en_IN' || voice.name.includes('India'));
  if (indianVoice) {
    utterance.voice = indianVoice;
  } else {
    const matchedVoice = voices.find(v => v.name.includes("Google US English")) ||
                         voices.find(v => v.name.includes("Google UK English Female")) ||
                         voices.find(v => v.name.includes("Samantha")) ||
                         voices.find(v => v.lang.startsWith('en-')) ||
                         voices[0];
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  // Attach status callbacks
  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}
