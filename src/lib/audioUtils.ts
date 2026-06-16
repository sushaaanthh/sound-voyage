const phonemeMap: Record<string, string> = {
  // Slash format
  '/k/': ' , kuh , ',
  '/ch/': ' , chuh , ',
  '/p/': ', puh, ',
  '/s/': ' , sss , ',
  '/m/': ' , mmm , ',
  '/b/': ', buh, ',
  '/d/': ', duh, ',
  '/f/': ', fff, ',
  '/g/': ', guh, ',
  '/h/': ', huh, ',
  '/j/': ', juh, ',
  '/l/': ' , ull , ',
  '/n/': ', nnn, ',
  '/r/': ', rrr, ',
  '/t/': ', tuh, ',
  '/v/': ', vvv, ',
  '/w/': ', wuh, ',
  '/y/': ', yuh, ',
  '/z/': ', zzz, ',
  '/sh/': ' , shh , ',
  '/th/': ' , thuh , ',
  '/a/': ', ah, ',
  '/e/': ', eh, ',
  '/i/': ', ih, ',
  '/o/': ', ah, ',
  '/u/': ', uh, ',
  '/c/': ' , kuh , ',
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
  'k': ' , kuh , ',
  'ch': ' , chuh , ',
  'p': ', puh, ',
  's': ' , sss , ',
  'm': ' , mmm , ',
  'b': ', buh, ',
  'd': ', duh, ',
  'f': ', fff, ',
  'g': ', guh, ',
  'h': ', huh, ',
  'j': ', juh, ',
  'l': ' , ull , ',
  'n': ', nnn, ',
  'r': ', rrr, ',
  't': ', tuh, ',
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
  'c': ' , kuh , ',
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
  ' k ': ' , kuh , ',
  'll': ' , ull , '
};

/**
 * Translates phonetic cues and slash-wrapped phonemes into hacked spellings 
 * to force standard TTS engines to make the correct sounds.
 */
export function translateText(text: string): string {
  const trimmed = text.trim();
  const normalized = trimmed.toLowerCase();
  
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
  }
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    options?.onEnd?.();
    return null;
  }

  // Cancel ongoing speech gracefully to handle rapid clicks
  window.speechSynthesis.cancel();

  // Apply phonetic lookup and translations
  const spokenText = translateText(text);

  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.rate = 0.9;

  // Retrieve voices and select Indian English
  const voices = window.speechSynthesis.getVoices();
  const indianVoice = voices.find(
    (voice) =>
      voice.lang === 'en-IN' ||
      voice.lang.startsWith('en-IN') ||
      voice.lang.replace('_', '-').includes('en-IN')
  );

  if (indianVoice) {
    utterance.voice = indianVoice;
  }

  // Attach status callbacks
  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}
