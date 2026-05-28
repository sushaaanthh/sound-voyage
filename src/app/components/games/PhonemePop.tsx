import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Home, Volume2, HelpCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ThemeToggle } from '../ThemeToggle';

interface Option {
  label: string;
  isCorrect: boolean;
  icon?: string;
}

interface Question {
  audio: string;
  word?: string;
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

export default function PhonemePop({ levelData, onComplete }: PhonemePopProps) {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Audio Engine: handles HTML5 audio element lifecycle
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tick the local game timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup audio play on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!levelData || !levelData.questions || levelData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <h2 className="mb-4">No Level Data Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-[1.5rem] bg-secondary hover:bg-muted"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentQuestion = levelData.questions[currentQuestionIndex];
  const totalQuestions = levelData.questions.length;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  const playSound = () => {
    if (!currentQuestion || !currentQuestion.audio) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(currentQuestion.audio);
    audioRef.current = audio;
    setIsPlaying(true);

    audio.play()
      .then(() => {
        // Successfully started playback
      })
      .catch((error) => {
        // Fallback for missing audio files during development or offline testing
        console.warn('Audio playback failed, using fallback visual notification:', error);
        setIsPlaying(false);
        toast.info(`Listen for: "${currentQuestion.word || 'target sound'}"`);
      });

    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  const advanceQuestion = (isCorrect: boolean) => {
    setSelectedAnswer(null);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const finalScore = isCorrect ? score + 1 : score;
      onComplete(finalScore, totalQuestions);
    }
  };

  const handleBinaryAnswer = (answer: 'yes' | 'no') => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);

    const isCorrect = currentQuestion.correctAnswer === answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast.success('Correct!');
    } else {
      toast.error('Keep trying!');
    }

    setTimeout(() => {
      advanceQuestion(isCorrect);
    }, 1000);
  };

  const handleMultipleChoiceAnswer = (optionIndex: number, isCorrect: boolean) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIndex);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast.success('Correct!');
    } else {
      toast.error('Keep trying!');
    }

    setTimeout(() => {
      advanceQuestion(isCorrect);
    }, 1000);
  };

  // Helper to dynamically load Lucide icons to prevent bundler problems
  const getIcon = (iconName?: string) => {
    if (!iconName) return HelpCircle;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || HelpCircle;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCorrectBinary = (ans: 'yes' | 'no') => {
    return currentQuestion.correctAnswer === ans;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
            </button>
            <div>
              <h3>Phoneme Pop</h3>
              <p className="text-sm text-muted-foreground">Level {levelData.level}</p>
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
      <div className="bg-secondary h-2 w-full">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
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
            {/* Play Sound Button */}
            <button
              onClick={playSound}
              className={`mb-12 w-32 h-32 rounded-full text-white shadow-2xl transition-all duration-300 flex items-center justify-center ${
                isPlaying 
                  ? 'bg-primary/80 scale-105 animate-pulse' 
                  : 'bg-primary hover:scale-110 active:scale-95'
              }`}
            >
              <Volume2 className="w-12 h-12 animate-in zoom-in" />
            </button>

            {/* Instruction Title */}
            <h2 className="mb-4 text-3xl font-bold text-center max-w-2xl">
              {levelData.instruction}
            </h2>

            <p className="text-muted-foreground mb-12">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>

            {/* Conditionally Render Yes/No vs Option Grid */}
            {levelData.type === 'binary' ? (
              <div className="flex flex-col items-center w-full max-w-md">
                {currentQuestion.word && (
                  <div className="mb-8 p-6 rounded-[2rem] bg-card border border-border text-center shadow-md min-w-[200px]">
                    <h1 className="text-4xl font-extrabold tracking-wide uppercase">
                      {currentQuestion.word}
                    </h1>
                  </div>
                )}

                <div className="flex gap-6 w-full justify-center">
                  <button
                    onClick={() => handleBinaryAnswer('yes')}
                    disabled={selectedAnswer !== null}
                    className={`flex-1 h-32 rounded-[2rem] border-2 text-2xl font-bold transition-all duration-300 flex items-center justify-center ${
                      selectedAnswer === null
                        ? 'border-border bg-card hover:border-green-500 hover:bg-green-500/10 hover:scale-105 active:scale-95'
                        : selectedAnswer === 'yes'
                          ? isCorrectBinary('yes')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400'
                          : isCorrectBinary('yes')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-border bg-card opacity-50'
                    }`}
                  >
                    YES
                  </button>
                  <button
                    onClick={() => handleBinaryAnswer('no')}
                    disabled={selectedAnswer !== null}
                    className={`flex-1 h-32 rounded-[2rem] border-2 text-2xl font-bold transition-all duration-300 flex items-center justify-center ${
                      selectedAnswer === null
                        ? 'border-border bg-card hover:border-red-500 hover:bg-red-500/10 hover:scale-105 active:scale-95'
                        : selectedAnswer === 'no'
                          ? isCorrectBinary('no')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400'
                          : isCorrectBinary('no')
                            ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'border-border bg-card opacity-50'
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

                  let cardStyles = 'border-border bg-card hover:shadow-xl hover:scale-105 active:scale-95';
                  if (selectedAnswer !== null) {
                    if (isSelected) {
                      cardStyles = option.isCorrect
                        ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                        : 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400';
                    } else {
                      cardStyles = option.isCorrect
                        ? 'border-green-500 bg-green-500/15 text-green-600 dark:text-green-400'
                        : 'border-border bg-card opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleMultipleChoiceAnswer(idx, option.isCorrect)}
                      disabled={selectedAnswer !== null}
                      className={`p-8 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center ${cardStyles}`}
                    >
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                        selectedAnswer !== null && option.isCorrect
                          ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                          : 'bg-primary/10 text-primary'
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
