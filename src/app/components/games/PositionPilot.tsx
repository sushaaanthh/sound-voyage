import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { Home, Volume2, Music, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '../ThemeToggle';
import { PhonemeText } from '../PhonemeText';
import { AudioWaveMask } from '../AudioWaveMask';
import QuitGameModal from '../ui/QuitGameModal';
import { FeedbackModal } from '../ui/FeedbackModal';
import { useGameSession } from '../../context/GameSessionContext';
import { positionPilotData, PositionPilotQuestion } from '../../../data/positionPilotData';
import { getOptionIcon } from '../OptionIconMapper';
import { playAudio } from '../../../lib/audioUtils';
import { submitGameSession } from '../../../lib/telemetryUtils';

const CHOICES = [
  { label: 'BEGINNING', value: 'START' },
  { label: 'MIDDLE', value: 'MIDDLE' },
  { label: 'END', value: 'END' }
] as const;

export default function PositionPilot() {
  const navigate = useNavigate();
  const { level } = useParams();
  const location = useLocation();
  const { progressorId } = useGameSession();

  const levelStr = level || '1';
  const levelNum = Number(levelStr);

  const [questions, setQuestions] = useState<PositionPilotQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Transition lock and clinical tracking states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<'START' | 'MIDDLE' | 'END' | null>(null);
  const [isQuestionRevealed, setIsQuestionRevealed] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    setIsQuestionRevealed(false);
    setFeedbackStatus(null);
  }, [currentQuestionIndex, levelNum]);

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);
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
    setMissedWords([]);
    setIsTransitioning(false);

    // Retrieve previous missed words from Try Again action state
    const prevMissed = location.state?.missedWords || [];

    const levelConfig = positionPilotData.find(l => l.level === levelNum) || positionPilotData[0];
    const pool = levelConfig.questions;

    // Helper to evaluate if a question was previously missed
    const isMissed = (q: PositionPilotQuestion) => {
      return prevMissed.includes(q.word);
    };

    const missedPool = pool.filter(isMissed);
    const remainingPool = pool.filter(q => !isMissed(q));

    // Fisher-Yates Shuffle algorithm
    const shuffle = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const shuffledMissed = shuffle(missedPool);
    const shuffledRemaining = shuffle(remainingPool);

    // Prioritize missed ones first, then fill remaining slots up to 10
    const combined = [...shuffledMissed, ...shuffledRemaining].slice(0, 10);

    // Final shuffle so missed questions are interspersed randomly
    setQuestions(shuffle(combined));
  }, [levelNum, location.state]);

  // Tick the local UI timer display
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Native Text-to-Speech engine supporting en-IN
  const playIndianAudio = (text: string) => {
    playAudio(text, {
      onStart: () => {
        setIsPlaying(true);
      },
      onEnd: () => {
        setIsPlaying(false);
      },
      onError: () => {
        setIsPlaying(false);
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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading Voyage...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercent = (currentQuestionIndex / totalQuestions) * 100;

  const playSound = () => {
    if (!currentQuestion || isTransitioning) return;
    playIndianAudio(currentQuestion.word);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const advanceQuestion = async (nextScore: number) => {
    setFeedbackStatus(null);
    setSelectedAnswer(null);
    setIsTransitioning(false);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const formattedTime = formatTime(elapsedSeconds);
      const accuracy = totalQuestions > 0 ? Math.round((nextScore / totalQuestions) * 100) : 0;
      const activeId = progressorId || 'demo';

      // 1. Submit telemetry to database FIRST using locally calculated variables
      await submitGameSession({
        progressorId: activeId,
        gameId: 'position-pilot',
        level: levelNum,
        score: nextScore,
        totalQuestions,
        accuracy,
        timeTaken: formattedTime
      });

      // Navigate to /result with final payload including missedWords
      navigate('/result', {
        state: {
          score: nextScore,
          totalQuestions,
          total: totalQuestions,
          timeTaken: formattedTime,
          timeElapsed: elapsedSeconds,
          gameId: 'position-pilot',
          level: levelNum,
          progressorId: activeId,
          missedWords
        }
      });
    }
  };

  const handleChoiceSelect = (value: 'START' | 'MIDDLE' | 'END') => {
    if (isLocked) return;

    setSelectedAnswer(value);
    setIsTransitioning(true);

    const isCorrect = currentQuestion.position === value;
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
      setFeedbackStatus('correct');
    } else {
      setMissedWords((prev) => [...prev, currentQuestion.word]);
      setFeedbackStatus('wrong');
    }

    setTimeout(() => {
      setFeedbackStatus(null);
      advanceQuestion(nextScore);
    }, 2500);
  };

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
              <h3 className="font-bold text-foreground">Position Pilot</h3>
              <p className="text-sm text-muted-foreground">Level {levelStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-sans">Time</p>
              <p className="font-medium tabular-nums">{formatTime(timeElapsed)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-sans">Score</p>
              <p className="font-medium">{score}/{totalQuestions}</p>
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
      <div className="flex-1 max-w-5xl w-full mx-auto px-8 py-12 flex flex-col items-center justify-center">
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
            <div className="relative flex items-center justify-center w-full min-h-[6rem] max-w-4xl mx-auto px-4 mt-4 mb-4">
              {/* Text Container: Add w-full and inset-0 so it doesn't collapse */}
              <div
                className={`absolute inset-0 flex items-center justify-center w-full transition-opacity duration-500 ease-in-out ${
                  isQuestionRevealed ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-center font-poppins text-foreground leading-relaxed px-12">
                  Where do you hear the <PhonemeText phoneme={`/${currentQuestion.targetSound}/`} /> sound in the word <span className="text-primary font-extrabold ml-1">{currentQuestion.word.toUpperCase()}</span>?
                </h2>
              </div>

              {/* Soundwave Container: Same layout fix */}
              <div
                className={`absolute inset-0 flex items-center justify-center w-full transition-opacity duration-500 ease-in-out ${
                  !isQuestionRevealed ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <AudioWaveMask variant="main" onClick={() => playIndianAudio(`Where do you hear the /${currentQuestion.targetSound}/ sound in the word ${currentQuestion.word}?`)} />
              </div>

              {/* Unified Toggle Button */}
              <button
                onClick={() => {
                  const nextState = !isQuestionRevealed;
                  setIsQuestionRevealed(nextState);
                  if (!nextState) {
                    playIndianAudio(`Where do you hear the /${currentQuestion.targetSound}/ sound in the word ${currentQuestion.word}?`);
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-secondary transition-colors z-20 cursor-pointer"
                aria-label="Toggle Question View"
              >
                {isQuestionRevealed ? (
                  <Volume2 className="w-7 h-7 text-primary hover:scale-110 transition-transform" />
                ) : (
                  <Eye className="w-7 h-7 text-muted-foreground hover:text-primary hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
            <div className="flex flex-col items-center mb-10 w-full">
              <button
                onClick={playSound}
                disabled={isTransitioning || isPlaying}
                className={`px-12 py-6 rounded-[2rem] border-2 bg-primary/10 border-primary/20 hover:border-primary/40 hover:bg-primary/15 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-6 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[6rem] min-w-[16rem]`}
              >
                <div className="relative flex items-center justify-center w-full min-w-[12rem] min-h-[3.5rem]">
                  <div
                    className={`absolute inset-0 flex items-center justify-center w-full transition-opacity duration-500 ease-in-out ${
                      isQuestionRevealed ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide uppercase text-foreground font-poppins text-center">
                      {currentQuestion.word}
                    </h1>
                  </div>
                  <div
                    className={`absolute inset-0 flex items-center justify-center w-full transition-opacity duration-500 ease-in-out ${
                      !isQuestionRevealed ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <AudioWaveMask variant="option" />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white dark:bg-muted shadow-md flex items-center justify-center text-primary transition-transform duration-300 shrink-0">
                  <Music className="w-5 h-5" />
                </div>
              </button>
              <p className="text-muted-foreground mt-4 text-sm font-sans tracking-wide text-center">
                Listen carefully and choose your answer.
              </p>
            </div>

            <p className="text-muted-foreground mt-6 text-sm">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>

            {/* Choice buttons */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 w-full max-w-3xl mt-10">
              {CHOICES.map((choice) => {
                const isSelected = selectedAnswer === choice.value;
                const isCorrect = choice.value === currentQuestion.position;

                let buttonStyle = 'border-border bg-card text-foreground hover:border-[#FF6347]/50 hover:bg-[#FF6347]/5 hover:scale-105 active:scale-95';

                if (selectedAnswer !== null) {
                  if (isSelected) {
                    buttonStyle = isCorrect
                      ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 font-bold scale-102'
                      : 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold scale-98';
                  } else if (isCorrect) {
                    buttonStyle = 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 font-bold';
                  } else {
                    buttonStyle = 'border-border bg-card opacity-40 text-foreground cursor-not-allowed';
                  }
                }

                return (
                  <button
                    key={choice.value}
                    onClick={() => handleChoiceSelect(choice.value)}
                    disabled={isLocked}
                    className={`py-8 rounded-[2rem] border-2 text-base md:text-xl font-extrabold transition-all duration-300 flex items-center justify-center gap-3 shadow-md disabled:cursor-not-allowed ${buttonStyle}`}
                  >
                    {getOptionIcon(choice.label)}
                    <span>{choice.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer message / spacing */}
      <div className="pb-8 text-center text-xs text-muted-foreground font-sans">
        Sound Voyage Clinical Suite • Position Pilot
      </div>
      <QuitGameModal
        isOpen={showQuitModal}
        onClose={() => setShowQuitModal(false)}
        onConfirm={() => navigate(-1)}
      />
      <FeedbackModal status={feedbackStatus} />
    </div>
  );
}
