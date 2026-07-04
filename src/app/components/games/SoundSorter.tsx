import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Home, Volume2, RotateCcw, Check, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ThemeToggle } from '../ThemeToggle';
import { PhonemeText } from '../PhonemeText';
import QuitGameModal from '../ui/QuitGameModal';
import { useGameSession } from '../../context/GameSessionContext';
import { playAudio } from '../../../lib/audioUtils';
import { submitGameSession } from '../../../lib/telemetryUtils';

// Data types
interface SorterWord {
  word: string;
  parts: string[];
  type: 'phonemes' | 'syllables';
  soundsCount: number;
}

interface SorterLevel {
  level: number;
  instruction: string;
  description: string;
  words: SorterWord[];
}

// Full 10 levels dataset
const soundSorterLevelData: SorterLevel[] = [
  {
    level: 1,
    instruction: "Rearrange the sounds to spell the word you hear",
    description: "Simple 2 and 3 phonemes blending",
    words: [
      { word: "ON", parts: ["/o/", "/n/"], type: "phonemes", soundsCount: 2 },
      { word: "IT", parts: ["/i/", "/t/"], type: "phonemes", soundsCount: 2 },
      { word: "IS", parts: ["/i/", "/s/"], type: "phonemes", soundsCount: 2 },
      { word: "AT", parts: ["/a/", "/t/"], type: "phonemes", soundsCount: 2 },
      { word: "BE", parts: ["/b/", "/ee/"], type: "phonemes", soundsCount: 2 },
      { word: "SO", parts: ["/s/", "/o/"], type: "phonemes", soundsCount: 2 },
      { word: "US", parts: ["/u/", "/s/"], type: "phonemes", soundsCount: 2 },
      { word: "OR", parts: ["/o/", "/r/"], type: "phonemes", soundsCount: 2 },
      { word: "IF", parts: ["/i/", "/f/"], type: "phonemes", soundsCount: 2 },
      { word: "IN", parts: ["/i/", "/n/"], type: "phonemes", soundsCount: 2 },
      { word: "WE", parts: ["/w/", "/ee/"], type: "phonemes", soundsCount: 2 },
      { word: "TO", parts: ["/t/", "/oo/"], type: "phonemes", soundsCount: 2 },
      { word: "SHOE", parts: ["/sh/", "/oo/"], type: "phonemes", soundsCount: 2 },
      { word: "CUE", parts: ["/k/", "/ue/"], type: "phonemes", soundsCount: 2 },
      { word: "OF", parts: ["/o/", "/f/"], type: "phonemes", soundsCount: 2 }
    ]
  },
  {
    level: 2,
    instruction: "Rearrange the sounds to spell the word you hear",
    description: "Words with 3 phonemes",
    words: [
      { word: "TAP", parts: ["/t/", "/a/", "/p/"], type: "phonemes", soundsCount: 3 },
      { word: "CAP", parts: ["/c/", "/a/", "/p/"], type: "phonemes", soundsCount: 3 },
      { word: "BIN", parts: ["/b/", "/i/", "/n/"], type: "phonemes", soundsCount: 3 },
      { word: "FUN", parts: ["/f/", "/u/", "/n/"], type: "phonemes", soundsCount: 3 },
      { word: "SIP", parts: ["/s/", "/i/", "/p/"], type: "phonemes", soundsCount: 3 },
      { word: "DIM", parts: ["/d/", "/i/", "/m/"], type: "phonemes", soundsCount: 3 },
      { word: "PIN", parts: ["/p/", "/i/", "/n/"], type: "phonemes", soundsCount: 3 },
      { word: "BOX", parts: ["/b/", "/o/", "/x/"], type: "phonemes", soundsCount: 3 },
      { word: "FIN", parts: ["/f/", "/i/", "/n/"], type: "phonemes", soundsCount: 3 },
      { word: "RIB", parts: ["/r/", "/i/", "/b/"], type: "phonemes", soundsCount: 3 },
      { word: "CUB", parts: ["/c/", "/u/", "/b/"], type: "phonemes", soundsCount: 3 },
      { word: "POT", parts: ["/p/", "/o/", "/t/"], type: "phonemes", soundsCount: 3 },
      { word: "CAB", parts: ["/c/", "/a/", "/b/"], type: "phonemes", soundsCount: 3 },
      { word: "BAR", parts: ["/b/", "/a/", "/r/"], type: "phonemes", soundsCount: 3 },
      { word: "MAP", parts: ["/m/", "/a/", "/p/"], type: "phonemes", soundsCount: 3 },
      { word: "NAP", parts: ["/n/", "/a/", "/p/"], type: "phonemes", soundsCount: 3 },
      { word: "SIT", parts: ["/s/", "/i/", "/t/"], type: "phonemes", soundsCount: 3 },
      { word: "CAN", parts: ["/c/", "/a/", "/n/"], type: "phonemes", soundsCount: 3 },
      { word: "GAP", parts: ["/g/", "/a/", "/p/"], type: "phonemes", soundsCount: 3 }
    ]
  },
  {
    level: 3,
    instruction: "Rearrange the sounds to spell the word you hear",
    description: "More 2 and 3 sound words with complex phonemes",
    words: [
      { word: "SHOE", parts: ["/sh/", "/oo/"], type: "phonemes", soundsCount: 2 },
      { word: "BITE", parts: ["/b/", "/ie/", "/t/"], type: "phonemes", soundsCount: 3 },
      { word: "SAFE", parts: ["/s/", "/ae/", "/f/"], type: "phonemes", soundsCount: 3 },
      { word: "CUT", parts: ["/k/", "/u/", "/t/"], type: "phonemes", soundsCount: 3 },
      { word: "MOP", parts: ["/m/", "/o/", "/p/"], type: "phonemes", soundsCount: 3 },
      { word: "RUB", parts: ["/r/", "/u/", "/b/"], type: "phonemes", soundsCount: 3 },
      { word: "TUBE", parts: ["/t/", "/ue/", "/b/"], type: "phonemes", soundsCount: 3 },
      { word: "CALL", parts: ["/k/", "/ah/", "/l/"], type: "phonemes", soundsCount: 3 },
      { word: "FILL", parts: ["/f/", "/i/", "/l/"], type: "phonemes", soundsCount: 3 },
      { word: "THIN", parts: ["/th/", "/i/", "/n/"], type: "phonemes", soundsCount: 3 },
      { word: "SHIP", parts: ["/sh/", "/i/", "/p/"], type: "phonemes", soundsCount: 3 },
      { word: "DIP", parts: ["/d/", "/i/", "/p/"], type: "phonemes", soundsCount: 3 },
      { word: "RID", parts: ["/r/", "/i/", "/d/"], type: "phonemes", soundsCount: 3 },
      { word: "INCH", parts: ["/i/", "/n/", "/ch/"], type: "phonemes", soundsCount: 3 },
      { word: "ASP", parts: ["/a/", "/s/", "/p/"], type: "phonemes", soundsCount: 3 },
      { word: "OWL", parts: ["/ow/", "/l/"], type: "phonemes", soundsCount: 2 },
      { word: "FAR", parts: ["/f/", "/ah/", "/r/"], type: "phonemes", soundsCount: 3 },
      { word: "VAN", parts: ["/v/", "/a/", "/n/"], type: "phonemes", soundsCount: 3 },
      { word: "SPA", parts: ["/s/", "/p/", "/ah/"], type: "phonemes", soundsCount: 3 },
      { word: "GONE", parts: ["/g/", "/o/", "/n/"], type: "phonemes", soundsCount: 3 }
    ]
  },
  {
    level: 4,
    instruction: "Rearrange the sounds to spell the word you hear",
    description: "Simple 3 and 4 sound words with consonant blends",
    words: [
      { word: "SLIP", parts: ["/s/", "/l/", "/i/", "/p/"], type: "phonemes", soundsCount: 4 },
      { word: "CRIB", parts: ["/c/", "/r/", "/i/", "/b/"], type: "phonemes", soundsCount: 4 },
      { word: "SHOP", parts: ["/sh/", "/o/", "/p/"], type: "phonemes", soundsCount: 3 },
      { word: "SAND", parts: ["/s/", "/a/", "/n/", "/d/"], type: "phonemes", soundsCount: 4 },
      { word: "FLOP", parts: ["/f/", "/l/", "/o/", "/p/"], type: "phonemes", soundsCount: 4 },
      { word: "TASK", parts: ["/t/", "/a/", "/s/", "/k/"], type: "phonemes", soundsCount: 4 },
      { word: "DUST", parts: ["/d/", "/u/", "/s/", "/t/"], type: "phonemes", soundsCount: 4 },
      { word: "MARK", parts: ["/m/", "/a/", "/r/", "/k/"], type: "phonemes", soundsCount: 4 },
      { word: "KITE", parts: ["/k/", "/ie/", "/t/"], type: "phonemes", soundsCount: 3 },
      { word: "CAMP", parts: ["/c/", "/a/", "/m/", "/p/"], type: "phonemes", soundsCount: 4 },
      { word: "FLAP", parts: ["/f/", "/l/", "/a/", "/p/"], type: "phonemes", soundsCount: 4 },
      { word: "TRIP", parts: ["/t/", "/r/", "/i/", "/p/"], type: "phonemes", soundsCount: 4 },
      { word: "SPOON", parts: ["/s/", "/p/", "/oo/", "/n/"], type: "phonemes", soundsCount: 4 },
      { word: "CRAB", parts: ["/k/", "/r/", "/a/", "/b/"], type: "phonemes", soundsCount: 4 },
      { word: "FLAG", parts: ["/f/", "/l/", "/a/", "/g/"], type: "phonemes", soundsCount: 4 },
      { word: "WHEN", parts: ["/w/", "/e/", "/n/"], type: "phonemes", soundsCount: 3 },
      { word: "GANG", parts: ["/g/", "/a/", "/n/", "/g/"], type: "phonemes", soundsCount: 4 },
      { word: "BLUE", parts: ["/b/", "/l/", "/oo/"], type: "phonemes", soundsCount: 3 },
      { word: "CHAT", parts: ["/ch/", "/a/", "/t/"], type: "phonemes", soundsCount: 3 },
      { word: "SPEED", parts: ["/s/", "/p/", "/ee/", "/d/"], type: "phonemes", soundsCount: 4 }
    ]
  },
  {
    level: 5,
    instruction: "Rearrange the sounds to spell the word you hear",
    description: "3 and 4 sound words with consonant blends",
    words: [
      { word: "DISC", parts: ["/d/", "/i/", "/s/", "/k/"], type: "phonemes", soundsCount: 4 },
      { word: "PLAIN", parts: ["/p/", "/l/", "/ai/", "/n/"], type: "phonemes", soundsCount: 4 },
      { word: "SKID", parts: ["/s/", "/k/", "/i/", "/d/"], type: "phonemes", soundsCount: 4 },
      { word: "PLUS", parts: ["/p/", "/l/", "/u/", "/s/"], type: "phonemes", soundsCount: 4 },
      { word: "KING", parts: ["/k/", "/i/", "/n/", "/g/"], type: "phonemes", soundsCount: 4 },
      { word: "WASTE", parts: ["/w/", "/ae/", "/s/", "/t/"], type: "phonemes", soundsCount: 4 },
      { word: "CHANCE", parts: ["/ch/", "/a/", "/n/", "/s/"], type: "phonemes", soundsCount: 4 },
      { word: "MILD", parts: ["/m/", "/i/", "/l/", "/d/"], type: "phonemes", soundsCount: 4 },
      { word: "BLANK", parts: ["/b/", "/l/", "/a/", "/n/", "/k/"], type: "phonemes", soundsCount: 5 },
      { word: "BELT", parts: ["/b/", "/e/", "/l/", "/t/"], type: "phonemes", soundsCount: 4 },
      { word: "FEST", parts: ["/f/", "/e/", "/s/", "/t/"], type: "phonemes", soundsCount: 4 },
      { word: "RANG", parts: ["/r/", "/a/", "/n/", "/g/"], type: "phonemes", soundsCount: 4 },
      { word: "BOLD", parts: ["/b/", "/o/", "/l/", "/d/"], type: "phonemes", soundsCount: 4 },
      { word: "TRUCK", parts: ["/t/", "/r/", "/u/", "/k/"], type: "phonemes", soundsCount: 4 },
      { word: "MUST", parts: ["/m/", "/u/", "/s/", "/t/"], type: "phonemes", soundsCount: 4 },
      { word: "DRIVE", parts: ["/d/", "/r/", "/ie/", "/v/"], type: "phonemes", soundsCount: 4 },
      { word: "CHILD", parts: ["/ch/", "/ie/", "/l/", "/d/"], type: "phonemes", soundsCount: 4 },
      { word: "PAST", parts: ["/p/", "/a/", "/s/", "/t/"], type: "phonemes", soundsCount: 4 },
      { word: "JUMP", parts: ["/j/", "/u/", "/m/", "/p/"], type: "phonemes", soundsCount: 4 },
      { word: "HAND", parts: ["/h/", "/a/", "/n/", "/d/"], type: "phonemes", soundsCount: 4 }
    ]
  },
  {
    level: 6,
    instruction: "Rearrange the sounds to spell the word you hear",
    description: "Complex 3, 4 and 5 sound words with double blends",
    words: [
      { word: "DRINK", parts: ["/d/", "/r/", "/i/", "/n/", "/k/"], type: "phonemes", soundsCount: 5 },
      { word: "MARCH", parts: ["/m/", "/ah/", "/r/", "/ch/"], type: "phonemes", soundsCount: 4 },
      { word: "SCARF", parts: ["/s/", "/k/", "/ah/", "/r/", "/f/"], type: "phonemes", soundsCount: 5 },
      { word: "TWIST", parts: ["/t/", "/w/", "/i/", "/s/", "/t/"], type: "phonemes", soundsCount: 5 },
      { word: "HEFTY", parts: ["/h/", "/e/", "/f/", "/t/", "/i/"], type: "phonemes", soundsCount: 5 },
      { word: "CAST", parts: ["/c/", "/a/", "/s/", "/t/"], type: "phonemes", soundsCount: 4 },
      { word: "FLING", parts: ["/f/", "/l/", "/i/", "/n/", "/g/"], type: "phonemes", soundsCount: 5 },
      { word: "TOSS", parts: ["/t/", "/o/", "/s/", "/s/"], type: "phonemes", soundsCount: 3 },
      { word: "RIVER", parts: ["/r/", "/i/", "/v/", "/e/", "/r/"], type: "phonemes", soundsCount: 5 },
      { word: "SLING", parts: ["/s/", "/l/", "/i/", "/n/", "/g/"], type: "phonemes", soundsCount: 5 },
      { word: "CLANG", parts: ["/c/", "/l/", "/a/", "/n/", "/g/"], type: "phonemes", soundsCount: 5 },
      { word: "TROOP", parts: ["/t/", "/r/", "/oo/", "/p/"], type: "phonemes", soundsCount: 4 },
      { word: "SWITCH", parts: ["/s/", "/w/", "/i/", "/ch/"], type: "phonemes", soundsCount: 4 },
      { word: "BATCH", parts: ["/b/", "/a/", "/ch/"], type: "phonemes", soundsCount: 3 },
      { word: "SMOKE", parts: ["/s/", "/m/", "/oe/", "/k/"], type: "phonemes", soundsCount: 4 },
      { word: "DROWN", parts: ["/d/", "/r/", "/ow/", "/n/"], type: "phonemes", soundsCount: 4 },
      { word: "COFFEE", parts: ["/c/", "/o/", "/f/", "/ee/"], type: "phonemes", soundsCount: 4 },
      { word: "BRING", parts: ["/b/", "/r/", "/i/", "/n/", "/g/"], type: "phonemes", soundsCount: 5 },
      { word: "MARKET", parts: ["/m/", "/ah/", "/r/", "/k/", "/t/"], type: "phonemes", soundsCount: 5 },
      { word: "SPACE", parts: ["/s/", "/p/", "/ae/", "/s/"], type: "phonemes", soundsCount: 4 }
    ]
  },
  {
    level: 7,
    instruction: "Rearrange the syllables to spell the word you hear",
    description: "Two syllable word blending",
    words: [
      { word: "butter", parts: ["but", "ter"], type: "syllables", soundsCount: 2 },
      { word: "plastic", parts: ["pla", "stic"], type: "syllables", soundsCount: 2 },
      { word: "table", parts: ["ta", "ble"], type: "syllables", soundsCount: 2 },
      { word: "dancing", parts: ["dan", "cing"], type: "syllables", soundsCount: 2 },
      { word: "dusty", parts: ["dus", "ty"], type: "syllables", soundsCount: 2 },
      { word: "dirty", parts: ["dir", "ty"], type: "syllables", soundsCount: 2 },
      { word: "filter", parts: ["fil", "ter"], type: "syllables", soundsCount: 2 },
      { word: "magnet", parts: ["mag", "net"], type: "syllables", soundsCount: 2 },
      { word: "pumpkin", parts: ["pump", "kin"], type: "syllables", soundsCount: 2 },
      { word: "distress", parts: ["dis", "tress"], type: "syllables", soundsCount: 2 },
      { word: "argue", parts: ["ar", "gue"], type: "syllables", soundsCount: 2 },
      { word: "hippo", parts: ["hip", "po"], type: "syllables", soundsCount: 2 },
      { word: "monkey", parts: ["mon", "key"], type: "syllables", soundsCount: 2 },
      { word: "purchase", parts: ["pur", "chase"], type: "syllables", soundsCount: 2 },
      { word: "zipper", parts: ["zip", "per"], type: "syllables", soundsCount: 2 },
      { word: "packet", parts: ["pa", "cket"], type: "syllables", soundsCount: 2 },
      { word: "fellow", parts: ["fel", "low"], type: "syllables", soundsCount: 2 },
      { word: "pencil", parts: ["pen", "cil"], type: "syllables", soundsCount: 2 },
      { word: "winter", parts: ["win", "ter"], type: "syllables", soundsCount: 2 }
    ]
  },
  {
    level: 8,
    instruction: "Rearrange the syllables to spell the word you hear",
    description: "Two and three syllable blends",
    words: [
      { word: "sitting", parts: ["sit", "ting"], type: "syllables", soundsCount: 2 },
      { word: "person", parts: ["per", "son"], type: "syllables", soundsCount: 2 },
      { word: "calendar", parts: ["cal", "en", "dar"], type: "syllables", soundsCount: 3 },
      { word: "impress", parts: ["im", "press"], type: "syllables", soundsCount: 2 },
      { word: "funny", parts: ["fun", "ny"], type: "syllables", soundsCount: 2 },
      { word: "lollipop", parts: ["lo", "li", "pop"], type: "syllables", soundsCount: 3 },
      { word: "family", parts: ["fa", "mi", "lee"], type: "syllables", soundsCount: 3 },
      { word: "rabbit", parts: ["ra", "bit"], type: "syllables", soundsCount: 2 },
      { word: "tomato", parts: ["to", "ma", "to"], type: "syllables", soundsCount: 3 },
      { word: "place", parts: ["pl", "ace"], type: "syllables", soundsCount: 2 },
      { word: "battery", parts: ["bat", "te", "ry"], type: "syllables", soundsCount: 3 },
      { word: "buses", parts: ["bus", "es"], type: "syllables", soundsCount: 2 },
      { word: "flamingo", parts: ["fla", "min", "go"], type: "syllables", soundsCount: 3 },
      { word: "butterfly", parts: ["but", "ter", "fly"], type: "syllables", soundsCount: 3 },
      { word: "music", parts: ["mu", "sic"], type: "syllables", soundsCount: 2 },
      { word: "paper", parts: ["pa", "per"], type: "syllables", soundsCount: 2 },
      { word: "telephone", parts: ["te", "le", "fone"], type: "syllables", soundsCount: 3 },
      { word: "sponsor", parts: ["spon", "sor"], type: "syllables", soundsCount: 2 },
      { word: "lemonade", parts: ["le", "mo", "nade"], type: "syllables", soundsCount: 3 }
    ]
  },
  {
    level: 9,
    instruction: "Rearrange the syllables to spell the word you hear",
    description: "Advanced three and four syllable words",
    words: [
      { word: "transform", parts: ["trans", "form"], type: "syllables", soundsCount: 2 },
      { word: "photograph", parts: ["pho", "to", "graph"], type: "syllables", soundsCount: 3 },
      { word: "punishment", parts: ["pu", "nish", "ment"], type: "syllables", soundsCount: 3 },
      { word: "advancement", parts: ["ad", "vance", "ment"], type: "syllables", soundsCount: 3 },
      { word: "uniform", parts: ["u", "ni", "form"], type: "syllables", soundsCount: 3 },
      { word: "protection", parts: ["pro", "tec", "tion"], type: "syllables", soundsCount: 3 },
      { word: "remember", parts: ["re", "mem", "ber"], type: "syllables", soundsCount: 3 },
      { word: "confusion", parts: ["con", "fu", "sion"], type: "syllables", soundsCount: 3 },
      { word: "distribute", parts: ["dis", "tri", "bute"], type: "syllables", soundsCount: 3 },
      { word: "purposely", parts: ["pur", "pose", "ly"], type: "syllables", soundsCount: 3 },
      { word: "incentive", parts: ["in", "cen", "tive"], type: "syllables", soundsCount: 3 },
      { word: "appointment", parts: ["app", "oint", "ment"], type: "syllables", soundsCount: 3 },
      { word: "radio", parts: ["ra", "di", "o"], type: "syllables", soundsCount: 3 },
      { word: "invisible", parts: ["in", "vi", "si", "ble"], type: "syllables", soundsCount: 4 },
      { word: "temptation", parts: ["tem", "ta", "tion"], type: "syllables", soundsCount: 3 },
      { word: "attention", parts: ["at", "ten", "tion"], type: "syllables", soundsCount: 3 },
      { word: "elephant", parts: ["e", "le", "phant"], type: "syllables", soundsCount: 3 },
      { word: "helicopter", parts: ["he", "li", "cop", "ter"], type: "syllables", soundsCount: 4 },
      { word: "elevator", parts: ["e", "le", "va", "ton"], type: "syllables", soundsCount: 4 },
      { word: "umbrella", parts: ["um", "brel", "la"], type: "syllables", soundsCount: 3 },
      { word: "banana", parts: ["ba", "na", "na"], type: "syllables", soundsCount: 3 }
    ]
  },
  {
    level: 10,
    instruction: "Rearrange the syllables to spell the word you hear",
    description: "Complex multi-syllable word construction",
    words: [
      { word: "nocturnally", parts: ["noc", "tur", "nal", "ly"], type: "syllables", soundsCount: 4 },
      { word: "cafeteria", parts: ["ca", "fe", "te", "ria"], type: "syllables", soundsCount: 4 },
      { word: "calculator", parts: ["cal", "cu", "la", "tor"], type: "syllables", soundsCount: 4 },
      { word: "intelligent", parts: ["in", "tel", "li", "gent"], type: "syllables", soundsCount: 4 },
      { word: "cemetery", parts: ["ce", "me", "te", "ry"], type: "syllables", soundsCount: 4 },
      { word: "impossible", parts: ["im", "pos", "si", "ble"], type: "syllables", soundsCount: 4 },
      { word: "celebration", parts: ["ce", "le", "bra", "tion"], type: "syllables", soundsCount: 4 },
      { word: "vocabulary", parts: ["vo", "ca", "bu", "la", "ry"], type: "syllables", soundsCount: 5 },
      { word: "simplicity", parts: ["sim", "pli", "ci", "ty"], type: "syllables", soundsCount: 4 },
      { word: "cauliflower", parts: ["cau", "li", "flow", "er"], type: "syllables", soundsCount: 4 },
      { word: "energetic", parts: ["en", "er", "ge", "tic"], type: "syllables", soundsCount: 4 },
      { word: "university", parts: ["u", "ni", "ver", "si", "ty"], type: "syllables", soundsCount: 5 },
      { word: "certificate", parts: ["cer", "ti", "fi", "cate"], type: "syllables", soundsCount: 4 },
      { word: "calculation", parts: ["cal", "cu", "la", "tion"], type: "syllables", soundsCount: 4 },
      { word: "electrician", parts: ["e", "lec", "tri", "cian"], type: "syllables", soundsCount: 4 },
      { word: "elimination", parts: ["e", "li", "mi", "na", "tion"], type: "syllables", soundsCount: 5 },
      { word: "macaroni", parts: ["ma", "ca", "ro", "ni"], type: "syllables", soundsCount: 4 },
      { word: "association", parts: ["as", "so", "ci", "a", "tion"], type: "syllables", soundsCount: 5 },
      { word: "imagination", parts: ["i", "ma", "gi", "na", "tion"], type: "syllables", soundsCount: 5 },
      { word: "formulation", parts: ["for", "mu", "la", "tion"], type: "syllables", soundsCount: 4 },
      { word: "disobedient", parts: ["dis", "o", "be", "di", "ent"], type: "syllables", soundsCount: 5 }
    ]
  }
];

// Fisher-Yates shuffle helper
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function SoundSorter() {
  const navigate = useNavigate();
  const { level } = useParams();
  const { progressorId } = useGameSession();

  const levelStr = level || '1';
  const levelNum = Number(levelStr);

  const levelConfig = soundSorterLevelData.find(l => l.level === levelNum) || soundSorterLevelData[0];

  // Game flow states
  const [questions, setQuestions] = useState<SorterWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Question active board state
  const [placedParts, setPlacedParts] = useState<(string | null)[]>([]);
  const [availableParts, setAvailableParts] = useState<{ id: number; text: string; isUsed: boolean }[]>([]);

  const startTimeRef = useRef<number>(Date.now());

  // Speak text using TTS
  const speak = (text: string) => {
    playAudio(text);
  };

  // Initialize Game Board for Level
  useEffect(() => {
    startTimeRef.current = Date.now();
    setTimeElapsed(0);
    setCurrentIndex(0);
    setScore(0);
    setMissedWords([]);
    setIsTransitioning(false);

    // Grab pool, shuffle, and slice 10 questions
    const shuffledPool = shuffleArray(levelConfig.words);
    const selected = shuffledPool.slice(0, 10);
    setQuestions(selected);

    if (selected.length > 0) {
      setupQuestion(selected[0]);
    }
  }, [levelStr]);

  // Setup state for active question
  const setupQuestion = (q: SorterWord) => {
    setPlacedParts(Array(q.parts.length).fill(null));
    
    // Shuffle the available parts with a unique id mapping
    const mapped = q.parts.map((p, idx) => ({
      id: idx,
      text: p,
      isUsed: false
    }));
    setAvailableParts(shuffleArray(mapped));

    // Play target word audio automatically
    setTimeout(() => {
      speak(q.word);
    }, 500);
  };

  // Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup Synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle clicking an available part to place in slot
  const handlePartSelect = (partId: number) => {
    if (isTransitioning) return;

    const targetPart = availableParts.find(p => p.id === partId);
    if (!targetPart || targetPart.isUsed) return;

    // Speak phoneme or syllable on click
    speak(targetPart.text);

    // Find first empty index in placed slots
    const emptyIdx = placedParts.indexOf(null);
    if (emptyIdx === -1) return;

    // Place part
    const nextPlaced = [...placedParts];
    nextPlaced[emptyIdx] = targetPart.text;
    setPlacedParts(nextPlaced);

    // Mark as used in pool
    setAvailableParts(prev =>
      prev.map(p => (p.id === partId ? { ...p, isUsed: true } : p))
    );
  };

  // Remove a placed part back to the pool
  const handlePlacedClick = (index: number) => {
    if (isTransitioning) return;

    const value = placedParts[index];
    if (!value) return;

    // Clear from slot
    const nextPlaced = [...placedParts];
    nextPlaced[index] = null;
    setPlacedParts(nextPlaced);

    // Restore to available pool (find first matching text that is marked used)
    setAvailableParts(prev => {
      const idx = prev.findIndex(p => p.text === value && p.isUsed);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], isUsed: false };
        return copy;
      }
      return prev;
    });
  };

  const handleReset = () => {
    if (isTransitioning || questions.length === 0) return;
    setupQuestion(questions[currentIndex]);
  };

  const handleSubmit = () => {
    if (isTransitioning || questions.length === 0) return;

    const currentQ = questions[currentIndex];
    const isCompleted = placedParts.every(p => p !== null);
    if (!isCompleted) {
      toast.error('Place all sounds before submitting!');
      return;
    }

    setIsTransitioning(true);

    // Verify ordering
    const resultWord = placedParts.join('');
    const correctWord = currentQ.parts.join('');
    const isCorrect = resultWord === correctWord;
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
      toast.success(`Awesome! The word is "${currentQ.word.toUpperCase()}"`, {
        icon: <Check className="w-5 h-5 text-green-500" />,
        className: 'bg-card border border-green-500 text-foreground rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1200,
      });
    } else {
      // Record missed word
      setMissedWords(prev => [...prev, currentQ.word]);
      toast.error(`Keep practicing! The word is "${currentQ.word.toUpperCase()}"`, {
        icon: <X className="w-5 h-5 text-primary" />,
        className: 'bg-card border border-primary text-foreground rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1500,
      });
    }

    // Advance to next question or complete level after delay
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentIndex(nextIndex);
        setupQuestion(questions[nextIndex]);
        setIsTransitioning(false);
      } else {
        handleLevelComplete(nextScore);
      }
    }, 1500);
  };

  const handleLevelComplete = async (finalScore: number) => {
    const totalQuestionsCount = questions.length;
    const accuracy = totalQuestionsCount > 0 ? Math.round((finalScore / totalQuestionsCount) * 100) : 0;
    
    const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const activeId = progressorId || 'demo';

    // 1. Submit telemetry to database FIRST using locally calculated variables
    await submitGameSession({
      progressorId: activeId,
      gameId: 'sound-sorter',
      level: levelNum,
      score: finalScore,
      totalQuestions: totalQuestionsCount,
      accuracy: accuracy,
      timeTaken: formattedTime
    });

    // 3. Navigate to result screen
    navigate('/result', {
      state: {
        score: finalScore,
        totalQuestions: totalQuestionsCount,
        total: totalQuestionsCount,
        timeTaken: formattedTime,
        timeElapsed: elapsedSeconds,
        gameId: 'sound-sorter',
        level: levelNum,
        progressorId: activeId,
        missedWords
      }
    });
  };

  const formatTimeDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6347] mb-4"></div>
          <p className="text-muted-foreground font-sans">Preparing Phonics Deck...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = (currentIndex / questions.length) * 100;
  const isFilled = placedParts.every(p => p !== null);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowQuitModal(true)}
              className="p-3 rounded-2xl bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300"
              aria-label="Back"
            >
              <Home className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold text-foreground">Sound Sorter</h3>
              <p className="text-sm text-muted-foreground">Level {levelStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-sans">Time</p>
              <p className="font-medium tabular-nums">{formatTimeDisplay(timeElapsed)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-sans">Score</p>
              <p className="font-medium">{score}/{currentIndex}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-muted h-2 w-full">
        <div
          className="h-full bg-[#FF6347] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Game Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center"
          >
            {/* Instructions */}
            <div className="mb-6 text-center max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-extrabold font-poppins leading-tight mb-2">
                {levelConfig.instruction}
              </h2>
              <p className="text-muted-foreground text-sm font-sans">
                {levelConfig.description} • Question {currentIndex + 1} of {questions.length}
              </p>
            </div>

            {/* Target Audio Card */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => speak(currentQ.word)}
              className="mb-8 p-6 md:p-8 rounded-[2rem] bg-[#FF6347]/10 border-2 border-[#FF6347]/30 text-foreground flex items-center justify-center gap-4 cursor-pointer hover:border-[#FF6347]/50 shadow-sm"
              title="Click to play target word"
            >
              <div className="w-14 h-14 rounded-full bg-[#FF6347] flex items-center justify-center text-white shadow-md">
                <Volume2 className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h4 className="font-black text-xl tracking-wide uppercase text-[#FF6347] font-poppins">
                  LISTEN TO WORD
                </h4>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Click to hear the blending target
                </p>
              </div>
            </motion.button>

            {/* Drop Zones Slots */}
            <div className="flex flex-wrap justify-center gap-4 mb-10 w-full max-w-2xl px-2">
              {placedParts.map((part, idx) => (
                <motion.div
                  key={`slot-${idx}`}
                  layout
                  className={`w-24 h-24 md:w-28 md:h-28 rounded-[1.5rem] border-2 flex flex-col items-center justify-center transition-all ${
                    part
                      ? 'border-[#FF6347]/40 bg-[#FF6347]/5 shadow-sm'
                      : 'border-border bg-card'
                  }`}
                >
                  {part ? (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlacedClick(idx)}
                      className="w-full h-full flex flex-col items-center justify-center p-2 relative text-foreground font-poppins"
                    >
                      <PhonemeText
                        phoneme={part}
                        className="font-bold text-lg md:text-xl uppercase select-none leading-none"
                      />
                      <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-[#FF6347]/10 text-[#FF6347] hover:bg-[#FF6347]/20 transition-colors">
                        <X className="w-3 h-3" />
                      </div>
                    </motion.button>
                  ) : (
                    <span className="text-xs text-muted-foreground font-sans uppercase font-medium tracking-wider select-none">
                      Slot {idx + 1}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Draggable/Selectable Parts Pool */}
            <div className="w-full max-w-2xl bg-card/60 backdrop-blur-sm border border-border p-6 rounded-[2rem] shadow-inner mb-8">
              <p className="text-center text-xs text-muted-foreground uppercase tracking-widest font-sans font-semibold mb-4">
                Available Sounds
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {availableParts.map(part => {
                  return (
                    <motion.button
                      key={`part-${part.id}`}
                      layout
                      whileHover={part.isUsed ? {} : { scale: 1.05, y: -4 }}
                      whileTap={part.isUsed ? {} : { scale: 0.95 }}
                      disabled={part.isUsed}
                      onClick={() => handlePartSelect(part.id)}
                      className={`w-24 h-24 md:w-28 md:h-28 rounded-[1.5rem] border-2 flex flex-col items-center justify-center p-2 transition-all relative ${
                        part.isUsed
                          ? 'border-border/30 bg-muted/30 text-muted-foreground/30 opacity-40 cursor-not-allowed'
                          : 'border-border bg-card hover:border-[#FF6347] hover:bg-[#FF6347]/5 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      {!part.isUsed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speak(part.text);
                          }}
                          className="absolute bottom-1.5 right-1.5 p-1 rounded-full bg-background/80 hover:bg-background border border-border/50 text-[#FF6347] shadow-sm z-10"
                          title="Speak sound"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      
                      <PhonemeText
                        phoneme={part.text}
                        className="font-extrabold text-lg md:text-xl uppercase select-none tracking-wide"
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Gameplay Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary hover:bg-muted hover:scale-105 active:scale-95 border border-border text-foreground text-sm font-semibold transition-all duration-300 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
                Reset Board
              </button>

              <button
                onClick={handleSubmit}
                disabled={!isFilled || isTransitioning}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-base shadow-md transition-all duration-300 cursor-pointer ${
                  !isFilled || isTransitioning
                    ? 'bg-muted border border-border text-muted-foreground cursor-not-allowed opacity-50'
                    : 'bg-[#FF6347] hover:bg-[#FF6347]/95 hover:scale-105 active:scale-95 text-white shadow-[#FF6347]/20 hover:shadow-lg'
                }`}
              >
                Verify Sequence
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="pb-8 text-center text-xs text-muted-foreground font-sans">
        Sound Voyage Clinical Suite • Phonics Sound Sorter
      </div>
      <QuitGameModal
        isOpen={showQuitModal}
        onClose={() => setShowQuitModal(false)}
        onConfirm={() => navigate(-1)}
      />
    </div>
  );
}
