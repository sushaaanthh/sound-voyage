import { PHONEME_AUDIO_MAP } from '@/data/phonemeAudioMap';
import { playTTSAudio } from '@/lib/ttsClient';

export type AudioContentType = 'question' | 'word' | 'phoneme';

export async function playAzureAudio(text: string, isPhoneme: boolean = false, contentType?: AudioContentType): Promise<void> {
  if (typeof window === 'undefined' || !text) return;

  let resolvedText = text;

  if (text.startsWith('/') && text.endsWith('/')) {
    resolvedText = PHONEME_AUDIO_MAP[text] || text;
  }

  await playTTSAudio(resolvedText, isPhoneme, contentType);
}
