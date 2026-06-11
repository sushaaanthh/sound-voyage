export interface PositionPilotQuestion {
  targetSound: string;
  word: string;
  position: 'START' | 'MIDDLE' | 'END';
}

export interface PositionPilotLevel {
  level: number;
  questions: PositionPilotQuestion[];
}

export const positionPilotData: PositionPilotLevel[] = [
  {
    level: 1,
    questions: [
      { targetSound: 'd', word: 'DOLL', position: 'START' },
      { targetSound: 'd', word: 'BIRD', position: 'END' },
      { targetSound: 'sh', word: 'SHY', position: 'START' },
      { targetSound: 'l', word: 'FILL', position: 'END' },
      { targetSound: 'd', word: 'MIDDLE', position: 'MIDDLE' },
      { targetSound: 'f', word: 'FAST', position: 'START' },
      { targetSound: 'o', word: 'SHOP', position: 'MIDDLE' }, // Corrected phonetically from prompt text to match clinician underline
      { targetSound: 'k', word: 'CAKE', position: 'END' },    // Corrected phonetically from prompt text to match clinician underline
      { targetSound: 's', word: 'SNAKE', position: 'START' },
      { targetSound: 'ee', word: 'DEEP', position: 'MIDDLE' }
    ]
  },
  {
    level: 2,
    questions: [
      { targetSound: 'd', word: 'RIDDLE', position: 'MIDDLE' },
      { targetSound: 'b', word: 'RABBIT', position: 'MIDDLE' },
      { targetSound: 'sh', word: 'SHAPING', position: 'START' },
      { targetSound: 'ae', word: 'PLANE', position: 'MIDDLE' },
      { targetSound: 'ue', word: 'CRUDE', position: 'MIDDLE' },
      { targetSound: 'f', word: 'GRAPH', position: 'END' },
      { targetSound: 'a', word: 'SPLASH', position: 'MIDDLE' },
      { targetSound: 'th', word: 'THINK', position: 'START' },
      { targetSound: 'sh', word: 'BRUSH', position: 'END' },
      { targetSound: 'd', word: 'MOULD', position: 'END' }
    ]
  },
  {
    level: 3,
    questions: [
      { targetSound: 'sh', word: 'ASH', position: 'END' },
      { targetSound: 'sh', word: 'DISHES', position: 'MIDDLE' },
      { targetSound: 'sh', word: 'SHOWER', position: 'START' },
      { targetSound: 'sh', word: 'MARSH', position: 'END' },
      { targetSound: 'sh', word: 'SHAPE', position: 'START' },
      { targetSound: 'sh', word: 'ISSUE', position: 'MIDDLE' },
      { targetSound: 'sh', word: 'FISH', position: 'END' },
      { targetSound: 'sh', word: 'SHARP', position: 'START' },
      { targetSound: 'sh', word: 'MARSHES', position: 'MIDDLE' },
      { targetSound: 'sh', word: 'FLESH', position: 'END' },
      { targetSound: 'sh', word: 'INSURE', position: 'MIDDLE' },
      { targetSound: 'sh', word: 'SHORE', position: 'START' },
      { targetSound: 'sh', word: 'FLASH', position: 'END' },
      { targetSound: 'sh', word: 'GUSHING', position: 'MIDDLE' },
      { targetSound: 'sh', word: 'SHY', position: 'START' },
      { targetSound: 'sh', word: 'BRUSH', position: 'END' },
      { targetSound: 'sh', word: 'WISH', position: 'END' },
      { targetSound: 'sh', word: 'WASHING', position: 'MIDDLE' },
      { targetSound: 'sh', word: 'SWISH', position: 'END' },
      { targetSound: 'sh', word: 'SHINE', position: 'START' }
    ]
  },
  {
    level: 4,
    questions: [
      // /d/ target sound questions
      { targetSound: 'd', word: 'BIRD', position: 'END' },
      { targetSound: 'd', word: 'DESK', position: 'START' },
      { targetSound: 'd', word: 'ADDRESS', position: 'MIDDLE' },
      { targetSound: 'd', word: 'SIDE', position: 'END' },
      { targetSound: 'd', word: 'DIM', position: 'START' },
      { targetSound: 'd', word: 'DRIP', position: 'START' },
      { targetSound: 'd', word: 'FLOOD', position: 'END' },
      { targetSound: 'd', word: 'ADD', position: 'END' },
      { targetSound: 'd', word: 'MIDDLE', position: 'MIDDLE' },
      { targetSound: 'd', word: 'BEND', position: 'END' },
      { targetSound: 'd', word: 'DRINK', position: 'START' },
      { targetSound: 'd', word: 'MIND', position: 'END' },
      { targetSound: 'd', word: 'DELIVER', position: 'START' },
      { targetSound: 'd', word: 'WIND', position: 'END' },
      { targetSound: 'd', word: 'DEED', position: 'END' }, // Using DEED for phonetics
      { targetSound: 'd', word: 'READ', position: 'END' },
      { targetSound: 'd', word: 'DRIVE', position: 'START' },
      { targetSound: 'd', word: 'FIDDLE', position: 'MIDDLE' },
      { targetSound: 'd', word: 'DRIFT', position: 'START' },
      { targetSound: 'd', word: 'EDIT', position: 'MIDDLE' },
      
      // /p/ target sound questions
      { targetSound: 'p', word: 'PINE', position: 'START' },
      { targetSound: 'p', word: 'RIPPLE', position: 'MIDDLE' },
      { targetSound: 'p', word: 'SHAPE', position: 'END' },
      { targetSound: 'p', word: 'FLOP', position: 'END' },
      { targetSound: 'p', word: 'PEAR', position: 'START' },
      { targetSound: 'p', word: 'PALM', position: 'START' },
      { targetSound: 'p', word: 'ROPE', position: 'END' },
      { targetSound: 'p', word: 'MAP', position: 'END' },
      { targetSound: 'p', word: 'PLOD', position: 'START' },
      { targetSound: 'p', word: 'DIP', position: 'END' },
      { targetSound: 'p', word: 'IMPOSE', position: 'MIDDLE' },
      { targetSound: 'p', word: 'SEEP', position: 'END' },
      { targetSound: 'p', word: 'PEER', position: 'START' },
      { targetSound: 'p', word: 'SLIP', position: 'END' },
      { targetSound: 'p', word: 'POSE', position: 'START' },
      { targetSound: 'p', word: 'APPEAR', position: 'MIDDLE' },
      { targetSound: 'p', word: 'WASP', position: 'END' },
      { targetSound: 'p', word: 'SPIN', position: 'MIDDLE' },
      { targetSound: 'p', word: 'PINK', position: 'START' },
      { targetSound: 'p', word: 'SAMPLE', position: 'MIDDLE' }
    ]
  },
  {
    level: 5,
    questions: [
      // /m/ target sound questions
      { targetSound: 'm', word: 'AMID', position: 'MIDDLE' },
      { targetSound: 'm', word: 'MASK', position: 'START' },
      { targetSound: 'm', word: 'SWIM', position: 'END' },
      { targetSound: 'm', word: 'MIST', position: 'START' },
      { targetSound: 'm', word: 'ARM', position: 'END' },
      { targetSound: 'm', word: 'SIMPLE', position: 'MIDDLE' },
      { targetSound: 'm', word: 'MILL', position: 'START' },
      { targetSound: 'm', word: 'LEMON', position: 'MIDDLE' },
      { targetSound: 'm', word: 'DIME', position: 'END' },
      { targetSound: 'm', word: 'MELON', position: 'START' },
      { targetSound: 'm', word: 'NEEM', position: 'END' },
      { targetSound: 'm', word: 'RAMP', position: 'MIDDLE' },
      { targetSound: 'm', word: 'POMP', position: 'MIDDLE' },
      { targetSound: 'm', word: 'TOMATO', position: 'MIDDLE' },
      { targetSound: 'm', word: 'MEAL', position: 'START' },
      { targetSound: 'm', word: 'WARM', position: 'END' },
      { targetSound: 'm', word: 'RHYME', position: 'END' },
      { targetSound: 'm', word: 'PRIME', position: 'END' },
      { targetSound: 'm', word: 'AMOUNT', position: 'MIDDLE' },
      { targetSound: 'm', word: 'ADMIT', position: 'MIDDLE' },

      // /r/ target sound questions
      { targetSound: 'r', word: 'RED', position: 'START' },
      { targetSound: 'r', word: 'ARCH', position: 'MIDDLE' },
      { targetSound: 'r', word: 'RICH', position: 'START' },
      { targetSound: 'r', word: 'FEAR', position: 'END' },
      { targetSound: 'r', word: 'DEER', position: 'END' },
      { targetSound: 'r', word: 'ARRIVE', position: 'MIDDLE' },
      { targetSound: 'r', word: 'ARM', position: 'MIDDLE' },
      { targetSound: 'r', word: 'FLOWER', position: 'END' },
      { targetSound: 'r', word: 'RANGE', position: 'START' },
      { targetSound: 'r', word: 'CARRY', position: 'MIDDLE' },
      { targetSound: 'r', word: 'NEAR', position: 'END' },
      { targetSound: 'r', word: 'ARROW', position: 'MIDDLE' },
      { targetSound: 'r', word: 'CAR', position: 'END' },
      { targetSound: 'r', word: 'RIND', position: 'START' },
      { targetSound: 'r', word: 'RIFT', position: 'START' },
      { targetSound: 'r', word: 'APPEAR', position: 'END' },
      { targetSound: 'r', word: 'SPEAR', position: 'END' },
      { targetSound: 'r', word: 'FORAGE', position: 'MIDDLE' },
      { targetSound: 'r', word: 'RING', position: 'START' },
      { targetSound: 'r', word: 'PERCH', position: 'MIDDLE' }
    ]
  }
];
