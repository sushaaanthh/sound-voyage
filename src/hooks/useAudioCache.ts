import { useState, useEffect } from 'react';

export const useAudioCache = (soundsToCache: (string | undefined)[]) => {
  const [audioCache, setAudioCache] = useState<Record<string, HTMLAudioElement>>({});

  const validSounds = (soundsToCache || []).filter((s): s is string => Boolean(s));
  const soundsKey = JSON.stringify(validSounds);

  const fetchAzureAudio = async (text: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('TTS request failed');
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Azure TTS fetch failed:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadAudio = async () => {
      const newEntries: Record<string, HTMLAudioElement> = {};
      let hasChanges = false;

      for (const sound of validSounds) {
        if (!audioCache[sound] && !newEntries[sound]) {
          const url = await fetchAzureAudio(sound);
          if (url && isMounted) {
            newEntries[sound] = new Audio(url);
            hasChanges = true;
          }
        }
      }

      if (hasChanges && isMounted) {
        setAudioCache(prev => ({ ...prev, ...newEntries }));
      }
    };

    if (validSounds.length > 0) {
      loadAudio();
    }

    return () => {
      isMounted = false;
    };
  }, [soundsKey]);

  const playSound = (sound?: string) => {
    if (!sound) return;
    if (audioCache[sound]) {
      audioCache[sound].currentTime = 0;
      audioCache[sound].play();
    } else {
      console.warn("Audio still loading or failed:", sound);
    }
  };

  return { audioCache, playSound, isReady: Object.keys(audioCache).length > 0 };
};
