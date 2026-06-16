export interface SoundSyncPair {
  word1: string;
  word2: string;
}

export interface SoundSyncLevel {
  level: number;
  mode: 'identical' | 'vowel' | 'homophone';
  instruction: string;
  description: string;
  pairCount: number;
  wordPool: SoundSyncPair[];
}

export const soundSyncData: SoundSyncLevel[] = [
  {
    level: 1,
    mode: 'identical',
    instruction: 'Find the matching word pairs!',
    description: 'Match simple 3-letter words that look and sound the same.',
    pairCount: 8, // 16 cards (4x4)
    wordPool: [
      { word1: 'MAT', word2: 'MAT' },
      { word1: 'FOX', word2: 'FOX' },
      { word1: 'RIB', word2: 'RIB' },
      { word1: 'BUN', word2: 'BUN' },
      { word1: 'CAB', word2: 'CAB' },
      { word1: 'MOP', word2: 'MOP' },
      { word1: 'SUN', word2: 'SUN' },
      { word1: 'TIN', word2: 'TIN' },
      { word1: 'CAT', word2: 'CAT' },
      { word1: 'BAT', word2: 'BAT' },
      { word1: 'HAT', word2: 'HAT' },
      { word1: 'RAT', word2: 'RAT' },
      { word1: 'SAT', word2: 'SAT' },
      { word1: 'PIN', word2: 'PIN' },
      { word1: 'PEN', word2: 'PEN' },
      { word1: 'FIN', word2: 'FIN' },
      { word1: 'CUP', word2: 'CUP' },
      { word1: 'TUB', word2: 'TUB' },
      { word1: 'NUT', word2: 'NUT' },
      { word1: 'DOG', word2: 'DOG' },
      { word1: 'LOG', word2: 'LOG' },
      { word1: 'BED', word2: 'BED' },
      { word1: 'RED', word2: 'RED' }
    ]
  },
  {
    level: 2,
    mode: 'identical',
    instruction: 'Find the matching word pairs!',
    description: 'Match longer words with blends that look and sound the same.',
    pairCount: 15, // 30 cards (5x6)
    wordPool: [
      { word1: 'BRAKE', word2: 'BRAKE' },
      { word1: 'MARKET', word2: 'MARKET' },
      { word1: 'PUSH', word2: 'PUSH' },
      { word1: 'SPOON', word2: 'SPOON' },
      { word1: 'SPILL', word2: 'SPILL' },
      { word1: 'BRUSH', word2: 'BRUSH' },
      { word1: 'DRINK', word2: 'DRINK' },
      { word1: 'MINT', word2: 'MINT' },
      { word1: 'POWER', word2: 'POWER' },
      { word1: 'LARGE', word2: 'LARGE' },
      { word1: 'TABLE', word2: 'TABLE' },
      { word1: 'PILLOW', word2: 'PILLOW' },
      { word1: 'TRUCK', word2: 'TRUCK' },
      { word1: 'PINK', word2: 'PINK' },
      { word1: 'DRESS', word2: 'DRESS' },
      { word1: 'FLOWER', word2: 'FLOWER' },
      { word1: 'GRASS', word2: 'GRASS' },
      { word1: 'CLOCK', word2: 'CLOCK' },
      { word1: 'CHAIR', word2: 'CHAIR' },
      { word1: 'MOUSE', word2: 'MOUSE' },
      { word1: 'HOUSE', word2: 'HOUSE' },
      { word1: 'BREAD', word2: 'BREAD' },
      { word1: 'SHIRT', word2: 'SHIRT' },
      { word1: 'SWEET', word2: 'SWEET' },
      { word1: 'FRUIT', word2: 'FRUIT' }
    ]
  },
  {
    level: 3,
    mode: 'identical',
    instruction: 'Find the matching word pairs!',
    description: 'Match advanced multi-syllabic words that look and sound the same.',
    pairCount: 18, // 36 cards (6x6)
    wordPool: [
      { word1: 'Blanket', word2: 'Blanket' },
      { word1: 'Temple', word2: 'Temple' },
      { word1: 'Drumstick', word2: 'Drumstick' },
      { word1: 'Children', word2: 'Children' },
      { word1: 'Mustard', word2: 'Mustard' },
      { word1: 'Simple', word2: 'Simple' },
      { word1: 'Reverse', word2: 'Reverse' },
      { word1: 'Neighbour', word2: 'Neighbour' },
      { word1: 'Immediate', word2: 'Immediate' },
      { word1: 'Position', word2: 'Position' },
      { word1: 'Wandering', word2: 'Wandering' },
      { word1: 'Rubbish', word2: 'Rubbish' },
      { word1: 'Yellow', word2: 'Yellow' },
      { word1: 'Factory', word2: 'Factory' },
      { word1: 'Arrow', word2: 'Arrow' },
      { word1: 'Disturb', word2: 'Disturb' },
      { word1: 'Marbles', word2: 'Marbles' },
      { word1: 'Thunder', word2: 'Thunder' },
      { word1: 'Whisper', word2: 'Whisper' },
      { word1: 'Journey', word2: 'Journey' },
      { word1: 'Forever', word2: 'Forever' },
      { word1: 'Special', word2: 'Special' },
      { word1: 'Silence', word2: 'Silence' },
      { word1: 'Picture', word2: 'Picture' }
    ]
  },
  {
    level: 4,
    mode: 'vowel',
    instruction: 'Match short & long vowel sounds!',
    description: 'Match words with the same consonants but short vs. long vowel sounds (e.g., CUT & CUTE).',
    pairCount: 8, // 16 cards (4x4)
    wordPool: [
      { word1: 'CUT', word2: 'CUTE' },
      { word1: 'BIT', word2: 'BITE' },
      { word1: 'SIT', word2: 'SITE' },
      { word1: 'MAT', word2: 'MATE' },
      { word1: 'MALL', word2: 'MALE' },
      { word1: 'FIN', word2: 'FINE' },
      { word1: 'TILL', word2: 'TILE' },
      { word1: 'MOP', word2: 'MOPE' },
      { word1: 'COP', word2: 'COPE' },
      { word1: 'TAP', word2: 'TAPE' },
      { word1: 'PIN', word2: 'PINE' },
      { word1: 'HAT', word2: 'HATE' },
      { word1: 'TUB', word2: 'TUBE' },
      { word1: 'CAP', word2: 'CAPE' },
      { word1: 'KIT', word2: 'KITE' },
      { word1: 'RIP', word2: 'RIPE' },
      { word1: 'WIN', word2: 'WINE' },
      { word1: 'HOP', word2: 'HOPE' },
      { word1: 'NOT', word2: 'NOTE' },
      { word1: 'CUB', word2: 'CUBE' }
    ]
  },
  {
    level: 5,
    mode: 'vowel',
    instruction: 'Match short & long vowel sounds!',
    description: 'Match words with more complex short and long vowel spelling patterns (e.g., FIT & FIGHT).',
    pairCount: 12, // 24 cards (4x6)
    wordPool: [
      { word1: 'FIT', word2: 'FIGHT' },
      { word1: 'WOK', word2: 'WOKE' },
      { word1: 'RID', word2: 'RIDE' },
      { word1: 'CAR', word2: 'CARE' },
      { word1: 'ROD', word2: 'RODE' },
      { word1: 'TUB', word2: 'TUBE' },
      { word1: 'MAD', word2: 'MADE' },
      { word1: 'BET', word2: 'BEET' },
      { word1: 'KIT', word2: 'KITE' },
      { word1: 'PILL', word2: 'PILE' },
      { word1: 'CAP', word2: 'CAPE' },
      { word1: 'MILL', word2: 'MILE' },
      { word1: 'RED', word2: 'REED' },
      { word1: 'FED', word2: 'FEED' },
      { word1: 'BACK', word2: 'BAKE' }
    ]
  },
  {
    level: 6,
    mode: 'vowel',
    instruction: 'Match short & long vowel sounds!',
    description: 'Match advanced short and long vowel sound structures.',
    pairCount: 15, // 30 cards (5x6)
    wordPool: [
      { word1: 'RIP', word2: 'RIPE' },
      { word1: 'MEN', word2: 'MEAN' },
      { word1: 'CUB', word2: 'CUBE' },
      { word1: 'WIT', word2: 'WHITE' },
      { word1: 'SNACK', word2: 'SNAKE' },
      { word1: 'RACK', word2: 'RAKE' },
      { word1: 'LACK', word2: 'LAKE' },
      { word1: 'PICK', word2: 'PIKE' },
      { word1: 'SIN', word2: 'SINE' },
      { word1: 'SPIT', word2: 'SPITE' },
      { word1: 'PIN', word2: 'PINE' },
      { word1: 'FILL', word2: 'FILE' },
      { word1: 'SMOCK', word2: 'SMOKE' },
      { word1: 'HID', word2: 'HIDE' },
      { word1: 'NOT', word2: 'NOTE' },
      { word1: 'BAT', word2: 'BAIT' }
    ]
  },
  {
    level: 7,
    mode: 'homophone',
    instruction: 'Match homophones that sound the same!',
    description: 'Find spelling matches for simple homophones (e.g., SON & SUN).',
    pairCount: 8, // 16 cards (4x4)
    wordPool: [
      { word1: 'SON', word2: 'SUN' },
      { word1: 'HEAR', word2: 'HERE' },
      { word1: 'CELL', word2: 'SELL' },
      { word1: 'KNOW', word2: 'NO' },
      { word1: 'TO', word2: 'TWO' },
      { word1: 'BY', word2: 'BUY' },
      { word1: 'SEE', word2: 'SEA' },
      { word1: 'ATE', word2: 'EIGHT' },
      { word1: 'MALE', word2: 'MAIL' },
      { word1: 'BEET', word2: 'BEAT' },
      { word1: 'BLUE', word2: 'BLEW' },
      { word1: 'DEER', word2: 'DEAR' },
      { word1: 'MET', word2: 'MEET' },
      { word1: 'RED', word2: 'READ' },
      { word1: 'FOR', word2: 'FOUR' }
    ]
  },
  {
    level: 8,
    mode: 'homophone',
    instruction: 'Match homophones that sound the same!',
    description: 'Find spelling matches for moderate homophones (e.g., MALE & MAIL).',
    pairCount: 10, // 20 cards (5x4)
    wordPool: [
      { word1: 'BALE', word2: 'BAIL' },
      { word1: 'HEAL', word2: 'HEEL' },
      { word1: 'HARE', word2: 'HAIR' },
      { word1: 'PAIR', word2: 'PEAR' },
      { word1: 'KNOT', word2: 'NOT' },
      { word1: 'DUE', word2: 'DEW' },
      { word1: 'MEET', word2: 'MEAT' },
      { word1: 'PALE', word2: 'PAIL' },
      { word1: 'RAIN', word2: 'REIN' },
      { word1: 'BEEN', word2: 'BEAN' },
      { word1: 'TAIL', word2: 'TALE' },
      { word1: 'BEAR', word2: 'BARE' },
      { word1: 'CELL', word2: 'SELL' },
      { word1: 'PREY', word2: 'PRAY' }
    ]
  },
  {
    level: 9,
    mode: 'homophone',
    instruction: 'Match homophones that sound the same!',
    description: 'Find spelling matches for advanced homophones (e.g., THREW & THROUGH).',
    pairCount: 12, // 24 cards (4x6)
    wordPool: [
      { word1: 'THREW', word2: 'THROUGH' },
      { word1: 'BORED', word2: 'BOARD' },
      { word1: 'REED', word2: 'READ' },
      { word1: 'BEAR', word2: 'BARE' },
      { word1: 'HOUR', word2: 'OUR' },
      { word1: 'PREY', word2: 'PRAY' },
      { word1: 'STAIR', word2: 'STARE' },
      { word1: 'PEACE', word2: 'PIECE' },
      { word1: 'STEEL', word2: 'STEAL' },
      { word1: 'WHICH', word2: 'WITCH' },
      { word1: 'SENT', word2: 'SCENT' },
      { word1: 'WEAK', word2: 'WEEK' },
      { word1: 'WROTE', word2: 'ROTE' },
      { word1: 'RIGHT', word2: 'WRITE' }
    ]
  },
  {
    level: 10,
    mode: 'homophone',
    instruction: 'Match homophones that sound the same!',
    description: 'Master spelling matches for complex/longer homophones (e.g., FLOWER & FLOUR).',
    pairCount: 15, // 30 cards (5x6)
    wordPool: [
      { word1: 'FLOWER', word2: 'FLOUR' },
      { word1: 'RODE', word2: 'ROAD' },
      { word1: 'FAIR', word2: 'FARE' },
      { word1: 'BRAKE', word2: 'BREAK' },
      { word1: 'RAIN', word2: 'REIN' },
      { word1: 'ROOT', word2: 'ROUTE' },
      { word1: 'ALTER', word2: 'ALTAR' },
      { word1: 'HERD', word2: 'HEARD' },
      { word1: 'DIE', word2: 'DYE' },
      { word1: 'PLANE', word2: 'PLAIN' },
      { word1: 'WRITE', word2: 'RIGHT' },
      { word1: 'WEATHER', word2: 'WHETHER' },
      { word1: 'BY', word2: 'BUY' },
      { word1: 'VAIN', word2: 'VEIN' },
      { word1: 'HOLE', word2: 'WHOLE' },
      { word1: 'COURSE', word2: 'COARSE' }
    ]
  }
];
