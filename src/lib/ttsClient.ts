const PROXY_URL = import.meta.env.VITE_TTS_PROXY_URL;
const DIRECT_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY;
const DIRECT_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'centralindia';
const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;

const activeAudioInstances = new Map<string, HTMLAudioElement>();

function retainAudioInstance(id: string, audio: HTMLAudioElement, url: string) {
  activeAudioInstances.set(id, audio);
  audio.onended = () => {
    URL.revokeObjectURL(url);
    activeAudioInstances.delete(id);
  };
  audio.onerror = () => {
    URL.revokeObjectURL(url);
    activeAudioInstances.delete(id);
  };
}

export type TTSMode = 'serverless' | 'proxy' | 'direct' | 'hf' | 'unconfigured';

export function getTTSMode(): TTSMode {
  if (PROXY_URL) return 'proxy';
  if (DIRECT_KEY && DIRECT_REGION) return 'direct';
  if (HF_API_KEY) return 'hf';
  return 'unconfigured';
}

export function validateTTSEnv(): { key?: string; region?: string; hfKey?: string; mode: TTSMode } {
  const mode = getTTSMode();

  if (mode === 'unconfigured') {
    console.error('CRITICAL: TTS is unconfigured. Set VITE_TTS_PROXY_URL or VITE_AZURE_SPEECH_KEY + VITE_AZURE_SPEECH_REGION or VITE_HF_API_KEY.');
  }

  return { key: DIRECT_KEY, region: DIRECT_REGION, hfKey: HF_API_KEY, mode };
}

export async function fetchTTSAudio(text: string, isPhoneme: boolean = false): Promise<string | null> {
  if (!text?.trim()) return null;

  const errors: string[] = [];

  try {
    const serverlessUrl = await fetchViaServerless(text, isPhoneme);
    if (serverlessUrl) {
      console.info('[TTS] Serverless route succeeded');
      return serverlessUrl;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('[TTS] Serverless route failed, falling back:', msg);
    errors.push(`serverless: ${msg}`);
  }

  if (PROXY_URL) {
    try {
      const proxyUrl = await fetchViaProxy(text, isPhoneme);
      if (proxyUrl) {
        console.info('[TTS] Proxy route succeeded');
        return proxyUrl;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn('[TTS] Proxy route failed:', msg);
      errors.push(`proxy: ${msg}`);
    }
  }

  if (DIRECT_KEY && DIRECT_REGION) {
    try {
      const directUrl = await fetchDirectFromAzure(text, isPhoneme, DIRECT_KEY, DIRECT_REGION);
      if (directUrl) {
        console.info('[TTS] Direct Azure route succeeded');
        return directUrl;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn('[TTS] Direct Azure route failed:', msg);
      errors.push(`direct: ${msg}`);
    }
  }

  if (HF_API_KEY) {
    try {
      const { fetchHFAudio } = await import('../utils/huggingFaceTTS');
      const hfUrl = await fetchHFAudio(text);
      if (hfUrl) {
        console.info('[TTS] HF fallback succeeded');
        return hfUrl;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn('[TTS] HF fallback failed:', msg);
      errors.push(`hf: ${msg}`);
    }
  }

  console.error('[TTS] All routes failed for text:', text, 'Errors:', errors);
  return null;
}

async function fetchViaServerless(text: string, isPhoneme: boolean): Promise<string> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, isPhoneme }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Serverless TTS failed: ${response.status} ${errorText}`);
  }

  const blob = await response.blob();
  if (!blob.type.startsWith('audio/')) {
    const text = await blob.text();
    throw new Error(`Serverless TTS returned non-audio response: ${text}`);
  }

  return URL.createObjectURL(blob);
}

async function fetchViaProxy(text: string, isPhoneme: boolean): Promise<string> {
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
): Promise<string> {
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
      <voice name="en-IN-NeerjaNeural">
        <prosody rate="85%">
          ${isPhoneme ? `<phoneme alphabet="ipa" ph="${text}">${text}</phoneme>` : text}
        </prosody>
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
  audio.volume = 1.0;
  audio.preload = 'auto';

  const instanceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  retainAudioInstance(instanceId, audio, url);

  try {
    await audio.play();
  } catch (err) {
    console.error('Playback blocked or failed in production:', err);
    URL.revokeObjectURL(url);
    activeAudioInstances.delete(instanceId);
  }
}
