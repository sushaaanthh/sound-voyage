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
      { words: ["OF", "OT", "IT"], positions: [2, 1] },
      { words: ["IT", "ID", "OD"], positions: [2, 1] },
      { words: ["OD", "UD", "US"], positions: [1, 2] },
      { words: ["US", "ES", "AS"], positions: [1, 1] },
      { words: ["IN", "IM", "IR"], positions: [2, 2] }
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
      { words: ["CAN", "CAS", "MAS", "MIS"], positions: [3, 1, 2] },
      { words: ["MIS", "MID", "FID", "RID"], positions: [3, 1, 1] },
      { words: ["RID", "RED", "NED", "NEM"], positions: [2, 1, 3] },
      { words: ["LOM", "LOK", "LAK", "LAD"], positions: [3, 2, 3] },
      { words: ["GAD", "GOD", "GOF", "ROF"], positions: [2, 3, 1] }
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
      { words: ["MOP", "MOPE", "MAP", "TAP", "TAG"], positions: [2, 2, 1, 3] },
      { words: ["TAG", "RAG", "RIG", "GIG", "GOG"], positions: [1, 2, 1, 2] },
      { words: ["GOG", "GOF", "COF", "COB", "CUB"], positions: [3, 1, 3, 2] },
      { words: ["CUB", "HUB", "HAB", "SHAB", "SHAM"], positions: [1, 2, 1, 3] },
      { words: ["SHAM", "SHAME", "TAME", "LAME", "LACE"], positions: [2, 1, 1, 3] }
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
      { words: ["FIG", "SIG", "SIM", "SUM", "SUN", "BUN"], positions: [1, 3, 2, 3, 1] },
      { words: ["BUN", "BUF", "RUF", "RAF", "RAD", "LAD"], positions: [3, 1, 2, 3, 1] },
      { words: ["LAD", "NAD", "NUD", "NOD", "HOD", "HOF"], positions: [1, 2, 2, 1, 3] },
      { words: ["HOF", "DOF", "DOM", "DEM", "REM", "RIM"], positions: [1, 3, 2, 1, 2] }
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
      { words: ["FLIT", "FLOT", "FROT", "TROT", "TREET", "TREEP", "CREEP"], positions: [3, 2, 1, 3, 4, 1] },
      { words: ["CREEP", "CROP", "FROP", "BROP", "BLOP", "BLEEP", "BLAPE"], positions: [3, 1, 1, 2, 3, 3] },
      { words: ["BLAPE", "CLAPE", "CLOPE", "CLOP", "CLOD", "PLOD", "PLUD"], positions: [1, 3, 3, 4, 1, 3] },
      { words: ["CLOP", "CLOD", "PLOD", "PLUD", "PLUM", "PLUT", "PLUCK"], positions: [4, 1, 3, 4, 4, 4] }
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
      { words: ["RONCH", "TONCH", "TANCH", "TAND"], positions: [1, 2, 4] },
      { words: ["TAND", "TIND", "TINS", "TUNS"], positions: [2, 4, 2] },
      { words: ["TUNS", "TUMS", "TEMS", "SEMS"], positions: [3, 2, 1] },
      { words: ["SEMS", "SELS", "SALS", "SALP"], positions: [3, 2, 4] },
      { words: ["SALP", "FALP", "FOLP", "DOLP"], positions: [1, 2, 1] },
      { words: ["DOLP", "DOSP", "DISP", "DASP"], positions: [3, 2, 2] },
      { words: ["DASP", "HASP", "HOSP", "HISP"], positions: [1, 2, 2] }
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
      { words: ["CRAD", "CRADE", "FRADE", "FRID", "FLID"], positions: [3, 1, 3, 2] },
      { words: ["FLID", "FLISH", "FLOSH", "FLOCH", "BLOCH"], positions: [4, 3, 4, 1] },
      { words: ["BLOCH", "BLOCK", "BROCK", "TROCK", "TROM"], positions: [4, 2, 1, 4] },
      { words: ["TROM", "TREEM", "PREEM", "PRIME", "CRIME"], positions: [3, 1, 3, 1] },
      { words: ["CRIME", "CRIM", "SHRIM", "SHRIP", "SHRAP"], positions: [3, 1, 4, 3] }
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
      { words: ["CHOST", "CHIST", "FIST", "FOST", "FONT", "LONT"], positions: [2, 1, 2, 3, 1] },
      { words: ["LONT", "LINT", "LIST", "LASTE", "GASTE", "MASTE"], positions: [2, 3, 2, 1, 1] },
      { words: ["MASTE", "MUST", "CUST", "CULT", "BULT", "BOLT"], positions: [2, 1, 3, 1, 2] },
      { words: ["BOLT", "MOLT", "MELT", "DELT", "DALT", "DAST"], positions: [1, 2, 1, 2, 3] }
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
      { words: ["DREEP", "FREEP", "FLEEP", "FLEEM", "FLAME", "BLAME"], positions: [1, 2, 4, 3, 1] },
      { words: ["BLAME", "BLIME", "BLUM", "BLUG", "BLUF", "SLUF"], positions: [3, 3, 4, 4, 1] },
      { words: ["SLUF", "SMUF", "SMIF", "SMICH", "SMECH", "SKECH"], positions: [2, 3, 4, 3, 2] },
      { words: ["SKECH", "SKED", "SKEP", "SKAP", "SKAPE", "SKIP"], positions: [4, 4, 3, 3, 3] }
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
      { words: ["TRONCH", "TRANCH", "PRANCH", "PRAND", "PRANK", "PRINK", "TRINK", "TRIND"], positions: [3, 1, 5, 5, 3, 1, 5] },
      { words: ["TRIND", "TRAND", "CRAND", "CLAND", "CLOND", "PLOND", "PLONK", "PLEENK"], positions: [3, 1, 2, 3, 1, 5, 3] },
      { words: ["PLONK", "PLEENK", "PLEENCH", "PLENCH", "BLENCH", "BLEND", "BLOND", "PLOND"], positions: [3, 5, 3, 1, 5, 3, 1] }
    ]
  }
];
