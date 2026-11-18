import { PHONEME_AUDIO_MAP } from '../data/phonemeAudioMap';
import { playTTSAudio } from './ttsClient';

export async function playAzureAudio(text: string, isPhoneme: boolean = false): Promise<void> {
  if (typeof window === 'undefined' || !text) return;

  let resolvedText = text;

  if (text.startsWith('/') && text.endsWith('/')) {
    resolvedText = PHONEME_AUDIO_MAP[text] || text;
  }

  await playTTSAudio(resolvedText, isPhoneme);
}
