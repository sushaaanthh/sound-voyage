import { useState, useEffect } from 'react';

export const useAudioCache = (soundsToCache: (string | undefined)[]) => {
  const [audioCache, setAudioCache] = useState<Record<string, HTMLAudioElement>>({});

  const validSounds = (soundsToCache || []).filter((s): s is string => Boolean(s));
  const soundsKey = JSON.stringify(validSounds);

  const fetchAzureAudio = async (text: string): Promise<string | null> => {
    const key = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const region = import.meta.env.VITE_AZURE_SPEECH_REGION;

    if (!key || !region) {
      console.error('Azure TTS credentials missing. Set VITE_AZURE_SPEECH_KEY and VITE_AZURE_SPEECH_REGION.');
      return null;
    }

    try {
      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
        <voice name="en-IN-NeerjaNeural">
          ${text}
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
