export interface SoundTrailChain {
  words: string[];
  positions: number[]; // Changed phoneme position for each transition (1-indexed)
}

export interface SoundTrailLevel {
  level: number;
  nodeCount: number; // Chain length (number of words/nodes)
  phonemeCount: number; // Number of phonemes in the level's words (number of plates to display)
  pathType: 'linear' | 'zigzag' | 'intersecting' | 'complex';
  playbackSpeed: number;
  coordinates: { x: number; y: number }[];
  chains: SoundTrailChain[];
}

export const soundTrailData: SoundTrailLevel[] = [
  {
    level: 1,
    nodeCount: 3,
    phonemeCount: 2,
    pathType: 'linear',
    playbackSpeed: 1200,
    coordinates: [
      { x: 20, y: 50 },
      { x: 50, y: 50 },
      { x: 80, y: 50 }
    ],
    chains: [
      { words: ["ON", "IN", "IT"], positions: [1, 2] },
      { words: ["AT", "IT", "IN"], positions: [1, 2] },
      { words: ["IN", "IS", "US"], positions: [2, 1] },
      { words: ["UP", "US", "AS"], positions: [2, 1] },
      { words: ["AM", "AN", "ON"], positions: [2, 1] }
    ]
  },
  {
    level: 2,
    nodeCount: 4,
    phonemeCount: 3,
    pathType: 'linear',
    playbackSpeed: 1000,
    coordinates: [
      { x: 15, y: 50 },
      { x: 38, y: 50 },
      { x: 62, y: 50 },
      { x: 85, y: 50 }
    ],
    chains: [
      { words: ["CAN", "CAT", "HAT", "HOT"], positions: [3, 1, 2] },
      { words: ["POT", "HOT", "HAT", "MAT"], positions: [1, 2, 1] },
      { words: ["PEN", "PAN", "MAN", "MAT"], positions: [2, 1, 3] },
      { words: ["SIT", "SAT", "SAD", "MAD"], positions: [2, 3, 1] },
      { words: ["PIG", "PEG", "LEG", "LET"], positions: [2, 1, 3] }
    ]
  },
  {
    level: 3,
    nodeCount: 5,
    phonemeCount: 3,
    pathType: 'zigzag',
    playbackSpeed: 1000,
    coordinates: [
      { x: 15, y: 30 },
      { x: 32, y: 70 },
      { x: 50, y: 30 },
      { x: 68, y: 70 },
      { x: 85, y: 30 }
    ],
    chains: [
      { words: ["MAP", "MOP", "TOP", "TAP", "TAG"], positions: [2, 1, 2, 3] },
      { words: ["TAG", "RAG", "RIG", "WIG", "WIN"], positions: [1, 2, 1, 3] },
      { words: ["WIN", "FIN", "FIT", "FAT", "CAT"], positions: [1, 3, 2, 1] },
      { words: ["CAT", "BAT", "BAG", "BUG", "BUS"], positions: [1, 3, 2, 3] },
      { words: ["BUS", "BUG", "RUG", "RUN", "SUN"], positions: [3, 1, 3, 1] }
    ]
  },
  {
    level: 4,
    nodeCount: 6,
    phonemeCount: 3,
    pathType: 'intersecting',
    playbackSpeed: 900,
    coordinates: [
      { x: 15, y: 30 },
      { x: 50, y: 70 },
      { x: 85, y: 30 },
      { x: 15, y: 70 },
      { x: 50, y: 30 },
      { x: 85, y: 70 }
    ],
    chains: [
      { words: ["FIG", "PIG", "PIN", "PEN", "TEN", "TAN"], positions: [1, 3, 2, 1, 2] },
      { words: ["TAN", "MAN", "MAT", "HAT", "HOT", "POT"], positions: [1, 3, 1, 2, 1] },
      { words: ["POT", "DOT", "DOG", "DIG", "WIG", "WIN"], positions: [1, 3, 2, 1, 3] },
      { words: ["WIN", "FIN", "FAN", "MAN", "MAP", "MOP"], positions: [1, 2, 1, 3, 2] }
    ]
  },
  {
    level: 5,
    nodeCount: 7,
    phonemeCount: 4,
    pathType: 'complex',
    playbackSpeed: 850,
    coordinates: [
      { x: 15, y: 25 },
      { x: 50, y: 25 },
      { x: 85, y: 25 },
      { x: 85, y: 75 },
      { x: 50, y: 75 },
      { x: 15, y: 75 },
      { x: 50, y: 50 }
    ],
    chains: [
      { words: ["SLIP", "CLIP", "FLIP", "FLAP", "FLAT", "FLOAT", "FLEET"], positions: [1, 1, 3, 4, 3, 3] },
      { words: ["SLIP", "SLIT", "SLOT", "SPOT", "SPIT", "SPIN", "SPAN"], positions: [4, 3, 2, 3, 4, 3] },
      { words: ["TRIP", "TRAP", "TRAM", "DRAM", "DRAG", "BRAG", "BRAT"], positions: [3, 4, 1, 4, 1, 4] },
      { words: ["CLAP", "CLIP", "SLIP", "SLIT", "SLOT", "PLOT", "PLOD"], positions: [3, 1, 4, 3, 1, 4] }
    ]
  },
  {
    level: 6,
    nodeCount: 4,
    phonemeCount: 4,
    pathType: 'linear',
    playbackSpeed: 1200,
    coordinates: [
      { x: 15, y: 50 },
      { x: 38, y: 50 },
      { x: 62, y: 50 },
      { x: 85, y: 50 }
    ],
    chains: [
      { words: ["BAND", "BEND", "BENT", "RENT"], positions: [2, 4, 1] },
      { words: ["RENT", "TENT", "TINT", "TINS"], positions: [1, 2, 4] },
      { words: ["TINS", "PINS", "PANS", "PANT"], positions: [1, 2, 4] },
      { words: ["PANT", "PAST", "POST", "LOST"], positions: [3, 2, 1] },
      { words: ["LOST", "LIST", "LINT", "LINK"], positions: [2, 3, 4] },
      { words: ["LINK", "SINK", "SUNK", "BUNK"], positions: [1, 2, 1] },
      { words: ["BUNK", "BANK", "TANK", "SANK"], positions: [2, 1, 1] }
    ]
  },
  {
    level: 7,
    nodeCount: 5,
    phonemeCount: 4,
    pathType: 'zigzag',
    playbackSpeed: 1100,
    coordinates: [
      { x: 15, y: 30 },
      { x: 32, y: 70 },
      { x: 50, y: 30 },
      { x: 68, y: 70 },
      { x: 85, y: 30 }
    ],
    chains: [
      { words: ["CLAD", "CLAN", "PLAN", "PLAT", "FLAT"], positions: [4, 1, 4, 1] },
      { words: ["FLAT", "FLAP", "FLIP", "CLIP", "SLIP"], positions: [4, 3, 1, 1] },
      { words: ["SLIP", "SLIT", "SLOT", "PLOT", "PLOD"], positions: [4, 3, 1, 4] },
      { words: ["PLOD", "PLOP", "PROP", "DROP", "DRIP"], positions: [4, 2, 1, 3] },
      { words: ["DRIP", "TRIP", "TRAP", "TRAM", "GRAM"], positions: [1, 3, 4, 1] }
    ]
  },
  {
    level: 8,
    nodeCount: 6,
    phonemeCount: 4,
    pathType: 'intersecting',
    playbackSpeed: 1050,
    coordinates: [
      { x: 15, y: 30 },
      { x: 50, y: 70 },
      { x: 85, y: 30 },
      { x: 15, y: 70 },
      { x: 50, y: 30 },
      { x: 85, y: 70 }
    ],
    chains: [
      { words: ["FIST", "FAST", "PAST", "POST", "LOST", "LAST"], positions: [2, 1, 2, 1, 2] },
      { words: ["LAST", "LUST", "DUST", "DUSK", "DESK", "DISK"], positions: [2, 1, 4, 2, 2] },
      { words: ["DISK", "RISK", "RINK", "SINK", "SUNK", "BUNK"], positions: [1, 3, 1, 2, 1] },
      { words: ["CAMP", "RAMP", "RUMP", "BUMP", "LUMP", "LIMP"], positions: [1, 2, 1, 1, 2] }
    ]
  },
  {
    level: 9,
    nodeCount: 6,
    phonemeCount: 4,
    pathType: 'intersecting',
    playbackSpeed: 1000,
    coordinates: [
      { x: 30, y: 25 },
      { x: 70, y: 25 },
      { x: 85, y: 50 },
      { x: 70, y: 75 },
      { x: 30, y: 75 },
      { x: 15, y: 50 }
    ],
    chains: [
      { words: ["DRIP", "DROP", "PROP", "PLOP", "PLOT", "SLOT"], positions: [3, 1, 2, 4, 1] },
      { words: ["SLOT", "SLIT", "SLIP", "CLIP", "CLAP", "CLAN"], positions: [3, 4, 1, 3, 4] },
      { words: ["CLAN", "PLAN", "PLAT", "FLAT", "FLAP", "FLIP"], positions: [1, 4, 1, 4, 3] },
      { words: ["FLIP", "FLIT", "FLAT", "SLAT", "SLIT", "SPIT"], positions: [4, 3, 1, 3, 2] }
    ]
  },
  {
    level: 10,
    nodeCount: 8,
    phonemeCount: 5,
    pathType: 'complex',
    playbackSpeed: 900,
    coordinates: [
      { x: 15, y: 25 },
      { x: 40, y: 25 },
      { x: 65, y: 25 },
      { x: 85, y: 40 },
      { x: 85, y: 70 },
      { x: 60, y: 75 },
      { x: 35, y: 75 },
      { x: 15, y: 60 }
    ],
    chains: [
      { words: ["BLEND", "BLOND", "BLAND", "BRAND", "GRAND", "GRANT", "GRUNT", "FRONT"], positions: [3, 3, 2, 1, 5, 3, 1] },
      { words: ["BLANK", "FLANK", "FRANK", "PRANK", "PLANK", "PLUNK", "PLINK", "CLINK"], positions: [1, 2, 1, 2, 3, 3, 1] },
      { words: ["CLINK", "CLANK", "BLANK", "BLINK", "SLINK", "SLUNK", "FLUNK", "FLANK"], positions: [3, 1, 3, 1, 3, 1, 3] }
    ]
  }
];
