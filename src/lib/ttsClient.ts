const PROXY_URL = import.meta.env.VITE_TTS_PROXY_URL;
const DIRECT_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY;
const DIRECT_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'centralindia';

export type TTSMode = 'proxy' | 'direct' | 'unconfigured';

export function getTTSMode(): TTSMode {
  if (PROXY_URL) return 'proxy';
  if (DIRECT_KEY && DIRECT_REGION) return 'direct';
  return 'unconfigured';
}

export function validateTTSEnv(): { key: string; region: string; mode: TTSMode } {
  const mode = getTTSMode();

  if (mode === 'unconfigured') {
    console.error('CRITICAL: TTS is unconfigured. Set VITE_TTS_PROXY_URL or VITE_AZURE_SPEECH_KEY + VITE_AZURE_SPEECH_REGION.');
  }

  return { key: DIRECT_KEY || '', region: DIRECT_REGION, mode };
}

export async function fetchTTSAudio(text: string, isPhoneme: boolean = false): Promise<string | null> {
  const { key, region, mode } = validateTTSEnv();

  if (mode === 'unconfigured') {
    return null;
  }

  try {
    if (mode === 'proxy') {
      return fetchViaProxy(text, isPhoneme);
    }

    return fetchDirectFromAzure(text, isPhoneme, key, region);
  } catch (error) {
    console.error('TTS fetch failed:', error);
    return null;
  }
}

async function fetchViaProxy(text: string, isPhoneme: boolean): Promise<string | null> {
  const proxyUrl = import.meta.env.VITE_TTS_PROXY_URL!;
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, isPhoneme }),
  });

  if (!response.ok) {
    throw new Error(`TTS proxy failed: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

async function fetchDirectFromAzure(
  text: string,
  isPhoneme: boolean,
  key: string,
  region: string
): Promise<string | null> {
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
    <voice name="en-IN-NeerjaNeural">
      ${isPhoneme ? `<phoneme alphabet="ipa" ph="${text}">${text}</phoneme>` : text}
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
  return URL.createObjectURL(blob);
}

export async function playTTSAudio(text: string, isPhoneme: boolean = false): Promise<void> {
  if (typeof window === 'undefined' || !text) return;

  const url = await fetchTTSAudio(text, isPhoneme);
  if (!url) return;

  const audio = new Audio(url);

  try {
    await audio.play();
  } catch (err) {
    console.warn('Autoplay blocked; audio may require user interaction.', err);
  }

  audio.onended = () => {
    URL.revokeObjectURL(url);
  };

  audio.onerror = () => {
    URL.revokeObjectURL(url);
  };
}
