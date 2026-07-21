export interface PhonemeQuestionOption {
  label: string;
  isCorrect: boolean;
  icon?: string;
}

export interface PhonemeQuestion {
  word?: string;       // Used for binary-single, multiple-choice, select-all
  word1?: string;      // Used for binary-dual
  word2?: string;      // Used for binary-dual
  targetSound?: string; // Optional target sound override per question
  correctAnswer?: 'yes' | 'no' | string; // Used for binary mechanics or single choice
  correctAnswers?: string[]; // Used for multi-select / Level 7 multi-select
  options?: (PhonemeQuestionOption | string)[]; // Used for multiple-choice / select-all / multi-select
  correctPosition?: string | string[]; // Used for multi-position validation
  position?: string | string[]; // Used for multi-position validation
}

export interface PhonemeLevel {
  level: number;
  targetSound: string;
  mechanic: 'binary-single' | 'binary-dual' | 'multiple-choice' | 'select-all' | 'multi-select' | 'position';
  instruction: string;
  questions: PhonemeQuestion[];
}

export const phonemePopLevel3Data = [
  { targetSound: '/k/', options: ['kite', 'balloon', 'ship', 'table'], correctAnswer: 'kite' },
  { targetSound: '/m/', options: ['clock', 'dog', 'map', 'cake'], correctAnswer: 'map' },
  { targetSound: '/f/', options: ['dance', 'rabbit', 'milk', 'fish'], correctAnswer: 'fish' },
  { targetSound: '/d/', options: ['doll', 'man', 'sun', 'apple'], correctAnswer: 'doll' },
  { targetSound: '/b/', options: ['gate', 'bat', 'tree', 'paint'], correctAnswer: 'bat' },
  { targetSound: '/r/', options: ['red', 'fox', 'lion', 'sun'], correctAnswer: 'red' },
  { targetSound: '/w/', options: ['door', 'table', 'window', 'cat'], correctAnswer: 'window' },
  { targetSound: '/n/', options: ['gift', 'swim', 'hat', 'nest'], correctAnswer: 'nest' },
  { targetSound: '/pa/', options: ['rose', 'penguin', 'carrot', 'ball'], correctAnswer: 'penguin' },
  { targetSound: '/t/', options: ['tap', 'man', 'shop', 'sea'], correctAnswer: 'tap' },
  { targetSound: '/h/', options: ['fan', 'hat', 'clock', 'pin'], correctAnswer: 'hat' },
  { targetSound: '/l/', options: ['key', 'leaf', 'stone', 'ink'], correctAnswer: 'leaf' },
  { targetSound: '/æ/', options: ['ship', 'mom', 'ant', 'pink'], correctAnswer: 'ant' },
  { targetSound: '/s/', options: ['sock', 'glove', 'tie', 'ring'], correctAnswer: 'sock' },
  { targetSound: '/b/', options: ['cap', 'king', 'diamond', 'bucket'], correctAnswer: 'bucket' },
  { targetSound: '/ka/', options: ['one', 'dolphin', 'finger', 'cot'], correctAnswer: 'cot' },
  { targetSound: '/r/', options: ['lock', 'key', 'rock', 'desk'], correctAnswer: 'rock' },
  { targetSound: '/f/', options: ['feet', 'chips', 'clock', 'cake'], correctAnswer: 'feet' }
];

export const phonemePopLevel5Data = [
  { targetSound: '/ch/', options: ['tease', 'beach', 'button', 'camel'], correctAnswer: 'beach' },
  { targetSound: '/w/', options: ['apron', 'monkey', 'down', 'balloon'], correctAnswer: 'down' },
  { targetSound: '/sp/', options: ['crisp', 'winter', 'afternoon', 'behind'], correctAnswer: 'crisp' },
  { targetSound: '/t/', options: ['drink', 'pale', 'wipe', 'battle'], correctAnswer: 'battle' },
  { targetSound: '/f/', options: ['dress', 'meter', 'life', 'again'], correctAnswer: 'life' },
  { targetSound: '/th/', options: ['tape', 'bath', 'sent', 'task'], correctAnswer: 'bath' },
  { targetSound: '/i/', options: ['ink', 'pet', 'bell', 'sheep'], correctAnswer: 'ink' },
  { targetSound: '/k/', options: ['near', 'mango', 'same', 'ask'], correctAnswer: 'ask' },
  { targetSound: '/l/', options: ['break', 'band', 'ball', 'take'], correctAnswer: 'ball' },
  { targetSound: '/n/', options: ['bend', 'belt', 'cattle', 'free'], correctAnswer: 'bend' },
  { targetSound: '/m/', options: ['after', 'white', 'batter', 'lemon'], correctAnswer: 'lemon' },
  { targetSound: '/r/', options: ['dress', 'post', 'mail', 'basket'], correctAnswer: 'dress' },
  { targetSound: '/ga/', options: ['frill', 'noise', 'again', 'sand'], correctAnswer: 'again' },
  { targetSound: '/h/', options: ['utter', 'happy', 'shade', 'bunk'], correctAnswer: 'happy' },
  { targetSound: '/uh/', options: ['bun', 'sleep', 'mat', 'doubt'], correctAnswer: 'bun' },
  { targetSound: '/pa/', options: ['take', 'make', 'bark', 'shape'], correctAnswer: 'shape' }
];

export const phonemePopLevel6Data = [
  { targetSound: '/k/', options: ['brick', 'sand', 'back', 'cake'], correctAnswers: ['brick', 'back', 'cake'] },
  { targetSound: '/ch/', options: ['church', 'disc', 'damp', 'bench'], correctAnswers: ['church', 'bench'] },
  { targetSound: '/tr/', options: ['arrow', 'brick', 'truck', 'ring'], correctAnswers: ['truck'] },
  { targetSound: '/th/', options: ['bring', 'bite', 'think', 'birth'], correctAnswers: ['think', 'birth'] },
  { targetSound: '/cl/', options: ['cake', 'card', 'cling', 'blank'], correctAnswers: ['cling'] },
  { targetSound: '/pr/', options: ['drive', 'prince', 'pray', 'fry'], correctAnswers: ['prince', 'pray'] },
  { targetSound: '/fl/', options: ['fry', 'fix', 'fly', 'flood'], correctAnswers: ['fly', 'flood'] },
  { targetSound: '/bl/', options: ['blood', 'blink', 'bottle', 'book'], correctAnswers: ['blood', 'blink'] },
  { targetSound: '/sw/', options: ['west', 'swing', 'brush', 'last'], correctAnswers: ['swing'] },
  { targetSound: '/ee/', options: ['heat', 'belt', 'seat', 'meet'], correctAnswers: ['heat', 'seat', 'meet'] },
  { targetSound: '/fi/', options: ['stiff', 'fish', 'half', 'fine'], correctAnswers: ['fish', 'fine'] },
  { targetSound: '/pl/', options: ['clap', 'play', 'plant', 'flat'], correctAnswers: ['play', 'plant'] },
  { targetSound: '/cr/', options: ['bench', 'crayon', 'crack', 'brick'], correctAnswers: ['crayon', 'crack'] }
];

export const phonemePopLevel7Data = [
  { targetSound: '/k/', options: ['car', 'jacket', 'girl', 'desk'], correctAnswer: 'desk' },
  { targetSound: '/m/', options: ['milk', 'drum', 'hand', 'sea'], correctAnswer: 'drum' },
  { targetSound: '/ee/', options: ['bee', 'seal', 'eel', 'fire'], correctAnswer: 'bee' },
  { targetSound: '/p/', options: ['desk', 'climb', 'lamp', 'lamb'], correctAnswer: 'lamp' },
  { targetSound: '/w/', options: ['window', 'wall', 'feel', 'hut'], correctAnswer: 'window' },
  { targetSound: '/d/', options: ['desk', 'feet', 'sand', 'beach'], correctAnswer: 'sand' },
  { targetSound: '/r/', options: ['card', 'run', 'mirror', 'gold'], correctAnswer: 'mirror' },
  { targetSound: '/t/', options: ['teach', 'belt', 'park', 'tap'], correctAnswer: 'belt' },
  { targetSound: '/s/', options: ['school', 'horse', 'mouth', 'neck'], correctAnswer: 'horse' },
  { targetSound: '/ee/', options: ['monkey', 'ink', 'fish', 'bill'], correctAnswer: 'monkey' },
  { targetSound: '/n/', options: ['bin', 'lake', 'night', 'sea'], correctAnswer: 'bin' },
  { targetSound: 'hard /g/', options: ['hand', 'fig', 'bark', 'glass'], correctAnswer: 'fig' },
  { targetSound: '/n/', options: ['green', 'blue', 'red', 'black'], correctAnswer: 'green' },
  { targetSound: '/b/', options: ['book', 'lamb', 'plum', 'brick'], correctAnswer: 'lamb' },
  { targetSound: '/d/', options: ['black', 'desk', 'hand', 'dog'], correctAnswer: 'hand' },
  { targetSound: '/l/', options: ['blink', 'leg', 'land', 'hill'], correctAnswer: 'hill' },
  { targetSound: '/f/', options: ['leaf', 'fly', 'sun', 'film'], correctAnswer: 'leaf' },
  { targetSound: '/k/', options: ['kid', 'truck', 'cape', 'cry'], correctAnswer: 'truck' },
  { targetSound: '/m/', options: ['hug', 'hut', 'cup', 'mum'], correctAnswer: 'mum' },
  { targetSound: '/t/', options: ['teeth', 'bat', 'train', 'kettle'], correctAnswer: 'bat' }
];

export const phonemePopLevel8Data = [
  { targetSound: 'short /ae/', word: 'Cap', correctAnswer: 'YES' },
  { targetSound: 'short /ae/', word: 'Bun', correctAnswer: 'NO' },
  { targetSound: 'short /ae/', word: 'Rat', correctAnswer: 'YES' },
  { targetSound: 'short /ae/', word: 'Spot', correctAnswer: 'NO' },
  { targetSound: 'short /ae/', word: 'Cub', correctAnswer: 'NO' },
  { targetSound: 'short /ae/', word: 'Ant', correctAnswer: 'YES' },
  { targetSound: 'short /ae/', word: 'Rag', correctAnswer: 'YES' },
  { targetSound: 'short /ae/', word: 'Silk', correctAnswer: 'NO' },
  { targetSound: 'short /ae/', word: 'Rack', correctAnswer: 'YES' },
  { targetSound: 'short /ae/', word: 'Pack', correctAnswer: 'YES' },
  { targetSound: 'short /ae/', word: 'Talk', correctAnswer: 'NO' },
  { targetSound: 'short /ae/', word: 'Damp', correctAnswer: 'YES' },
  { targetSound: 'short /ae/', word: 'Car', correctAnswer: 'NO' },
  { targetSound: 'short /ae/', word: 'Rich', correctAnswer: 'NO' },
  { targetSound: 'short /ae/', word: 'Bus', correctAnswer: 'NO' },
  { targetSound: 'short /ae/', word: 'Rest', correctAnswer: 'NO' },
  { targetSound: 'short /ae/', word: 'Dog', correctAnswer: 'NO' },
  { targetSound: 'short /ae/', word: 'Mat', correctAnswer: 'YES' },
  { targetSound: 'short /ae/', word: 'Bat', correctAnswer: 'YES' },
  { targetSound: 'short /ae/', word: 'Shape', correctAnswer: 'NO' }
];

export const phonemePopLevel9Data = [
  { targetSound: '/sh/', word: 'Rush', correctAnswer: 'yes' },
  { targetSound: '/sh/', word: 'Share', correctAnswer: 'yes' },
  { targetSound: '/sh/', word: 'Sweet', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Flip', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Floor', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Smoke', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Moon', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Must', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'March', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Minus', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Brick', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Shape', correctAnswer: 'yes' },
  { targetSound: '/sh/', word: 'Mist', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Shoot', correctAnswer: 'yes' },
  { targetSound: '/sh/', word: 'Shame', correctAnswer: 'yes' },
  { targetSound: '/sh/', word: 'Dress', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Maths', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Nest', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Charm', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Think', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Brand', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Dish', correctAnswer: 'yes' },
  { targetSound: '/sh/', word: 'Rinse', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Shy', correctAnswer: 'yes' },
  { targetSound: '/sh/', word: 'Dance', correctAnswer: 'no' },
  { targetSound: '/sh/', word: 'Sheet', correctAnswer: 'yes' },
  { targetSound: '/sh/', word: 'Sheep', correctAnswer: 'yes' },
  { targetSound: '/sh/', word: 'Mesh', correctAnswer: 'yes' },
  { targetSound: '/sh/', word: 'Crush', correctAnswer: 'yes' },
  { targetSound: '/sh/', word: 'Down', correctAnswer: 'no' }
];

export const phonemePopLevel10Data = [
  { targetSound: '/n/', word: 'Breath', correctAnswer: 'no' },
  { targetSound: '/n/', word: 'Mint', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Bin', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Neck', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Under', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Count', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Need', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Mount', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Pound', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Pantry', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Ankle', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Weekend', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Amount', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Thankful', correctAnswer: 'yes' },
  { targetSound: '/n/', word: 'Compound', correctAnswer: 'yes' }
];


export const phonemePopData: PhonemeLevel[] = [
  {
    level: 1,
    targetSound: '/b/',
    mechanic: 'binary-single',
    instruction: 'Does this word contain the /b/ sound?',
    questions: [
      { word: 'Dress', correctAnswer: 'no' },
      { word: 'Banana', correctAnswer: 'yes' },
      { word: 'Brush', correctAnswer: 'yes' },
      { word: 'Bank', correctAnswer: 'yes' },
      { word: 'Fall', correctAnswer: 'no' },
      { word: 'Drink', correctAnswer: 'no' },
      { word: 'Jam', correctAnswer: 'no' },
      { word: 'Coffee', correctAnswer: 'no' },
      { word: 'Log', correctAnswer: 'no' },
      { word: 'Hut', correctAnswer: 'no' },
      { word: 'Brown', correctAnswer: 'yes' },
      { word: 'Mother', correctAnswer: 'no' },
      { word: 'Rabbit', correctAnswer: 'yes' },
      { word: 'Dog', correctAnswer: 'no' },
      { word: 'Dress', correctAnswer: 'no' },
      { word: 'Card', correctAnswer: 'no' },
      { word: 'About', correctAnswer: 'yes' },
      { word: 'Shop', correctAnswer: 'no' },
      { word: 'Shower', correctAnswer: 'no' }
    ]
  },
  {
    level: 2,
    targetSound: '/b/',
    mechanic: 'binary-dual',
    instruction: 'Do both words contain the /b/ sound?',
    questions: [
      { word1: 'Flag', word2: 'Open', correctAnswer: 'no' },
      { word1: 'Bread', word2: 'Bun', correctAnswer: 'yes' },
      { word1: 'Truck', word2: 'King', correctAnswer: 'no' },
      { word1: 'Money', word2: 'Desk', correctAnswer: 'no' },
      { word1: 'Big', word2: 'Band', correctAnswer: 'yes' },
      { word1: 'About', word2: 'Bring', correctAnswer: 'yes' },
      { word1: 'Fast', word2: 'Spill', correctAnswer: 'no' },
      { word1: 'Touch', word2: 'Fresh', correctAnswer: 'no' },
      { word1: 'Table', word2: 'Basket', correctAnswer: 'yes' },
      { word1: 'Water', word2: 'House', correctAnswer: 'no' },
      { word1: 'Tomato', word2: 'Coconut', correctAnswer: 'no' },
      { word1: 'Rub', word2: 'Beetroot', correctAnswer: 'yes' },
      { word1: 'Pant', word2: 'Needle', correctAnswer: 'no' },
      { word1: 'Bag', word2: 'Habit', correctAnswer: 'yes' },
      { word1: 'Tank', word2: 'Tall', correctAnswer: 'no' },
      { word1: 'Push', word2: 'Pink', correctAnswer: 'no' },
      { word1: 'Potato', word2: 'Purple', correctAnswer: 'no' },
      { word1: 'Ask', word2: 'Sky', correctAnswer: 'no' },
      { word1: 'Rob', word2: 'Break', correctAnswer: 'yes' },
      { word1: 'Bush', word2: 'Brush', correctAnswer: 'yes' }
    ]
  },
  {
    level: 3,
    targetSound: 'varies',
    mechanic: 'multiple-choice',
    instruction: 'Select the word that contains the target sound',
    questions: phonemePopLevel3Data as any[]
  },
  {
    level: 4,
    targetSound: 'varies',
    mechanic: 'select-all',
    instruction: 'Select all pictures that contain the target sound',
    questions: [
      {
        targetSound: '/f/',
        options: [
          { label: 'leaf', isCorrect: true, icon: 'Leaf' },
          { label: 'brush', isCorrect: false, icon: 'Paintbrush' },
          { label: 'fan', isCorrect: true, icon: 'Wind' },
          { label: 'flag', isCorrect: true, icon: 'Flag' }
        ]
      },
      {
        targetSound: '/b/',
        options: [
          { label: 'rabbit', isCorrect: true, icon: 'Rabbit' },
          { label: 'bell', isCorrect: true, icon: 'Bell' },
          { label: 'hand', isCorrect: false, icon: 'Hand' },
          { label: 'milk', isCorrect: false, icon: 'Milk' }
        ]
      },
      {
        targetSound: '/r/',
        options: [
          { label: 'button', isCorrect: false, icon: 'CircleDot' },
          { label: 'rock', isCorrect: true, icon: 'Gem' },
          { label: 'pant', isCorrect: false, icon: 'Shirt' },
          { label: 'glass', isCorrect: false, icon: 'CupSoda' }
        ]
      },
      {
        targetSound: '/k/',
        options: [
          { label: 'milk', isCorrect: true, icon: 'Milk' },
          { label: 'gang', isCorrect: false, icon: 'Users' },
          { label: 'pink', isCorrect: true, icon: 'Palette' },
          { label: 'pot', isCorrect: false, icon: 'Soup' }
        ]
      },
      {
        targetSound: '/n/',
        options: [
          { label: 'rose', isCorrect: false, icon: 'Flower' },
          { label: 'hat', isCorrect: false, icon: 'Crown' },
          { label: 'rat', isCorrect: false, icon: 'Bug' },
          { label: 'nose', isCorrect: true, icon: 'Smile' }
        ]
      },
      {
        targetSound: '/m/',
        options: [
          { label: 'bun', isCorrect: false, icon: 'Cookie' },
          { label: 'arm', isCorrect: true, icon: 'Hand' },
          { label: 'mat', isCorrect: true, icon: 'Square' },
          { label: 'mouse', isCorrect: true, icon: 'Mouse' }
        ]
      },
      {
        targetSound: '/d/',
        options: [
          { label: 'desk', isCorrect: true, icon: 'Monitor' },
          { label: 'card', isCorrect: true, icon: 'CreditCard' },
          { label: 'wind', isCorrect: true, icon: 'Wind' },
          { label: 'sun', isCorrect: false, icon: 'Sun' }
        ]
      },
      {
        targetSound: '/l/',
        options: [
          { label: 'fox', isCorrect: false, icon: 'Cat' },
          { label: 'lion', isCorrect: true, icon: 'Smile' },
          { label: 'flag', isCorrect: true, icon: 'Flag' },
          { label: 'cot', isCorrect: false, icon: 'Bed' }
        ]
      },
      {
        targetSound: '/w/',
        options: [
          { label: 'chalk', isCorrect: false, icon: 'PenTool' },
          { label: 'fish', isCorrect: false, icon: 'Fish' },
          { label: 'shoe', isCorrect: false, icon: 'Footprints' },
          { label: 'down', isCorrect: true, icon: 'ArrowDown' }
        ]
      },
      {
        targetSound: '/t/',
        options: [
          { label: 'tent', isCorrect: true, icon: 'Tent' },
          { label: 'out', isCorrect: true, icon: 'LogOut' },
          { label: 'sleep', isCorrect: false, icon: 'Moon' },
          { label: 'hop', isCorrect: false, icon: 'Activity' }
        ]
      },
      {
        targetSound: '/p/',
        options: [
          { label: 'corn', isCorrect: false, icon: 'ChefHat' },
          { label: 'pan', isCorrect: true, icon: 'Container' },
          { label: 'ship', isCorrect: true, icon: 'Ship' },
          { label: 'tap', isCorrect: true, icon: 'Droplet' }
        ]
      },
      {
        targetSound: '/s/',
        options: [
          { label: 'ant', isCorrect: false, icon: 'Bug' },
          { label: 'band', isCorrect: false, icon: 'Music' },
          { label: 'mouse', isCorrect: true, icon: 'Mouse' },
          { label: 'sand', isCorrect: true, icon: 'Waves' }
        ]
      },
      {
        targetSound: '/h/',
        options: [
          { label: 'house', isCorrect: true, icon: 'Home' },
          { label: 'bird', isCorrect: false, icon: 'Bird' },
          { label: 'sing', isCorrect: false, icon: 'Mic' },
          { label: 'hand', isCorrect: true, icon: 'Hand' }
        ]
      },
      {
        targetSound: '/sh/',
        options: [
          { label: 'fire', isCorrect: false, icon: 'Flame' },
          { label: 'dish', isCorrect: true, icon: 'Disc' },
          { label: 'shop', isCorrect: true, icon: 'Store' },
          { label: 'fan', isCorrect: false, icon: 'Wind' }
        ]
      },
      {
        targetSound: '/th/',
        options: [
          { label: 'bin', isCorrect: false, icon: 'Trash2' },
          { label: 'tank', isCorrect: false, icon: 'Container' },
          { label: 'dust', isCorrect: false, icon: 'Wind' },
          { label: 'moth', isCorrect: true, icon: 'Bug' }
        ]
      },
      {
        targetSound: '/b/',
        options: [
          { label: 'blue', isCorrect: true, icon: 'Palette' },
          { label: 'sand', isCorrect: false, icon: 'Waves' },
          { label: 'cab', isCorrect: true, icon: 'Car' },
          { label: 'bread', isCorrect: false, icon: 'Cookie' } // following underlined sheet
        ]
      },
      {
        targetSound: '/l/',
        options: [
          { label: 'girl', isCorrect: true, icon: 'User' },
          { label: 'milk', isCorrect: true, icon: 'Milk' },
          { label: 'sing', isCorrect: false, icon: 'Mic' },
          { label: 'ask', isCorrect: false, icon: 'HelpCircle' }
        ]
      },
      {
        targetSound: '/o/',
        options: [
          { label: 'hot', isCorrect: true, icon: 'Flame' },
          { label: 'boat', isCorrect: false, icon: 'Ship' },
          { label: 'cry', isCorrect: false, icon: 'Frown' },
          { label: 'stop', isCorrect: true, icon: 'Octagon' }
        ]
      },
      {
        targetSound: '/d/',
        options: [
          { label: 'sad', isCorrect: true, icon: 'Frown' },
          { label: 'doll', isCorrect: true, icon: 'Smile' },
          { label: 'dance', isCorrect: true, icon: 'Music' },
          { label: 'mark', isCorrect: false, icon: 'Check' }
        ]
      },
      {
        targetSound: '/r/',
        options: [
          { label: 'book', isCorrect: false, icon: 'BookOpen' },
          { label: 'red', isCorrect: true, icon: 'Palette' },
          { label: 'green', isCorrect: true, icon: 'Palette' },
          { label: 'cow', isCorrect: false, icon: 'Smile' }
        ]
      }
    ]
  },
  {
    level: 5,
    targetSound: 'varies',
    mechanic: 'multiple-choice',
    instruction: 'Select the word that contains the target sound',
    questions: phonemePopLevel5Data as any[]
  },
  {
    level: 6,
    targetSound: 'varies',
    mechanic: 'select-all',
    instruction: 'Select all the words that contain the target sound',
    questions: phonemePopLevel6Data as any[]
  },
  {
    level: 7,
    targetSound: 'varies',
    mechanic: 'multiple-choice',
    instruction: 'Select the word that ends with the target sound',
    questions: phonemePopLevel7Data as any[]
  },
  {
    level: 8,
    targetSound: '/a/',
    mechanic: 'binary-single',
    instruction: 'Read the word. Does it contain the short /a/ sound?',
    questions: phonemePopLevel8Data as any[]
  },
  {
    level: 9,
    targetSound: '/sh/',
    mechanic: 'binary-single',
    instruction: 'Read the word. Does it contain the /sh/ sound?',
    questions: phonemePopLevel9Data as any[]
  },
  {
    level: 10,
    targetSound: 'varies',
    mechanic: 'binary-single',
    instruction: 'Read the word. Does it contain the target sound?',
    questions: phonemePopLevel10Data as any[]
  }
];
