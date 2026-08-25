import { PHONEME_AUDIO_MAP } from '../data/phonemeAudioMap';

export async function playAzureAudio(text: string, isPhoneme: boolean = false): Promise<void> {
  if (typeof window === 'undefined' || !text) return;

  let resolvedText = text;

  if (text.startsWith('/') && text.endsWith('/')) {
    resolvedText = PHONEME_AUDIO_MAP[text] || text;
  }

  const key = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const region = import.meta.env.VITE_AZURE_SPEECH_REGION;

  if (!key || !region) {
    console.error('Azure TTS credentials missing. Set VITE_AZURE_SPEECH_KEY and VITE_AZURE_SPEECH_REGION.');
    return;
  }

  try {
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
      <voice name="en-IN-NeerjaNeural">
        ${isPhoneme ? `<phoneme alphabet="ipa" ph="${resolvedText}">${resolvedText}</phoneme>` : resolvedText}
      </voice>
    </speak>`;

    const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'SoundVoyageApp',
      },
      body: ssml,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure TTS failed: ${response.status} ${errorText}`);
    }

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
