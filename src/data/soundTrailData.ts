export interface SoundTrailLevel {
  level: number;
  wordChain: string[];
  nodeCount: number;
  pathType: 'linear' | 'zigzag' | 'intersecting' | 'complex';
  playbackSpeed: number; // in milliseconds per step
  coordinates: { x: number; y: number }[];
}

export const soundTrailData: SoundTrailLevel[] = [
  {
    level: 1,
    wordChain: [
      "OF", "OT", "IT", "ID", "OD", "UD", "US", "ES", "AS", "AT", 
      "OT", "ON", "IN", "IM", "IR", "OR", "OS", "US", "UN", "AN", "AT"
    ],
    nodeCount: 3,
    pathType: 'linear',
    playbackSpeed: 1200,
    coordinates: [
      { x: 20, y: 50 },
      { x: 50, y: 50 },
      { x: 80, y: 50 }
    ]
  },
  {
    level: 2,
    wordChain: [
      "CAN", "CAS", "MAS", "MIS", "MID", "FID", "RID", "RED", "NED", "NEM", 
      "MEM", "MOM", "LOM", "LOK", "LAK", "LAD", "GAD", "GOD", "GOF", "ROF", 
      "REF", "RUF"
    ],
    nodeCount: 4,
    pathType: 'linear',
    playbackSpeed: 1000,
    coordinates: [
      { x: 15, y: 50 },
      { x: 38, y: 50 },
      { x: 62, y: 50 },
      { x: 85, y: 50 }
    ]
  },
  {
    level: 3,
    wordChain: [
      "MOP", "MOPE", "MAP", "TAP", "TAG", "RAG", "RIG", "GIG", "GOG", "GOF", 
      "COF", "COB", "CUB", "HUB", "HAB", "SHAB", "SHAM", "SHAME", "TAME", "LAME", 
      "LACE"
    ],
    nodeCount: 5,
    pathType: 'zigzag',
    playbackSpeed: 1000,
    coordinates: [
      { x: 15, y: 30 },
      { x: 32, y: 70 },
      { x: 50, y: 30 },
      { x: 68, y: 70 },
      { x: 85, y: 30 }
    ]
  },
  {
    level: 4,
    wordChain: [
      "FIG", "SIG", "SIM", "SUM", "SUN", "BUN", "BUF", "RUF", "RAF", "RAD", 
      "LAD", "NAD", "NUD", "NOD", "HOD", "HOF", "DOF", "DOM", "DEM", "REM", 
      "RIM"
    ],
    nodeCount: 6,
    pathType: 'intersecting',
    playbackSpeed: 900,
    coordinates: [
      { x: 15, y: 30 },
      { x: 50, y: 70 },
      { x: 85, y: 30 },
      { x: 15, y: 70 },
      { x: 50, y: 30 },
      { x: 85, y: 70 }
    ]
  },
  {
    level: 5,
    wordChain: [
      "FLIT", "FLOT", "FROT", "TROT", "TREET", "TREEP", "CREEP", "CROP", "FROP", "BROP", 
      "BLOP", "BLEEP", "BLAPE", "CLAPE", "CLOPE", "CLOP", "CLOD", "PLOD", "PLUD", "PLUM", 
      "PLUT", "PLUCK"
    ],
    nodeCount: 7,
    pathType: 'complex',
    playbackSpeed: 800,
    coordinates: [
      { x: 15, y: 25 },
      { x: 50, y: 25 },
      { x: 85, y: 25 },
      { x: 85, y: 75 },
      { x: 50, y: 75 },
      { x: 15, y: 75 },
      { x: 50, y: 50 }
    ]
  }
];
