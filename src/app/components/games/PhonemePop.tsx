import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Home, Volume2, HelpCircle, Check, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ThemeToggle } from '../ThemeToggle';
import { useGameSession } from '../../context/GameSessionContext';

interface Option {
  label: string;
  isCorrect: boolean;
  icon?: string;
}

interface Question {
  audio: string;
  word?: string;
  word1?: string;
  word2?: string;
  isMatch?: boolean;
  correctAnswer?: 'yes' | 'no';
  options?: Option[];
}

interface LevelData {
  level: number;
  type: 'binary' | 'multiple-choice';
  instruction: string;
  questions: Question[];
}

interface PhonemePopProps {
  levelData: LevelData;
  onComplete: (score: number, total: number) => void;
}

// Hardcoded Level 1 Data Pool (Target sound: /b/)
const LEVEL_1_POOL = [
  { word: 'Dress', hasBSound: false },
  { word: 'Banana', hasBSound: true },
  { word: 'Brush', hasBSound: true },
  { word: 'Bank', hasBSound: true },
  { word: 'Fall', hasBSound: false },
  { word: 'Drink', hasBSound: false },
  { word: 'Jam', hasBSound: false },
  { word: 'Coffee', hasBSound: false },
  { word: 'Log', hasBSound: false },
  { word: 'Hut', hasBSound: false },
  { word: 'Brown', hasBSound: true },
  { word: 'Mother', hasBSound: false },
  { word: 'Rabbit', hasBSound: true },
  { word: 'Dog', hasBSound: false },
  { word: 'Dress', hasBSound: false },
  { word: 'Card', hasBSound: false },
  { word: 'About', hasBSound: true },
  { word: 'Shop', hasBSound: false },
  { word: 'Shower', hasBSound: false },
  { word: 'Book', hasBSound: true }
];

// Hardcoded Level 2 Data Pool (Comparative sound matching)
const LEVEL_2_POOL = [
  // Matching initial sounds (Correct Answer: YES)
  { word1: "Bat", word2: "Ball", isMatch: true },
  { word1: "Cat", word2: "Cup", isMatch: true },
  { word1: "Dog", word2: "Duck", isMatch: true },
  { word1: "Sun", word2: "Sock", isMatch: true },
  { word1: "Fish", word2: "Fan", isMatch: true },
  { word1: "Mop", word2: "Moon", isMatch: true },
  { word1: "Pig", word2: "Pen", isMatch: true },
  { word1: "Hat", word2: "Hut", isMatch: true },
  { word1: "Run", word2: "Ring", isMatch: true },
  { word1: "Tap", word2: "Top", isMatch: true },
  // Non-matching initial sounds (Correct Answer: NO)
  { word1: "Bat", word2: "Cat", isMatch: false },
  { word1: "Dog", word2: "Log", isMatch: false },
  { word1: "Sun", word2: "Bun", isMatch: false },
  { word1: "Fish", word2: "Dish", isMatch: false },
  { word1: "Mop", word2: "Top", isMatch: false },
  { word1: "Pig", word2: "Big", isMatch: false },
  { word1: "Hat", word2: "Cat", isMatch: false },
  { word1: "Run", word2: "Sun", isMatch: false },
  { word1: "Tap", word2: "Map", isMatch: false },
  { word1: "Cup", word2: "Pup", isMatch: false }
];

// Fisher-Yates Shuffle algorithm
function shuffleQuestions<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function PhonemePop({ levelData }: PhonemePopProps) {
  const navigate = useNavigate();
  const { level } = useParams();
  const { progressorId } = useGameSession();
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingWord, setPlayingWord] = useState<'word1' | 'word2' | 'main' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Timer Ref to track absolute elapsed time precisely
  const startTimeRef = useRef<number>(Date.now());

  // Setup voices dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Setup/Reset game questions pool and capture start time
  useEffect(() => {
    startTimeRef.current = Date.now();
    setTimeElapsed(0);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);

    const levelStr = level || String(levelData?.level || 1);

    if (levelStr === '1') {
      const mappedPool = LEVEL_1_POOL.map(item => ({
        word: item.word,
        correctAnswer: (item.hasBSound ? 'yes' : 'no') as 'yes' | 'no',
        audio: ''
      }));
      // Fisher-Yates shuffle and select exactly 10 questions
      const selected = shuffleQuestions(mappedPool).slice(0, 10);
      setCurrentQuestions(selected);
    } else if (levelStr === '2') {
      const mappedPool = LEVEL_2_POOL.map(item => ({
        word1: item.word1,
        word2: item.word2,
        correctAnswer: (item.isMatch ? 'yes' : 'no') as 'yes' | 'no',
        audio: ''
      }));
      // Fisher-Yates shuffle and select exactly 10 questions
      const selected = shuffleQuestions(mappedPool).slice(0, 10);
      setCurrentQuestions(selected);
    } else {
      // For other levels, shuffle and select the questions from levelData
      const shuffled = shuffleQuestions(levelData?.questions || []);
      setCurrentQuestions(shuffled.slice(0, 10));
    }
  }, [levelData, level]);

  // Tick the local UI timer display
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Native Text-to-Speech engine supporting en-IN
  const playIndianAudio = (text: string, source: 'word1' | 'word2' | 'main' = 'main') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel ongoing speech gracefully to handle rapid consecutive button clicks
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Find Indian English voice
    const indianVoice = voices.find(
      (voice) =>
        voice.lang === 'en-IN' ||
        voice.lang.startsWith('en-IN') ||
        voice.lang.replace('_', '-').includes('en-IN')
    );

    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setPlayingWord(source);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setPlayingWord(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setPlayingWord(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const levelStr = level || String(levelData?.level || 1);

  if (currentQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[#1D1C16] text-white flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6347] mb-4"></div>
        <p className="text-muted-foreground">Loading Voyage...</p>
      </div>
    );
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const totalQuestions = currentQuestions.length;
  const progressPercent = (currentQuestionIndex / totalQuestions) * 100;

  const playSound = () => {
    if (!currentQuestion) return;
    const textToSpeak = currentQuestion.word || (levelData ? levelData.instruction : '');
    playIndianAudio(textToSpeak, 'main');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const advanceQuestion = (nextScore: number) => {
    setSelectedAnswer(null);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const formattedTime = formatTime(elapsedSeconds);

      // Navigate to /result with final payload
      navigate('/result', {
        state: {
          score: nextScore,
          totalQuestions,
          timeTaken: formattedTime,
          gameId: 'phoneme-pop',
          level: Number(levelStr),
          progressorId: progressorId || 'demo'
        }
      });
    }
  };

  const handleBinaryAnswer = (answer: 'yes' | 'no') => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);

    const isCorrect = currentQuestion.correctAnswer === answer;
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
      toast.success('Correct!', {
        icon: <Check className="w-5 h-5 text-green-500" />,
        className: 'bg-[#1D1C16] border border-green-500 text-white rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1000,
      });
    } else {
      toast.error('Keep trying!', {
        icon: <X className="w-5 h-5 text-[#FF6347]" />,
        className: 'bg-[#1D1C16] border border-[#FF6347] text-white rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1000,
      });
    }

    setTimeout(() => {
      advanceQuestion(nextScore);
    }, 1000);
  };

  const handleMultipleChoiceAnswer = (optionIndex: number, isCorrect: boolean) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIndex);

    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
      toast.success('Correct!', {
        icon: <Check className="w-5 h-5 text-green-500" />,
        className: 'bg-[#1D1C16] border border-green-500 text-white rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1000,
      });
    } else {
      toast.error('Keep trying!', {
        icon: <X className="w-5 h-5 text-[#FF6347]" />,
        className: 'bg-[#1D1C16] border border-[#FF6347] text-white rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1000,
      });
    }

    setTimeout(() => {
      advanceQuestion(nextScore);
    }, 1000);
  };

  // Helper to dynamically load Lucide icons to prevent bundler problems
  const getIcon = (iconName?: string) => {
    if (!iconName) return HelpCircle;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || HelpCircle;
  };

  const isCorrectBinary = (ans: 'yes' | 'no') => {
    return currentQuestion.correctAnswer === ans;
  };

  return (
    <div className="min-h-screen bg-[#1D1C16] text-white">
      {/* Header */}
      <div className="bg-[#1D1C16] border-b border-[#2C2B24] px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-white">Phoneme Pop</h3>
              <p className="text-sm text-muted-foreground">Level {levelStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium text-white">{formatTime(timeElapsed)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="font-medium text-white">{score}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#2C2B24] h-2 w-full">
        <div
          className="h-full bg-[#FF6347] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Game Content */}
      <div className="max-w-5xl mx-auto px-8 py-12 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center"
          >
            {/* Play Sound Button (Level 1 / Other Levels) */}
            {levelStr !== '2' && (
              <button
                onClick={playSound}
                className={`mb-12 w-32 h-32 rounded-full text-white shadow-2xl transition-all duration-300 flex items-center justify-center ${isPlaying && playingWord === 'main'
                    ? 'bg-[#FF6347]/80 scale-105 animate-pulse'
                    : 'bg-[#FF6347] hover:scale-110 active:scale-95'
                  }`}
              >
                <Volume2 className="w-12 h-12 animate-in zoom-in" />
              </button>
            )}

            {/* Instruction Title */}
            <h2 className="mb-4 text-3xl font-bold text-center max-w-2xl text-white font-poppins">
              {levelStr === '2' ? "Do these words start with the same sound?" : (levelData?.instruction || "Does this word start with the /b/ sound?")}
            </h2>

            <p className="text-muted-foreground mb-12">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>

            {/* Conditionally Render Yes/No vs Option Grid */}
            {levelStr === '2' ? (
              <div className="flex flex-col items-center w-full max-w-2xl">
                {/* Dual Sound Cards */}
                <div className="flex flex-col sm:flex-row gap-6 w-full mb-12 justify-center items-stretch">
                  {/* Card 1 */}
                  <div className="flex-1 p-8 rounded-[2rem] bg-[#2C2B24] border border-[#3E3C33] flex flex-col items-center justify-between shadow-md text-center transition-all hover:border-[#FF6347]/30 min-h-[220px]">
                    <button
                      onClick={() => playIndianAudio(currentQuestion.word1 || '', 'word1')}
                      className={`mb-6 w-24 h-24 rounded-full text-white shadow-lg transition-all duration-300 flex items-center justify-center ${playingWord === 'word1'
                          ? 'bg-[#FF6347]/80 scale-105 animate-pulse'
                          : 'bg-[#FF6347] hover:scale-110 active:scale-95'
                        }`}
                    >
                      <Volume2 className="w-10 h-10 animate-in zoom-in" />
                    </button>
                    <h1 className="text-3xl font-extrabold tracking-wide uppercase text-white">
                      {currentQuestion.word1}
                    </h1>
                  </div>

                  {/* Card 2 */}
                  <div className="flex-1 p-8 rounded-[2rem] bg-[#2C2B24] border border-[#3E3C33] flex flex-col items-center justify-between shadow-md text-center transition-all hover:border-[#FF6347]/30 min-h-[220px]">
                    <button
                      onClick={() => playIndianAudio(currentQuestion.word2 || '', 'word2')}
                      className={`mb-6 w-24 h-24 rounded-full text-white shadow-lg transition-all duration-300 flex items-center justify-center ${playingWord === 'word2'
                          ? 'bg-[#FF6347]/80 scale-105 animate-pulse'
                          : 'bg-[#FF6347] hover:scale-110 active:scale-95'
                        }`}
                    >
                      <Volume2 className="w-10 h-10 animate-in zoom-in" />
                    </button>
                    <h1 className="text-3xl font-extrabold tracking-wide uppercase text-white">
                      {currentQuestion.word2}
                    </h1>
                  </div>
                </div>

                {/* YES / NO buttons */}
                <div className="flex gap-6 w-full justify-center max-w-md">
                  <button
                    onClick={() => handleBinaryAnswer('yes')}
                    disabled={selectedAnswer !== null}
                    className={`flex-1 h-32 rounded-[2rem] border-2 text-2xl font-bold transition-all duration-300 flex items-center justify-center ${selectedAnswer === null
                        ? 'border-[#2C2B24] bg-[#2C2B24] hover:border-green-500 hover:bg-green-500/10 hover:scale-105 active:scale-95 text-white'
                        : selectedAnswer === 'yes'
                          ? isCorrectBinary('yes')
                            ? 'border-green-500 bg-green-500/15 text-green-400'
                            : 'border-red-500 bg-red-500/15 text-red-400'
                          : isCorrectBinary('yes')
                            ? 'border-green-500 bg-green-500/15 text-green-400'
                            : 'border-[#2C2B24] bg-[#2C2B24] opacity-50 text-white'
                      }`}
                  >
                    YES
                  </button>
                  <button
                    onClick={() => handleBinaryAnswer('no')}
                    disabled={selectedAnswer !== null}
                    className={`flex-1 h-32 rounded-[2rem] border-2 text-2xl font-bold transition-all duration-300 flex items-center justify-center ${selectedAnswer === null
                        ? 'border-[#2C2B24] bg-[#2C2B24] hover:border-red-500 hover:bg-red-500/10 hover:scale-105 active:scale-95 text-white'
                        : selectedAnswer === 'no'
                          ? isCorrectBinary('no')
                            ? 'border-green-500 bg-green-500/15 text-green-400'
                            : 'border-red-500 bg-red-500/15 text-red-400'
                          : isCorrectBinary('no')
                            ? 'border-green-500 bg-green-500/15 text-green-400'
                            : 'border-[#2C2B24] bg-[#2C2B24] opacity-50 text-white'
                      }`}
                  >
                    NO
                  </button>
                </div>
              </div>
            ) : levelData && levelData.type === 'binary' ? (
              <div className="flex flex-col items-center w-full max-w-md">
                {currentQuestion.word && (
                  <div className="mb-8 p-6 rounded-[2rem] bg-[#2C2B24] border border-[#3E3C33] text-center shadow-md min-w-[200px]">
                    <h1 className="text-4xl font-extrabold tracking-wide uppercase text-white">
                      {currentQuestion.word}
                    </h1>
                  </div>
                )}

                <div className="flex gap-6 w-full justify-center">
                  <button
                    onClick={() => handleBinaryAnswer('yes')}
                    disabled={selectedAnswer !== null}
                    className={`flex-1 h-32 rounded-[2rem] border-2 text-2xl font-bold transition-all duration-300 flex items-center justify-center ${selectedAnswer === null
                        ? 'border-[#2C2B24] bg-[#2C2B24] hover:border-green-500 hover:bg-green-500/10 hover:scale-105 active:scale-95 text-white'
                        : selectedAnswer === 'yes'
                          ? isCorrectBinary('yes')
                            ? 'border-green-500 bg-green-500/15 text-green-400'
                            : 'border-red-500 bg-red-500/15 text-red-400'
                          : isCorrectBinary('yes')
                            ? 'border-green-500 bg-green-500/15 text-green-400'
                            : 'border-[#2C2B24] bg-[#2C2B24] opacity-50 text-white'
                      }`}
                  >
                    YES
                  </button>
                  <button
                    onClick={() => handleBinaryAnswer('no')}
                    disabled={selectedAnswer !== null}
                    className={`flex-1 h-32 rounded-[2rem] border-2 text-2xl font-bold transition-all duration-300 flex items-center justify-center ${selectedAnswer === null
                        ? 'border-[#2C2B24] bg-[#2C2B24] hover:border-red-500 hover:bg-red-500/10 hover:scale-105 active:scale-95 text-white'
                        : selectedAnswer === 'no'
                          ? isCorrectBinary('no')
                            ? 'border-green-500 bg-green-500/15 text-green-400'
                            : 'border-red-500 bg-red-500/15 text-red-400'
                          : isCorrectBinary('no')
                            ? 'border-green-500 bg-green-500/15 text-green-400'
                            : 'border-[#2C2B24] bg-[#2C2B24] opacity-50 text-white'
                      }`}
                  >
                    NO
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
                {currentQuestion.options?.map((option, idx) => {
                  const Icon = getIcon(option.icon);
                  const isSelected = selectedAnswer === idx;

                  let cardStyles = 'border-[#2C2B24] bg-[#2C2B24] hover:shadow-xl hover:scale-105 active:scale-95 text-white';
                  if (selectedAnswer !== null) {
                    if (isSelected) {
                      cardStyles = option.isCorrect
                        ? 'border-green-500 bg-green-500/15 text-green-400'
                        : 'border-red-500 bg-red-500/15 text-red-400';
                    } else {
                      cardStyles = option.isCorrect
                        ? 'border-green-500 bg-green-500/15 text-green-400'
                        : 'border-[#2C2B24] bg-[#2C2B24] opacity-50 text-white';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleMultipleChoiceAnswer(idx, option.isCorrect)}
                      disabled={selectedAnswer !== null}
                      className={`p-8 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center ${cardStyles}`}
                    >
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${selectedAnswer !== null && option.isCorrect
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-[#FF6347]/10 text-[#FF6347]'
                        }`}>
                        <Icon className="w-12 h-12" />
                      </div>
                      <h3 className="font-bold text-center text-xl">{option.label}</h3>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
