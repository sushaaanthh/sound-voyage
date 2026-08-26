import { useState, useEffect } from 'react';
import { fetchTTSAudio } from '../lib/ttsClient';

export const useAudioCache = (soundsToCache: (string | undefined)[]) => {
  const [audioCache, setAudioCache] = useState<Record<string, HTMLAudioElement>>({});

  const validSounds = (soundsToCache || []).filter((s): s is string => Boolean(s));
  const soundsKey = JSON.stringify(validSounds);

  useEffect(() => {
    let isMounted = true;

    const loadAudio = async () => {
      const newEntries: Record<string, HTMLAudioElement> = {};
      let hasChanges = false;

      for (const sound of validSounds) {
        if (!audioCache[sound] && !newEntries[sound]) {
          const url = await fetchTTSAudio(sound);
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
