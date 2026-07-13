export type GameExceptions = Record<string, Record<string, string>>;

export const AUDIO_OVERRIDES: Record<string, GameExceptions> = {
  PhonemePop: {
    // Global phoneme overrides for this specific game (Levels 3, 4, 5, 6, 7, 9)
    '*': {
      '/C/': 'kuh',
      '/k/': 'ka',
      '/Sh/': 'sha',
      '/p/': 'pah',
      '/fi/': 'Fee',
      '/po/': 'pa'
    },
    // Word-specific overrides (Levels 8 & 10)
    'camp': { '/a/': 'aah' },
    'truck': { '/a/': 'ae' }, // Note: 'truck' doesn't technically contain standard /a/, but overriding as requested
    'cap': { '/a/': 'ae' },
    'far': { '/a/': 'eI' },
    'lap': { '/a/': 'ae' },
    'car': { '/a/': 'ei' },
    'bother': { '/th/': 'dha' }
  }
};

/**
 * Resolves the corrected audio string for the TTS engine.
 * Priority: 1. Specific Word -> 2. Game Wildcard (*) -> 3. Original Phoneme
 */
export const getExceptionAudio = (game: string, word: string = '', phoneme: string): string => {
  const gameOverrides = AUDIO_OVERRIDES[game];
  if (!gameOverrides) return phoneme;

  const normalizedWord = (word || '').toLowerCase();
  
  // Check for word-specific override first
  if (gameOverrides[normalizedWord]?.[phoneme]) {
    return gameOverrides[normalizedWord][phoneme];
  }
  
  // Check for game-wide wildcard override second
  if (gameOverrides['*']?.[phoneme]) {
    return gameOverrides['*'][phoneme];
  }

  // Fallback to the requested phoneme
  return phoneme;
};
