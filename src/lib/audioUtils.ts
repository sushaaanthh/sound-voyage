import { PHONEME_AUDIO_MAP } from '../data/phonemeAudioMap';

export async function playAzureAudio(text: string, isPhoneme: boolean = false): Promise<void> {
  if (typeof window === 'undefined' || !text) return;

  let payload = text;

  if (text.startsWith('/') && text.endsWith('/')) {
    payload = PHONEME_AUDIO_MAP[text] || text;
  }

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: payload, isPhoneme }),
    });

    if (!response.ok) throw new Error('TTS request failed');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Audio playback failed'));
      };
      audio.play().catch(reject);
    });
  } catch (err) {
    console.error('Azure TTS playback failed:', err);
  }
}
