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
    instruction: 'Select the picture that contains the target sound',
    questions: [
      {
        targetSound: '/c/',
        options: [
          { label: 'cat', isCorrect: true, icon: 'Cat' },
          { label: 'balloon', isCorrect: false, icon: 'HelpCircle' },
          { label: 'ship', isCorrect: false, icon: 'Ship' },
          { label: 'table', isCorrect: false, icon: 'Table' }
        ]
      },
      {
        targetSound: '/m/',
        options: [
          { label: 'clock', isCorrect: false, icon: 'Clock' },
          { label: 'dog', isCorrect: false, icon: 'Dog' },
          { label: 'map', isCorrect: true, icon: 'Map' },
          { label: 'cake', isCorrect: false, icon: 'Cake' }
        ]
      },
      {
        targetSound: '/f/',
        options: [
          { label: 'dance', isCorrect: false, icon: 'Flame' },
          { label: 'rabbit', isCorrect: false, icon: 'Rabbit' },
          { label: 'milk', isCorrect: false, icon: 'Milk' },
          { label: 'fish', isCorrect: true, icon: 'Fish' }
        ]
      },
      {
        targetSound: '/d/',
        options: [
          { label: 'doll', isCorrect: true, icon: 'Smile' },
          { label: 'man', isCorrect: false, icon: 'User' },
          { label: 'sun', isCorrect: false, icon: 'Sun' },
          { label: 'apple', isCorrect: false, icon: 'Apple' }
        ]
      },
      {
        targetSound: '/b/',
        options: [
          { label: 'gate', isCorrect: false, icon: 'Fence' },
          { label: 'bat', isCorrect: true, icon: 'Activity' },
          { label: 'tree', isCorrect: false, icon: 'TreePine' },
          { label: 'paint', isCorrect: false, icon: 'Palette' }
        ]
      },
      {
        targetSound: '/r/',
        options: [
          { label: 'red', isCorrect: true, icon: 'Palette' },
          { label: 'fox', isCorrect: false, icon: 'Dog' },
          { label: 'lion', isCorrect: false, icon: 'Smile' },
          { label: 'sun', isCorrect: false, icon: 'Sun' }
        ]
      },
      {
        targetSound: '/w/',
        options: [
          { label: 'door', isCorrect: false, icon: 'DoorOpen' },
          { label: 'table', isCorrect: false, icon: 'Table' },
          { label: 'window', isCorrect: true, icon: 'Square' },
          { label: 'cat', isCorrect: false, icon: 'Cat' }
        ]
      },
      {
        targetSound: '/n/',
        options: [
          { label: 'gift', isCorrect: false, icon: 'Gift' },
          { label: 'swim', isCorrect: false, icon: 'Waves' },
          { label: 'hat', isCorrect: false, icon: 'Crown' },
          { label: 'nest', isCorrect: true, icon: 'Home' }
        ]
      },
      {
        targetSound: '/p/',
        options: [
          { label: 'rose', isCorrect: false, icon: 'Flower2' },
          { label: 'penguin', isCorrect: true, icon: 'Bird' },
          { label: 'carrot', isCorrect: false, icon: 'ChefHat' },
          { label: 'ball', isCorrect: false, icon: 'Circle' }
        ]
      },
      {
        targetSound: '/t/',
        options: [
          { label: 'tap', isCorrect: true, icon: 'Droplet' },
          { label: 'man', isCorrect: false, icon: 'User' },
          { label: 'shop', isCorrect: false, icon: 'Store' },
          { label: 'sea', isCorrect: false, icon: 'Waves' }
        ]
      },
      {
        targetSound: '/h/',
        options: [
          { label: 'hat', isCorrect: true, icon: 'Crown' },
          { label: 'clock', isCorrect: false, icon: 'Clock' },
          { label: 'pin', isCorrect: false, icon: 'MapPin' },
          { label: 'balloon', isCorrect: false, icon: 'Circle' }
        ]
      },
      {
        targetSound: '/g/',
        options: [
          { label: 'banana', isCorrect: false, icon: 'Banana' },
          { label: 'apple', isCorrect: false, icon: 'Apple' },
          { label: 'cherry', isCorrect: false, icon: 'Cherry' },
          { label: 'grapes', isCorrect: true, icon: 'Grape' }
        ]
      },
      {
        targetSound: '/l/',
        options: [
          { label: 'key', isCorrect: false, icon: 'Key' },
          { label: 'leaf', isCorrect: true, icon: 'Leaf' },
          { label: 'stone', isCorrect: false, icon: 'Circle' },
          { label: 'ink', isCorrect: false, icon: 'PenTool' }
        ]
      },
      {
        targetSound: '/a/',
        options: [
          { label: 'ship', isCorrect: false, icon: 'Ship' },
          { label: 'mom', isCorrect: false, icon: 'User' },
          { label: 'ant', isCorrect: true, icon: 'Bug' },
          { label: 'pink', isCorrect: false, icon: 'Palette' }
        ]
      },
      {
        targetSound: '/z/',
        options: [
          { label: 'tub', isCorrect: false, icon: 'Bath' },
          { label: 'grass', isCorrect: false, icon: 'Leaf' },
          { label: 'frog', isCorrect: false, icon: 'Bug' },
          { label: 'zebra', isCorrect: true, icon: 'Grid' }
        ]
      },
      {
        targetSound: '/s/',
        options: [
          { label: 'sock', isCorrect: true, icon: 'Footprints' },
          { label: 'glove', isCorrect: false, icon: 'Hand' },
          { label: 'tie', isCorrect: false, icon: 'User' },
          { label: 'ring', isCorrect: false, icon: 'Circle' }
        ]
      },
      {
        targetSound: '/b/',
        options: [
          { label: 'cap', isCorrect: false, icon: 'Crown' },
          { label: 'king', isCorrect: false, icon: 'User' },
          { label: 'diamond', isCorrect: false, icon: 'Gem' },
          { label: 'bucket', isCorrect: true, icon: 'Container' }
        ]
      },
      {
        targetSound: '/c/',
        options: [
          { label: 'one', isCorrect: false, icon: 'Hash' },
          { label: 'dolphin', isCorrect: false, icon: 'Fish' },
          { label: 'finger', isCorrect: false, icon: 'Hand' },
          { label: 'cot', isCorrect: true, icon: 'Bed' }
        ]
      },
      {
        targetSound: '/r/',
        options: [
          { label: 'lock', isCorrect: false, icon: 'Lock' },
          { label: 'key', isCorrect: false, icon: 'Key' },
          { label: 'rock', isCorrect: true, icon: 'Gem' },
          { label: 'desk', isCorrect: false, icon: 'Monitor' }
        ]
      },
      {
        targetSound: '/f/',
        options: [
          { label: 'feet', isCorrect: true, icon: 'Footprints' },
          { label: 'chips', isCorrect: false, icon: 'Cookie' },
          { label: 'clock', isCorrect: false, icon: 'Clock' },
          { label: 'cake', isCorrect: false, icon: 'Cake' }
        ]
      }
    ]
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
    questions: [
      {
        targetSound: '/ch/',
        options: [
          { label: 'tease', isCorrect: false },
          { label: 'beach', isCorrect: true },
          { label: 'button', isCorrect: false },
          { label: 'camel', isCorrect: false }
        ]
      },
      {
        targetSound: '/w/',
        options: [
          { label: 'apron', isCorrect: false },
          { label: 'monkey', isCorrect: false },
          { label: 'down', isCorrect: true },
          { label: 'balloon', isCorrect: false }
        ]
      },
      {
        targetSound: '/sp/',
        options: [
          { label: 'crisp', isCorrect: true },
          { label: 'winter', isCorrect: false },
          { label: 'afternoon', isCorrect: false },
          { label: 'behind', isCorrect: false }
        ]
      },
      {
        targetSound: '/t/',
        options: [
          { label: 'drink', isCorrect: false },
          { label: 'pale', isCorrect: false },
          { label: 'wipe', isCorrect: false },
          { label: 'battle', isCorrect: true }
        ]
      },
      {
        targetSound: '/f/',
        options: [
          { label: 'dress', isCorrect: false },
          { label: 'meter', isCorrect: false },
          { label: 'life', isCorrect: true },
          { label: 'again', isCorrect: false }
        ]
      },
      {
        targetSound: '/sh/',
        options: [
          { label: 'same', isCorrect: false },
          { label: 'safe', isCorrect: false },
          { label: 'shape', isCorrect: true },
          { label: 'sand', isCorrect: false }
        ]
      },
      {
        targetSound: '/th/',
        options: [
          { label: 'tape', isCorrect: false },
          { label: 'bath', isCorrect: true },
          { label: 'sent', isCorrect: false },
          { label: 'task', isCorrect: false }
        ]
      },
      {
        targetSound: '/ae/',
        options: [
          { label: 'Map', isCorrect: false },
          { label: 'bake', isCorrect: true }, // As underlined in the source worksheet
          { label: 'ant', isCorrect: false },
          { label: 'allow', isCorrect: false }
        ]
      },
      {
        targetSound: '/i/',
        options: [
          { label: 'ink', isCorrect: true },
          { label: 'pet', isCorrect: false },
          { label: 'bell', isCorrect: false },
          { label: 'sheep', isCorrect: false }
        ]
      },
      {
        targetSound: '/c/',
        options: [
          { label: 'near', isCorrect: false },
          { label: 'mango', isCorrect: false },
          { label: 'same', isCorrect: false },
          { label: 'ask', isCorrect: true }
        ]
      },
      {
        targetSound: '/l/',
        options: [
          { label: 'break', isCorrect: false },
          { label: 'band', isCorrect: false },
          { label: 'ball', isCorrect: true },
          { label: 'take', isCorrect: false }
        ]
      },
      {
        targetSound: '/n/',
        options: [
          { label: 'Bend', isCorrect: true },
          { label: 'belt', isCorrect: false },
          { label: 'cattle', isCorrect: false },
          { label: 'free', isCorrect: false }
        ]
      },
      {
        targetSound: '/m/',
        options: [
          { label: 'after', isCorrect: false },
          { label: 'white', isCorrect: false },
          { label: 'batter', isCorrect: false },
          { label: 'lemon', isCorrect: true }
        ]
      },
      {
        targetSound: '/r/',
        options: [
          { label: 'dress', isCorrect: true },
          { label: 'post', isCorrect: false },
          { label: 'mail', isCorrect: false },
          { label: 'basket', isCorrect: false }
        ]
      },
      {
        targetSound: '/g/',
        options: [
          { label: 'frill', isCorrect: false },
          { label: 'noise', isCorrect: false },
          { label: 'again', isCorrect: true },
          { label: 'sand', isCorrect: false }
        ]
      },
      {
        targetSound: '/h/',
        options: [
          { label: 'utter', isCorrect: false },
          { label: 'happy', isCorrect: true },
          { label: 'shade', isCorrect: false },
          { label: 'bunk', isCorrect: false }
        ]
      },
      {
        targetSound: '/o/',
        options: [
          { label: 'fig', isCorrect: false },
          { label: 'mop', isCorrect: true },
          { label: 'shoe', isCorrect: false },
          { label: 'book', isCorrect: false }
        ]
      },
      {
        targetSound: '/u/',
        options: [
          { label: 'bun', isCorrect: true },
          { label: 'sleep', isCorrect: false },
          { label: 'mat', isCorrect: false },
          { label: 'doubt', isCorrect: false }
        ]
      },
      {
        targetSound: '/p/',
        options: [
          { label: 'take', isCorrect: false },
          { label: 'make', isCorrect: false },
          { label: 'bark', isCorrect: false },
          { label: 'shape', isCorrect: true }
        ]
      },
      {
        targetSound: '/a/',
        options: [
          { label: 'air', isCorrect: false },
          { label: 'ate', isCorrect: false },
          { label: 'fame', isCorrect: false },
          { label: 'ant', isCorrect: true }
        ]
      }
    ]
  },
  {
    level: 6,
    targetSound: 'varies',
    mechanic: 'select-all',
    instruction: 'Select all the words that contain the target sound',
    questions: [
      {
        targetSound: '/k/',
        options: [
          { label: 'brick', isCorrect: true },
          { label: 'sand', isCorrect: false },
          { label: 'back', isCorrect: true },
          { label: 'cake', isCorrect: true }
        ]
      },
      {
        targetSound: '/ch/',
        options: [
          { label: 'church', isCorrect: true },
          { label: 'disc', isCorrect: false },
          { label: 'damp', isCorrect: false },
          { label: 'bench', isCorrect: true }
        ]
      },
      {
        targetSound: '/tr/',
        options: [
          { label: 'arrow', isCorrect: false },
          { label: 'brick', isCorrect: false },
          { label: 'truck', isCorrect: true },
          { label: 'ring', isCorrect: false }
        ]
      },
      {
        targetSound: '/sh/',
        options: [
          { label: 'dish', isCorrect: true },
          { label: 'shape', isCorrect: true },
          { label: 'mint', isCorrect: false },
          { label: 'swim', isCorrect: false }
        ]
      },
      {
        targetSound: '/th/',
        options: [
          { label: 'bring', isCorrect: false },
          { label: 'bite', isCorrect: false },
          { label: 'think', isCorrect: true },
          { label: 'birth', isCorrect: true }
        ]
      },
      {
        targetSound: '/cl/',
        options: [
          { label: 'cake', isCorrect: false },
          { label: 'card', isCorrect: false },
          { label: 'cling', isCorrect: true },
          { label: 'blank', isCorrect: false }
        ]
      },
      {
        targetSound: '/pr/',
        options: [
          { label: 'drive', isCorrect: false },
          { label: 'prince', isCorrect: true },
          { label: 'pray', isCorrect: true },
          { label: 'fry', isCorrect: false }
        ]
      },
      {
        targetSound: '/fl/',
        options: [
          { label: 'fry', isCorrect: false },
          { label: 'fix', isCorrect: false },
          { label: 'fly', isCorrect: true },
          { label: 'flood', isCorrect: true }
        ]
      },
      {
        targetSound: '/bl/',
        options: [
          { label: 'blood', isCorrect: true },
          { label: 'blink', isCorrect: true },
          { label: 'bottle', isCorrect: false },
          { label: 'book', isCorrect: false }
        ]
      },
      {
        targetSound: '/po/',
        options: [
          { label: 'pocket', isCorrect: true },
          { label: 'pound', isCorrect: false },
          { label: 'power', isCorrect: false },
          { label: 'pool', isCorrect: false }
        ]
      },
      {
        targetSound: '/ga/',
        options: [
          { label: 'gain', isCorrect: false },
          { label: 'gap', isCorrect: true },
          { label: 'flag', isCorrect: false },
          { label: 'gang', isCorrect: true }
        ]
      },
      {
        targetSound: '/sw/',
        options: [
          { label: 'west', isCorrect: false },
          { label: 'swing', isCorrect: true },
          { label: 'brush', isCorrect: false },
          { label: 'last', isCorrect: false }
        ]
      },
      {
        targetSound: '/ee/',
        options: [
          { label: 'heat', isCorrect: true },
          { label: 'belt', isCorrect: false },
          { label: 'seat', isCorrect: true },
          { label: 'meet', isCorrect: true }
        ]
      },
      {
        targetSound: '/fi/',
        options: [
          { label: 'stiff', isCorrect: false },
          { label: 'fish', isCorrect: true },
          { label: 'half', isCorrect: false },
          { label: 'fine', isCorrect: false }
        ]
      },
      {
        targetSound: '/tae/',
        options: [
          { label: 'tick', isCorrect: false },
          { label: 'take', isCorrect: true },
          { label: 'fast', isCorrect: false },
          { label: 'task', isCorrect: false }
        ]
      },
      {
        targetSound: '/pl/',
        options: [
          { label: 'clap', isCorrect: false },
          { label: 'play', isCorrect: true },
          { label: 'plant', isCorrect: true },
          { label: 'flat', isCorrect: false }
        ]
      },
      {
        targetSound: '/cr/',
        options: [
          { label: 'bench', isCorrect: false },
          { label: 'crayon', isCorrect: true },
          { label: 'crack', isCorrect: true },
          { label: 'brick', isCorrect: false }
        ]
      },
      {
        targetSound: '/dr/',
        options: [
          { label: 'bride', isCorrect: false },
          { label: 'drink', isCorrect: true },
          { label: 'dress', isCorrect: true },
          { label: 'night', isCorrect: false }
        ]
      },
      {
        targetSound: '/ng/',
        options: [
          { label: 'sing', isCorrect: true },
          { label: 'bank', isCorrect: false },
          { label: 'flick', isCorrect: false },
          { label: 'gong', isCorrect: true }
        ]
      },
      {
        targetSound: '/sa/',
        options: [
          { label: 'sand', isCorrect: true },
          { label: 'fast', isCorrect: false },
          { label: 'sack', isCorrect: true },
          { label: 'guard', isCorrect: false }
        ]
      }
    ]
  },
  {
    level: 7,
    targetSound: 'varies',
    mechanic: 'multiple-choice',
    instruction: 'Select the picture that ends with the target sound',
    questions: [
      { targetSound: '/k/', options: ['car', 'jacket', 'girl', 'desk'], correctAnswer: 'desk' },
      { targetSound: '/m/', options: ['milk', 'drum', 'hand', 'sea'], correctAnswer: 'drum' },
      { targetSound: '/ee/', options: ['bee', 'seal', 'eel', 'fire'], correctAnswer: 'bee' },
      { targetSound: '/p/', options: ['desk', 'climb', 'lamp', 'lamb'], correctAnswer: 'lamp' },
      { targetSound: '/b/', options: ['web', 'wall', 'feel', 'hut'], correctAnswer: 'web' },
      { targetSound: '/d/', options: ['desk', 'feet', 'sand', 'beach'], correctAnswer: 'sand' },
      { targetSound: '/r/', options: ['card', 'run', 'mirror', 'gold'], correctAnswer: 'mirror' },
      { targetSound: '/t/', options: ['teach', 'belt', 'park', 'tap'], correctAnswer: 'belt' },
      { targetSound: '/s/', options: ['school', 'horse', 'mouth', 'neck'], correctAnswer: 'horse' },
      { targetSound: '/i/', options: ['monkey', 'ink', 'fish', 'bill'], correctAnswer: 'monkey' },
      { targetSound: '/n/', options: ['bin', 'lake', 'night', 'sea'], correctAnswer: 'bin' },
      { targetSound: '/g/', options: ['hand', 'fig', 'bark', 'glass'], correctAnswer: 'fig' },
      { targetSound: '/n/', options: ['green', 'blue', 'red', 'black'], correctAnswer: 'green' },
      { targetSound: '/b/', options: ['book', 'lamb', 'plum', 'brick'], correctAnswer: 'lamb' },
      { targetSound: '/d/', options: ['black', 'desk', 'hand', 'dog'], correctAnswer: 'hand' },
      { targetSound: '/l/', options: ['blink', 'leg', 'land', 'hill'], correctAnswer: 'hill' },
      { targetSound: '/f/', options: ['leaf', 'fly', 'sun', 'film'], correctAnswer: 'leaf' },
      { targetSound: '/k/', options: ['kid', 'truck', 'cape', 'cry'], correctAnswer: 'truck' },
      { targetSound: '/m/', options: ['hug', 'hut', 'cup', 'mum'], correctAnswer: 'mum' },
      { targetSound: '/t/', options: ['teeth', 'bat', 'train', 'kettle'], correctAnswer: 'bat' }
    ]
  },
  {
    level: 8,
    targetSound: '/a/',
    mechanic: 'binary-single',
    instruction: 'Read the word. Does it contain the short /a/ sound?',
    questions: [
      { word: 'Cap', correctAnswer: 'yes' },
      { word: 'Bun', correctAnswer: 'no' },
      { word: 'Rat', correctAnswer: 'yes' },
      { word: 'Spot', correctAnswer: 'no' },
      { word: 'Cub', correctAnswer: 'no' },
      { word: 'Ant', correctAnswer: 'yes' },
      { word: 'Rag', correctAnswer: 'yes' },
      { word: 'Silk', correctAnswer: 'no' },
      { word: 'Rack', correctAnswer: 'yes' },
      { word: 'Pack', correctAnswer: 'yes' },
      { word: 'Talk', correctAnswer: 'no' },
      { word: 'Damp', correctAnswer: 'yes' },
      { word: 'Car', correctAnswer: 'no' },
      { word: 'Rich', correctAnswer: 'no' },
      { word: 'Bus', correctAnswer: 'no' },
      { word: 'Rest', correctAnswer: 'no' },
      { word: 'Dog', correctAnswer: 'no' },
      { word: 'Mat', correctAnswer: 'yes' },
      { word: 'Bat', correctAnswer: 'yes' },
      { word: 'Shape', correctAnswer: 'no' },
      { word: 'Tap', correctAnswer: 'yes' },
      { word: 'Tub', correctAnswer: 'no' },
      { word: 'Sack', correctAnswer: 'yes' },
      { word: 'Bake', correctAnswer: 'no' },
      { word: 'Cat', correctAnswer: 'yes' },
      { word: 'Lap', correctAnswer: 'yes' },
      { word: 'New', correctAnswer: 'no' },
      { word: 'Fill', correctAnswer: 'no' },
      { word: 'Top', correctAnswer: 'no' },
      { word: 'Sand', correctAnswer: 'yes' },
      { word: 'Truck', correctAnswer: 'no' },
      { word: 'Tip', correctAnswer: 'no' },
      { word: 'Tree', correctAnswer: 'no' },
      { word: 'Bank', correctAnswer: 'yes' },
      { word: 'Jam', correctAnswer: 'yes' },
      { word: 'Rock', correctAnswer: 'no' },
      { word: 'Bill', correctAnswer: 'no' },
      { word: 'Dip', correctAnswer: 'no' },
      { word: 'Map', correctAnswer: 'yes' },
      { word: 'Mug', correctAnswer: 'no' },
      { word: 'Cup', correctAnswer: 'no' },
      { word: 'Camp', correctAnswer: 'yes' },
      { word: 'Build', correctAnswer: 'no' },
      { word: 'Tail', correctAnswer: 'no' },
      { word: 'Take', correctAnswer: 'no' },
      { word: 'Fan', correctAnswer: 'yes' },
      { word: 'Far', correctAnswer: 'no' },
      { word: 'Man', correctAnswer: 'yes' },
      { word: 'Sail', correctAnswer: 'no' }
    ]
  },
  {
    level: 9,
    targetSound: '/sh/',
    mechanic: 'binary-single',
    instruction: 'Read the word. Does it contain the /sh/ sound?',
    questions: [
      { word: 'Rush', correctAnswer: 'yes' },
      { word: 'Share', correctAnswer: 'yes' },
      { word: 'Sweet', correctAnswer: 'no' },
      { word: 'Flip', correctAnswer: 'no' },
      { word: 'Floor', correctAnswer: 'no' },
      { word: 'Smoke', correctAnswer: 'no' },
      { word: 'Moon', correctAnswer: 'no' },
      { word: 'Must', correctAnswer: 'no' },
      { word: 'March', correctAnswer: 'no' },
      { word: 'Minus', correctAnswer: 'no' },
      { word: 'Brick', correctAnswer: 'no' },
      { word: 'Shape', correctAnswer: 'yes' },
      { word: 'Mist', correctAnswer: 'no' },
      { word: 'Shoot', correctAnswer: 'yes' },
      { word: 'Shame', correctAnswer: 'yes' },
      { word: 'Dress', correctAnswer: 'no' },
      { word: 'Maths', correctAnswer: 'no' },
      { word: 'Nest', correctAnswer: 'no' },
      { word: 'Charm', correctAnswer: 'no' },
      { word: 'Think', correctAnswer: 'no' },
      { word: 'Brand', correctAnswer: 'no' },
      { word: 'Dish', correctAnswer: 'yes' },
      { word: 'Rinse', correctAnswer: 'no' },
      { word: 'Shy', correctAnswer: 'yes' },
      { word: 'Dance', correctAnswer: 'no' },
      { word: 'Sheet', correctAnswer: 'yes' },
      { word: 'Sheep', correctAnswer: 'yes' },
      { word: 'Mesh', correctAnswer: 'yes' },
      { word: 'Crush', correctAnswer: 'yes' },
      { word: 'Down', correctAnswer: 'no' },
      { word: 'Rash', correctAnswer: 'yes' },
      { word: 'Drain', correctAnswer: 'no' },
      { word: 'Shake', correctAnswer: 'yes' },
      { word: 'Brush', correctAnswer: 'yes' },
      { word: 'Trust', correctAnswer: 'no' },
      { word: 'Sharp', correctAnswer: 'yes' },
      { word: 'Drink', correctAnswer: 'no' },
      { word: 'Class', correctAnswer: 'no' },
      { word: 'Crib', correctAnswer: 'no' },
      { word: 'Harsh', correctAnswer: 'yes' },
      { word: 'Shop', correctAnswer: 'yes' },
      { word: 'Thin', correctAnswer: 'no' },
      { word: 'Show', correctAnswer: 'yes' },
      { word: 'Tank', correctAnswer: 'no' },
      { word: 'Mask', correctAnswer: 'no' },
      { word: 'Calm', correctAnswer: 'no' },
      { word: 'Song', correctAnswer: 'no' },
      { word: 'Clash', correctAnswer: 'yes' },
      { word: 'Post', correctAnswer: 'no' }
    ]
  },
  {
    level: 10,
    targetSound: 'varies',
    mechanic: 'binary-single',
    instruction: 'Read the word. Does it contain the target sound?',
    questions: [
      { targetSound: '/s/', word: 'rustle', correctAnswer: 'yes' },
      { targetSound: '/s/', word: 'mint', correctAnswer: 'no' },
      { targetSound: '/s/', word: 'success', correctAnswer: 'yes' },
      { targetSound: '/s/', word: 'ankle', correctAnswer: 'no' },
      { targetSound: '/n/', word: 'thankful', correctAnswer: 'yes' },
      { targetSound: '/n/', word: 'breath', correctAnswer: 'no' },
      { targetSound: '/n/', word: 'weekend', correctAnswer: 'yes' },
      { targetSound: '/n/', word: 'Maths', correctAnswer: 'no' },
      { targetSound: '/th/', word: 'arithmetic', correctAnswer: 'yes' },
      { targetSound: '/th/', word: 'Project', correctAnswer: 'no' },
      { targetSound: '/th/', word: 'Bother', correctAnswer: 'yes' },
      { targetSound: '/th/', word: 'Eel', correctAnswer: 'no' },
      { targetSound: '/o/', word: 'Spotted', correctAnswer: 'yes' },
      { targetSound: '/o/', word: 'Street', correctAnswer: 'no' },
      { targetSound: '/o/', word: 'Smock', correctAnswer: 'yes' },
      { targetSound: '/o/', word: 'Fish', correctAnswer: 'no' },
      { targetSound: '/ee/', word: 'Clean', correctAnswer: 'yes' },
      { targetSound: '/ee/', word: 'Pickle', correctAnswer: 'no' },
      { targetSound: '/ee/', word: 'Sleep', correctAnswer: 'yes' },
      { targetSound: '/ee/', word: 'Glitch', correctAnswer: 'no' },
      { targetSound: '/i/', word: 'Strict', correctAnswer: 'yes' },
      { targetSound: '/i/', word: 'Toward', correctAnswer: 'no' },
      { targetSound: '/i/', word: 'Flimsy', correctAnswer: 'yes' },
      { targetSound: '/i/', word: 'Best', correctAnswer: 'no' },
      { targetSound: '/u/', word: 'Cunning', correctAnswer: 'yes' },
      { targetSound: '/u/', word: 'Toward', correctAnswer: 'no' },
      { targetSound: '/u/', word: 'Muddled', correctAnswer: 'yes' },
      { targetSound: '/u/', word: 'Chat', correctAnswer: 'no' },
      { targetSound: '/t/', word: 'Festival', correctAnswer: 'yes' },
      { targetSound: '/t/', word: 'Inches', correctAnswer: 'no' },
      { targetSound: '/t/', word: 'Strike', correctAnswer: 'yes' },
      { targetSound: '/t/', word: 'Beach', correctAnswer: 'no' },
      { targetSound: '/ch/', word: 'matching', correctAnswer: 'yes' },
      { targetSound: '/ch/', word: 'Musty', correctAnswer: 'no' },
      { targetSound: '/ch/', word: 'Glitch', correctAnswer: 'yes' },
      { targetSound: '/ch/', word: 'count', correctAnswer: 'no' }
    ]
  }
];
