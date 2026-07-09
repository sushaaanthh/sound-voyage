export interface PositionPilotQuestion {
  targetSound: string;
  word: string;
  position: 'START' | 'MIDDLE' | 'END' | string | string[];
  correctPosition?: 'START' | 'MIDDLE' | 'END' | string | string[];
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
      { targetSound: 'k', word: 'CAKE', position: 'START', correctPosition: ['START', 'END'] },    // Corrected phonetically from prompt text to match clinician underline
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
  },
  {
    level: 6,
    questions: [
      // /ch/ target sound
      { targetSound: 'ch', word: 'SKETCH', position: 'END' },
      { targetSound: 'ch', word: 'PREACH', position: 'END' },
      { targetSound: 'ch', word: 'TEACHER', position: 'MIDDLE' },
      { targetSound: 'ch', word: 'ACHIEVE', position: 'MIDDLE' },
      { targetSound: 'ch', word: 'BLEACH', position: 'END' },
      { targetSound: 'ch', word: 'ENRICH', position: 'END' },
      { targetSound: 'ch', word: 'ENCHANT', position: 'MIDDLE' },
      { targetSound: 'ch', word: 'CHEQUE', position: 'START' },
      { targetSound: 'ch', word: 'CHIME', position: 'START' },
      { targetSound: 'ch', word: 'REACHED', position: 'MIDDLE' },
      // /ee/ target sound
      { targetSound: 'ee', word: 'FEET', position: 'MIDDLE' },
      { targetSound: 'ee', word: 'DEEP', position: 'MIDDLE' },
      { targetSound: 'ee', word: 'EAT', position: 'START' },
      { targetSound: 'ee', word: 'SPEECH', position: 'MIDDLE' },
      { targetSound: 'ee', word: 'READY', position: 'END' },
      { targetSound: 'ee', word: 'EAST', position: 'START' },
      { targetSound: 'ee', word: 'KEEP', position: 'MIDDLE' },
      { targetSound: 'ee', word: 'SEA', position: 'END' },
      { targetSound: 'ee', word: 'ME', position: 'END' },
      { targetSound: 'ee', word: 'EAGER', position: 'START' },
      // /a/ target sound
      { targetSound: 'a', word: 'BRASH', position: 'MIDDLE' },
      { targetSound: 'a', word: 'YOGA', position: 'END' },
      { targetSound: 'a', word: 'AMBIT', position: 'START' },
      { targetSound: 'a', word: 'CLAMP', position: 'MIDDLE' },
      { targetSound: 'a', word: 'SHAMPOO', position: 'MIDDLE' },
      { targetSound: 'a', word: 'ARROW', position: 'START' },
      { targetSound: 'a', word: 'SMACK', position: 'MIDDLE' },
      { targetSound: 'a', word: 'RAN', position: 'MIDDLE' },
      { targetSound: 'a', word: 'ACTOR', position: 'START' },
      { targetSound: 'a', word: 'DRAGON', position: 'MIDDLE' },
      // /u/ target sound
      { targetSound: 'u', word: 'SUN', position: 'MIDDLE' },
      { targetSound: 'u', word: 'UNDER', position: 'START' },
      { targetSound: 'u', word: 'TOFU', position: 'END' },
      { targetSound: 'u', word: 'KUNGFU', position: 'END' },
      { targetSound: 'u', word: 'UNTIL', position: 'START' },
      { targetSound: 'u', word: 'CLUMP', position: 'MIDDLE' },
      { targetSound: 'u', word: 'DRUM', position: 'MIDDLE' },
      { targetSound: 'u', word: 'UNCLE', position: 'START' },
      { targetSound: 'u', word: 'DUST', position: 'MIDDLE' },
      { targetSound: 'u', word: 'SUM', position: 'MIDDLE' }
    ]
  },
  {
    level: 7,
    questions: [
      // /ch/ target sound
      { targetSound: 'ch', word: 'WATCHES', position: 'MIDDLE' },
      { targetSound: 'ch', word: 'CHAMBER', position: 'START' },
      { targetSound: 'ch', word: 'WRENCH', position: 'END' },
      { targetSound: 'ch', word: 'FINCHES', position: 'MIDDLE' },
      { targetSound: 'ch', word: 'NACHOS', position: 'MIDDLE' },
      { targetSound: 'ch', word: 'INCHES', position: 'MIDDLE' },
      { targetSound: 'ch', word: 'KITCHEN', position: 'MIDDLE' },
      { targetSound: 'ch', word: 'CHEESE', position: 'START' },
      { targetSound: 'ch', word: 'CHAMPION', position: 'START' },
      // /ee/ target sound
      { targetSound: 'ee', word: 'FEE', position: 'END' },
      { targetSound: 'ee', word: 'FEVER', position: 'MIDDLE' },
      { targetSound: 'ee', word: 'SNEAKY', position: 'MIDDLE' },
      { targetSound: 'ee', word: 'EMU', position: 'START' },
      { targetSound: 'ee', word: 'MEET', position: 'MIDDLE' },
      { targetSound: 'ee', word: 'KEY', position: 'END' },
      { targetSound: 'ee', word: 'EACH', position: 'START' },
      { targetSound: 'ee', word: 'HEAL', position: 'MIDDLE' },
      { targetSound: 'ee', word: 'ELITE', position: 'MIDDLE' },
      // /a/ target sound
      { targetSound: 'a', word: 'PIZZA', position: 'END' },
      { targetSound: 'a', word: 'AMPLE', position: 'START' },
      { targetSound: 'a', word: 'SPANNER', position: 'MIDDLE' },
      { targetSound: 'a', word: 'ASPECT', position: 'START' },
      { targetSound: 'a', word: 'ANTLER', position: 'START' },
      { targetSound: 'a', word: 'STAND', position: 'MIDDLE' },
      { targetSound: 'a', word: 'PLAN', position: 'MIDDLE' },
      { targetSound: 'a', word: 'BRAND', position: 'MIDDLE' },
      { targetSound: 'a', word: 'TACKLE', position: 'MIDDLE' },
      // /u/ target sound
      { targetSound: 'u', word: 'SUMMER', position: 'MIDDLE' },
      { targetSound: 'u', word: 'FLU', position: 'END' },
      { targetSound: 'u', word: 'MUD', position: 'MIDDLE' },
      { targetSound: 'u', word: 'USHER', position: 'START' },
      { targetSound: 'u', word: 'RUDDER', position: 'MIDDLE' },
      { targetSound: 'u', word: 'CREW', position: 'END' },
      { targetSound: 'u', word: 'SUDDEN', position: 'MIDDLE' },
      { targetSound: 'u', word: 'UMPIRE', position: 'START' },
      { targetSound: 'u', word: 'SUSPECT', position: 'MIDDLE' }
    ]
  },
  {
    level: 8,
    questions: [
      // /ai/ target sound
      { targetSound: 'ai', word: 'AIM', position: 'START' },
      { targetSound: 'ai', word: 'SNAKE', position: 'MIDDLE' },
      { targetSound: 'ai', word: 'AREA', position: 'START' },
      { targetSound: 'ai', word: 'RAY', position: 'END' },
      { targetSound: 'ai', word: 'TRAY', position: 'END' },
      { targetSound: 'ai', word: 'AGING', position: 'START' },
      { targetSound: 'ai', word: 'PLAIN', position: 'MIDDLE' },
      // /i/ target sound
      { targetSound: 'i', word: 'SPINS', position: 'MIDDLE' },
      { targetSound: 'i', word: 'SINCE', position: 'MIDDLE' },
      { targetSound: 'i', word: 'SLICK', position: 'MIDDLE' },
      // /e/ target sound
      { targetSound: 'e', word: 'EGG', position: 'START' },
      { targetSound: 'e', word: 'ELBOW', position: 'START' },
      { targetSound: 'e', word: 'EXTRA', position: 'START' },
      { targetSound: 'e', word: 'ELEPHANT', position: 'START' },
      { targetSound: 'e', word: 'ENTER', position: 'START' },
      // /o/ target sound
      { targetSound: 'o', word: 'ON', position: 'START' },
      { targetSound: 'o', word: 'OFF', position: 'START' },
      { targetSound: 'o', word: 'OVER', position: 'START' },
      { targetSound: 'o', word: 'OPEN', position: 'START' },
      { targetSound: 'o', word: 'OCTOPUS', position: 'START' },
      // /n/ target sound
      { targetSound: 'n', word: 'NET', position: 'START' },
      { targetSound: 'n', word: 'NEST', position: 'START' },
      { targetSound: 'n', word: 'NOSE', position: 'START' },
      { targetSound: 'n', word: 'NUT', position: 'START' },
      { targetSound: 'n', word: 'NIGHT', position: 'START' }
    ]
  },
  {
    level: 9,
    questions: [
      // /ai/ target sound
      { targetSound: 'ai', word: 'FAIL', position: 'MIDDLE' },
      { targetSound: 'ai', word: 'AID', position: 'START' },
      { targetSound: 'ai', word: 'CLAY', position: 'END' },
      { targetSound: 'ai', word: 'HAY', position: 'END' },
      { targetSound: 'ai', word: 'SAKE', position: 'MIDDLE' },
      { targetSound: 'ai', word: 'ANGEL', position: 'START' },
      // /i/ target sound
      { targetSound: 'i', word: 'CLIP', position: 'MIDDLE' },
      { targetSound: 'i', word: 'CLIFF', position: 'MIDDLE' },
      // /e/ target sound
      { targetSound: 'e', word: 'ENGINE', position: 'START' },
      { targetSound: 'e', word: 'NET', position: 'MIDDLE' },
      { targetSound: 'e', word: 'BELL', position: 'MIDDLE' },
      { targetSound: 'e', word: 'HELMET', position: 'MIDDLE' },
      { targetSound: 'e', word: 'STRETCH', position: 'MIDDLE' },
      // /o/ target sound
      { targetSound: 'o', word: 'COLD', position: 'MIDDLE' },
      { targetSound: 'o', word: 'BOAT', position: 'MIDDLE' },
      { targetSound: 'o', word: 'SOAP', position: 'MIDDLE' },
      { targetSound: 'o', word: 'STOP', position: 'MIDDLE' },
      { targetSound: 'o', word: 'FROG', position: 'MIDDLE' },
      // /n/ target sound
      { targetSound: 'n', word: 'ANT', position: 'MIDDLE' },
      { targetSound: 'n', word: 'PONY', position: 'MIDDLE' },
      { targetSound: 'n', word: 'SUNNY', position: 'MIDDLE' },
      { targetSound: 'n', word: 'CANDY', position: 'MIDDLE' },
      { targetSound: 'n', word: 'WINTER', position: 'MIDDLE' }
    ]
  },
  {
    level: 10,
    questions: [
      // /ai/ target sound
      { targetSound: 'ai', word: 'DAME', position: 'MIDDLE' },
      { targetSound: 'ai', word: 'RAID', position: 'MIDDLE' },
      { targetSound: 'ai', word: 'SAY', position: 'END' },
      { targetSound: 'ai', word: 'ACRE', position: 'START' },
      { targetSound: 'ai', word: 'MAY', position: 'MIDDLE' },
      { targetSound: 'ai', word: 'ESCAPE', position: 'MIDDLE' },
      // /i/ target sound
      { targetSound: 'i', word: 'BUILT', position: 'MIDDLE' },
      { targetSound: 'i', word: 'GRIN', position: 'MIDDLE' },
      // /e/ target sound
      { targetSound: 'e', word: 'DESK', position: 'MIDDLE' },
      { targetSound: 'e', word: 'PEN', position: 'MIDDLE' },
      { targetSound: 'e', word: 'CAFE', position: 'END' },
      { targetSound: 'e', word: 'RESUME', position: 'END' },
      { targetSound: 'e', word: 'CLICHE', position: 'END' },
      // /o/ target sound
      { targetSound: 'o', word: 'GO', position: 'END' },
      { targetSound: 'o', word: 'NO', position: 'END' },
      { targetSound: 'o', word: 'POTATO', position: 'END' },
      { targetSound: 'o', word: 'HIPPO', position: 'END' },
      { targetSound: 'o', word: 'HERO', position: 'END' },
      // /n/ target sound
      { targetSound: 'n', word: 'SUN', position: 'END' },
      { targetSound: 'n', word: 'PEN', position: 'END' },
      { targetSound: 'n', word: 'TEN', position: 'END' },
      { targetSound: 'n', word: 'RUN', position: 'END' },
      { targetSound: 'n', word: 'MOON', position: 'END' }
    ]
  }
];
