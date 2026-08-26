const PROXY_URL = import.meta.env.VITE_TTS_PROXY_URL;

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

export type TTSMode = 'serverless' | 'proxy' | 'unconfigured';

export function getTTSMode(): TTSMode {
  if (PROXY_URL) return 'proxy';
  return 'serverless';
}

export function validateTTSEnv(): { mode: TTSMode } {
  const mode = getTTSMode();
  if (mode === 'unconfigured') {
    console.error('CRITICAL: TTS is unconfigured. Set VITE_TTS_PROXY_URL or ensure serverless endpoint is available.');
  }
  return { mode };
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

  console.error('[TTS] All routes failed for text:', text, 'Errors:', errors);
  return null;
}

async function fetchViaServerless(text: string, isPhoneme: boolean): Promise<string> {
  const { supabase } = await import('./supabase');
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers,
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
