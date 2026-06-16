import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { Home, Volume2, HelpCircle, Check, X, Music } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ThemeToggle } from '../ThemeToggle';
import { useGameSession } from '../../context/GameSessionContext';
import { phonemePopData, PhonemeQuestion } from '../../../data/phonemePopData';
import { getOptionIcon } from '../OptionIconMapper';
import { playAudio } from '../../../lib/audioUtils';

interface PhonemePopProps {
  levelData?: any; // kept for compatibility if needed, but we pull dynamically
  onComplete?: (score: number, total: number) => void;
}

// Fisher-Yates Shuffle algorithm
function shuffleQuestions<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function PhonemePop({}: PhonemePopProps) {
  const navigate = useNavigate();
  const { level } = useParams();
  const location = useLocation();
  const { progressorId } = useGameSession();

  const levelStr = level || '1';
  const levelNum = Number(levelStr);

  const activeLevelConfig = phonemePopData.find(l => l.level === levelNum) || phonemePopData[0];
  const mechanic = activeLevelConfig.mechanic;

  const [currentQuestions, setCurrentQuestions] = useState<PhonemeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  
  // Transition lock and clinical tracking states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  
  // selectedAnswer is string for binary ('yes'|'no'), number for multiple-choice (index), or -1/non-null for submitted select-all
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  
  // For select-all mechanic
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  const [timeElapsed, setTimeElapsed] = useState(0);
  // Timer Ref to track absolute elapsed time precisely
  const startTimeRef = useRef<number>(Date.now());

  // Input lock checking helper
  const isLocked = selectedAnswer !== null || isTransitioning || isPlaying;

  // Setup/Reset game questions pool and capture start time
  useEffect(() => {
    startTimeRef.current = Date.now();
    setTimeElapsed(0);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setMissedWords([]);
    setIsTransitioning(false);

    // Retrieve previous missed words from Try Again action state
    const prevMissed = location.state?.missedWords || [];

    const pool = activeLevelConfig.questions;

    // Helper to evaluate if a question was previously missed
    const isMissed = (q: PhonemeQuestion) => {
      if (q.word && prevMissed.includes(q.word)) return true;
      if (q.word1 && q.word2 && prevMissed.includes(`${q.word1}-${q.word2}`)) return true;
      if (q.targetSound && prevMissed.includes(q.targetSound)) return true;
      if (q.options) {
        return q.options.some(opt => opt.isCorrect && prevMissed.includes(opt.label));
      }
      return false;
    };

    const missedPool = pool.filter(isMissed);
    const remainingPool = pool.filter(q => !isMissed(q));

    // Shuffle both sets separately
    const shuffledMissed = shuffleQuestions(missedPool);
    const shuffledRemaining = shuffleQuestions(remainingPool);

    // Prioritize missed ones first, then fill remaining slots up to 10
    const combined = [...shuffledMissed, ...shuffledRemaining].slice(0, 10);

    // Final shuffle so missed questions are interspersed randomly
    setCurrentQuestions(shuffleQuestions(combined));
  }, [levelStr, activeLevelConfig, location.state]);

  // Tick the local UI timer display
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Native Text-to-Speech engine supporting en-IN
  const playIndianAudio = (text: string, source: string = 'main') => {
    playAudio(text, {
      onStart: () => {
        setIsPlaying(true);
        setPlayingWord(source);
      },
      onEnd: () => {
        setIsPlaying(false);
        setPlayingWord(null);
      },
      onError: () => {
        setIsPlaying(false);
        setPlayingWord(null);
      }
    });
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (currentQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading Voyage...</p>
      </div>
    );
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const totalQuestions = currentQuestions.length;
  const progressPercent = (currentQuestionIndex / totalQuestions) * 100;

  const playSound = () => {
    if (!currentQuestion || isTransitioning) return;
    
    // Determine target sound or word to play
    let textToSpeak = '';
    if (mechanic === 'binary-single') {
      textToSpeak = currentQuestion.word || '';
    } else {
      textToSpeak = currentQuestion.targetSound || activeLevelConfig.targetSound || '';
    }
    
    playIndianAudio(textToSpeak, 'main');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const advanceQuestion = (nextScore: number) => {
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setIsTransitioning(false);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const formattedTime = formatTime(elapsedSeconds);

      // Navigate to /result with final payload including missedWords
      navigate('/result', {
        state: {
          score: nextScore,
          totalQuestions,
          timeTaken: formattedTime,
          gameId: 'phoneme-pop',
          level: levelNum,
          progressorId: progressorId || 'demo',
          missedWords
        }
      });
    }
  };

  const handleBinaryAnswer = (answer: 'yes' | 'no') => {
    if (isLocked) return;
    setSelectedAnswer(answer);
    setIsTransitioning(true);

    const isCorrect = currentQuestion.correctAnswer === answer;
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
      toast.success('Correct!', {
        icon: <Check className="w-5 h-5 text-green-500" />,
        className: 'bg-card border border-green-500 text-foreground rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1000,
      });
    } else {
      // Record missed identifier dynamically
      let wordLabel = '';
      if (mechanic === 'binary-dual') {
        wordLabel = `${currentQuestion.word1}-${currentQuestion.word2}`;
      } else {
        wordLabel = currentQuestion.word || '';
      }
      setMissedWords((prev) => [...prev, wordLabel]);

      toast.error('Keep trying!', {
        icon: <X className="w-5 h-5 text-primary" />,
        className: 'bg-card border border-primary text-foreground rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1000,
      });
    }

    setTimeout(() => {
      advanceQuestion(nextScore);
    }, 1000);
  };

  const handleMultipleChoiceAnswer = (optionIndex: number, isCorrect: boolean) => {
    if (isLocked) return;
    setSelectedAnswer(optionIndex);
    setIsTransitioning(true);

    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
      toast.success('Correct!', {
        icon: <Check className="w-5 h-5 text-green-500" />,
        className: 'bg-card border border-green-500 text-foreground rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1000,
      });
    } else {
      // Record correct word they should have selected
      const correctLabel = currentQuestion.options?.find(o => o.isCorrect)?.label || '';
      setMissedWords((prev) => [...prev, correctLabel]);

      toast.error('Keep trying!', {
        icon: <X className="w-5 h-5 text-primary" />,
        className: 'bg-card border border-primary text-foreground rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1000,
      });
    }

    setTimeout(() => {
      advanceQuestion(nextScore);
    }, 1000);
  };

  const toggleSelectAllOption = (idx: number) => {
    if (isLocked) return; // block toggling during lock
    setSelectedAnswers(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleSelectAllSubmit = () => {
    if (isLocked) return;
    setSelectedAnswer(-1);
    setIsTransitioning(true);

    const correctIndices = currentQuestion.options
      ? currentQuestion.options.map((opt, idx) => (opt.isCorrect ? idx : -1)).filter(idx => idx !== -1)
      : [];

    const isExactlyCorrect =
      selectedAnswers.length === correctIndices.length &&
      selectedAnswers.every(val => correctIndices.includes(val));

    const nextScore = isExactlyCorrect ? score + 1 : score;

    if (isExactlyCorrect) {
      setScore(nextScore);
      toast.success('Correct!', {
        icon: <Check className="w-5 h-5 text-green-500" />,
        className: 'bg-card border border-green-500 text-foreground rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1000,
      });
    } else {
      // Record missed sound group
      const targetSoundText = currentQuestion.targetSound || activeLevelConfig.targetSound;
      const correctLabels = currentQuestion.options
        ? currentQuestion.options.filter(o => o.isCorrect).map(o => o.label).join(', ')
        : '';
      const missedLabel = `${targetSoundText}: ${correctLabels}`;
      setMissedWords((prev) => [...prev, missedLabel]);

      toast.error('Keep trying!', {
        icon: <X className="w-5 h-5 text-primary" />,
        className: 'bg-card border border-primary text-foreground rounded-[1.5rem] p-4 font-bold shadow-lg flex items-center gap-3',
        duration: 1000,
      });
    }

    setTimeout(() => {
      advanceQuestion(nextScore);
    }, 1500);
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return HelpCircle;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || HelpCircle;
  };

  const isCorrectBinary = (ans: 'yes' | 'no') => {
    return currentQuestion.correctAnswer === ans;
  };

  // Determine instruction title dynamically based on level config
  const getInstructionTitle = () => {
    const soundText = currentQuestion.targetSound || activeLevelConfig.targetSound;
    if (soundText === 'varies' || !soundText) {
      return activeLevelConfig.instruction;
    }
    
    if (mechanic === 'binary-dual') {
      return `Do both words contain the ${soundText} sound?`;
    }
    if (mechanic === 'binary-single') {
      return `Does this word contain the ${soundText} sound?`;
    }
    if (mechanic === 'multiple-choice') {
      return `Select the word that contains the ${soundText} sound`;
    }
    if (mechanic === 'select-all') {
      return `Select all the words that contain the ${soundText} sound`;
    }
    return activeLevelConfig.instruction;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
            </button>
            <div>
              <h3>Phoneme Pop</h3>
              <p className="text-sm text-muted-foreground">Level {levelStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">{formatTime(timeElapsed)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="font-medium">{score}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-muted h-2 w-full">
        <div
          className="h-full bg-primary transition-all duration-300"
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


            {/* Instruction Title */}
            <div className="flex items-center justify-center gap-3 mb-4 max-w-2xl">
              <h2 className="text-3xl font-bold text-center font-poppins">
                {getInstructionTitle()}
              </h2>
              <button
                onClick={() => playIndianAudio(getInstructionTitle(), 'question')}
                className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer"
                aria-label="Speak question"
              >
                <Volume2 className="w-6 h-6 text-muted-foreground hover:text-primary" />
              </button>
            </div>

            <p className="text-muted-foreground mb-12">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>

            {/* Conditionally Render game UI based on mechanic */}
            {mechanic === 'binary-dual' ? (
              <div className="flex flex-col items-center w-full max-w-2xl">
                {/* Dual Sound Cards */}
                <div className="flex flex-col sm:flex-row gap-6 w-full mb-12 justify-center items-stretch">
                  {/* Card 1 */}
                  <button
                    onClick={() => playIndianAudio(currentQuestion.word1 || '', 'word1')}
                    disabled={isTransitioning || isPlaying}
                    className={`flex-1 px-10 py-8 rounded-[2rem] border-2 bg-primary/10 border-primary/20 hover:border-primary/40 hover:bg-primary/15 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-6 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[140px]`}
                  >
                    <h1 className="text-3xl font-extrabold tracking-wide uppercase text-foreground font-poppins">
                      {currentQuestion.word1}
                    </h1>
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-muted shadow-md flex items-center justify-center text-primary transition-transform duration-300">
                      <Music className="w-5 h-5 animate-in zoom-in" />
                    </div>
                  </button>

                  {/* Card 2 */}
                  <button
                    onClick={() => playIndianAudio(currentQuestion.word2 || '', 'word2')}
                    disabled={isTransitioning || isPlaying}
                    className={`flex-1 px-10 py-8 rounded-[2rem] border-2 bg-primary/10 border-primary/20 hover:border-primary/40 hover:bg-primary/15 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-6 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[140px]`}
                  >
                    <h1 className="text-3xl font-extrabold tracking-wide uppercase text-foreground font-poppins">
                      {currentQuestion.word2}
                    </h1>
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-muted shadow-md flex items-center justify-center text-primary transition-transform duration-300">
                      <Music className="w-5 h-5 animate-in zoom-in" />
                    </div>
                  </button>
                </div>

                {/* YES / NO buttons */}
                <div className="flex gap-6 w-full justify-center max-w-md">
                  <button
                    onClick={() => handleBinaryAnswer('yes')}
                    disabled={isLocked}
                    className={`flex-1 h-32 rounded-2xl border-2 text-2xl font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedAnswer === null
                        ? 'border-border bg-card hover:border-green-500 hover:bg-green-500/10 hover:scale-105 active:scale-95 text-foreground'
                        : selectedAnswer === 'yes'
                          ? isCorrectBinary('yes')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400'
                          : isCorrectBinary('yes')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-border bg-card opacity-50 text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {getOptionIcon('yes')}
                      <span>YES</span>
                    </span>
                  </button>
                  <button
                    onClick={() => handleBinaryAnswer('no')}
                    disabled={isLocked}
                    className={`flex-1 h-32 rounded-2xl border-2 text-2xl font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedAnswer === null
                        ? 'border-border bg-card hover:border-red-500 hover:bg-red-500/10 hover:scale-105 active:scale-95 text-foreground'
                        : selectedAnswer === 'no'
                          ? isCorrectBinary('no')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400'
                          : isCorrectBinary('no')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-border bg-card opacity-50 text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {getOptionIcon('no')}
                      <span>NO</span>
                    </span>
                  </button>
                </div>
              </div>
            ) : mechanic === 'binary-single' ? (
              <div className="flex flex-col items-center w-full max-w-md">
                {currentQuestion.word && (
                  <div className="flex flex-col items-center mb-8 w-full">
                    <button
                      onClick={playSound}
                      disabled={isTransitioning || isPlaying}
                      className={`px-12 py-6 rounded-[2rem] border-2 bg-primary/10 border-primary/20 hover:border-primary/40 hover:bg-primary/15 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-6 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide uppercase text-foreground font-poppins">
                        {currentQuestion.word}
                      </h1>
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-muted shadow-md flex items-center justify-center text-primary transition-transform duration-300">
                        <Music className="w-5 h-5" />
                      </div>
                    </button>
                    <p className="text-muted-foreground mt-4 text-sm font-sans tracking-wide">
                      Listen carefully and choose your answer.
                    </p>
                  </div>
                )}

                <div className="flex gap-6 w-full justify-center">
                  <button
                    onClick={() => handleBinaryAnswer('yes')}
                    disabled={isLocked}
                    className={`flex-1 h-32 rounded-2xl border-2 text-2xl font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedAnswer === null
                        ? 'border-border bg-card hover:border-green-500 hover:bg-green-500/10 hover:scale-105 active:scale-95 text-foreground'
                        : selectedAnswer === 'yes'
                          ? isCorrectBinary('yes')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400'
                          : isCorrectBinary('yes')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-border bg-card opacity-50 text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {getOptionIcon('yes')}
                      <span>YES</span>
                    </span>
                  </button>
                  <button
                    onClick={() => handleBinaryAnswer('no')}
                    disabled={isLocked}
                    className={`flex-1 h-32 rounded-2xl border-2 text-2xl font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedAnswer === null
                        ? 'border-border bg-card hover:border-red-500 hover:bg-red-500/10 hover:scale-105 active:scale-95 text-foreground'
                        : selectedAnswer === 'no'
                          ? isCorrectBinary('no')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400'
                          : isCorrectBinary('no')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-border bg-card opacity-50 text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {getOptionIcon('no')}
                      <span>NO</span>
                    </span>
                  </button>
                </div>
              </div>
            ) : mechanic === 'select-all' ? (
              <div className="flex flex-col items-center w-full max-w-4xl">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8">
                  {currentQuestion.options?.map((option, idx) => {
                    const Icon = getIcon(option.icon);
                    const isSelected = selectedAnswers.includes(idx);
                    
                    let cardStyles = 'border-border bg-card hover:shadow-xl hover:scale-105 active:scale-95 text-foreground';
                    
                    if (selectedAnswer !== null) {
                      // After submit feedback mode
                      if (option.isCorrect) {
                        cardStyles = 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400';
                      } else if (isSelected) {
                        cardStyles = 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400';
                      } else {
                        cardStyles = 'border-border bg-card opacity-50 text-foreground';
                      }
                    } else if (isSelected) {
                      // Selected state before submit
                      cardStyles = 'border-primary bg-primary/10 text-foreground scale-105';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => toggleSelectAllOption(idx)}
                        disabled={isLocked}
                        className={`p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center relative disabled:cursor-not-allowed ${cardStyles}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playIndianAudio(option.label, `option-${idx}`);
                          }}
                          disabled={isTransitioning || isPlaying}
                          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Listen to word"
                        >
                          <Volume2 className="w-5 h-5 text-muted-foreground hover:text-primary" />
                        </button>
                        <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                          (selectedAnswer !== null && option.isCorrect) || (selectedAnswer === null && isSelected)
                            ? 'bg-primary/20 text-primary'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <Icon className="w-12 h-12" />
                        </div>
                        <h3 className="font-bold text-center text-xl uppercase flex items-center gap-2 justify-center">
                          <span>{option.label}</span>
                        </h3>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleSelectAllSubmit}
                  disabled={selectedAnswers.length === 0 || selectedAnswer !== null || isTransitioning || isPlaying}
                  className={`px-12 py-5 rounded-2xl font-bold text-xl text-white shadow-xl transition-all duration-300 ${
                    selectedAnswers.length === 0 || selectedAnswer !== null || isTransitioning || isPlaying
                      ? 'bg-muted border border-border text-muted-foreground cursor-not-allowed opacity-50'
                      : 'bg-[#FF6347] hover:bg-[#FF6347]/90 hover:scale-105 active:scale-95'
                  }`}
                >
                  Submit Answer
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
                {currentQuestion.options?.map((option, idx) => {
                  const Icon = getIcon(option.icon);
                  const isSelected = selectedAnswer === idx;

                  let cardStyles = 'border-border bg-card hover:shadow-xl hover:scale-105 active:scale-95 text-foreground';
                  if (selectedAnswer !== null) {
                    if (isSelected) {
                      cardStyles = option.isCorrect
                        ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                        : 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400';
                    } else {
                      cardStyles = option.isCorrect
                        ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                        : 'border-border bg-card opacity-50 text-foreground';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleMultipleChoiceAnswer(idx, option.isCorrect)}
                      disabled={isLocked}
                      className={`p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center relative disabled:cursor-not-allowed ${cardStyles}`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playIndianAudio(option.label, `option-${idx}`);
                        }}
                        disabled={isTransitioning || isPlaying}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Listen to word"
                      >
                        <Volume2 className="w-5 h-5 text-muted-foreground hover:text-primary" />
                      </button>
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${selectedAnswer !== null && option.isCorrect
                          ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                          : 'bg-primary/10 text-primary'
                        }`}>
                        <Icon className="w-12 h-12" />
                      </div>
                      <h3 className="font-bold text-center text-xl uppercase flex items-center gap-2 justify-center">
                        <span>{option.label}</span>
                      </h3>
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
