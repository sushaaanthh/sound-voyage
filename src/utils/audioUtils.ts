import { PHONEME_AUDIO_MAP } from '@/data/phonemeAudioMap';
import { playTTSAudio } from '@/lib/ttsClient';

export type AudioContentType = 'question' | 'word' | 'phoneme';

export const MULTI_OR_VOWEL_PHONEMES: Record<string, string> = {
  'sh': 'shh',
  'th': 'th',
  'ch': 'ch',
  'sp': 'sp',
  'ae': 'aa',
  'a': 'aa',
  'i': 'ih',
  'o': 'aw',
  'u': 'uh',
};

/**
 * Returns SSML pronunciation representation for a phoneme.
 * - Single-letter phonemes (/b/, /c/, /d/, etc.): speak directly without IPA tags.
 * - Multi-letter & vowel phonemes: use <sub alias="..."> for natural pronunciation.
 */
export function getSpokenPhonemeSSML(phoneme: string): string {
  const clean = phoneme.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (MULTI_OR_VOWEL_PHONEMES[clean]) {
    return `<sub alias="${MULTI_OR_VOWEL_PHONEMES[clean]}">${clean}</sub>`;
  }
  return clean;
}

/**
 * Formats a Phoneme Pop question (Levels 1–5) into SSML for Azure TTS (en-IN-NeerjaNeural).
 * Adds brief 200ms pauses around the target sound and target word(s) for clarity.
 */
export function formatQuestionForTTS(levelNum: number, currentQuestion: any, targetSound: string): string {
  if (!currentQuestion) return '';

  const rawSound = currentQuestion.targetSound || targetSound || '';
  const soundSsml = getSpokenPhonemeSSML(rawSound);
  const soundPart = `<break time="200ms"/>${soundSsml}<break time="200ms"/>`;

  if (levelNum === 1) {
    return `Does the word have the ${soundPart} sound?`;
  }
  if (levelNum === 2) {
    return `Do both words have the ${soundPart} sound?`;
  }
  if (levelNum === 3) {
    return `Select the picture with the ${soundPart} sound.`;
  }
  if (levelNum === 4) {
    return `Select all the pictures that have the ${soundPart} sound.`;
  }
  if (levelNum === 5) {
    return `Select the word with the ${soundPart} sound.`;
  }

  // Fallback for higher levels
  return `Select the word that contains the ${soundPart} sound.`;
}

export async function playAzureAudio(text: string, isPhoneme: boolean = false, contentType?: AudioContentType): Promise<void> {
  if (typeof window === 'undefined' || !text) return;

  let resolvedText = text;

  if (text.startsWith('/') && text.endsWith('/')) {
    resolvedText = getSpokenPhonemeSSML(text) || PHONEME_AUDIO_MAP[text] || text;
  }

  await playTTSAudio(resolvedText, isPhoneme, contentType);
}
