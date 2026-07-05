import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Home, Volume2, Check, X, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ThemeToggle } from '../ThemeToggle';
import QuitGameModal from '../ui/QuitGameModal';
import { useGameSession } from '../../context/GameSessionContext';
import { soundSyncData } from '../../../data/soundSyncData';
import { getOptionIcon } from '../OptionIconMapper';
import { playAudio } from '../../../lib/audioUtils';
import { submitGameSession } from '../../../lib/telemetryUtils';

interface Card {
  id: number;
  word: string;
  pairIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function SoundSync() {
  const navigate = useNavigate();
  const { gameId, level } = useParams();
  const { progressorId } = useGameSession();

  const levelStr = level || '1';
  const levelNum = Number(levelStr);
  const activeGameId = gameId || 'sound-synk';

  // Find level configuration
  const levelConfig =
    soundSyncData.find((l) => l.level === levelNum) || soundSyncData[0];

  // Game states
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]); // stores card IDs (indices)
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [missedWords, setMissedWords] = useState<string[]>([]);

  // Timer Ref
  const startTimeRef = useRef<number>(Date.now());

  // Fisher-Yates Shuffle
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Speaks text
  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      playAudio(text, {
        onStart: () => {},
        onEnd: () => {
          resolve();
        },
        onError: () => {
          resolve();
        }
      });
    });
  };

  // Initialize the game grid
  const initializeGame = () => {
    startTimeRef.current = Date.now();
    setTimeElapsed(0);
    setSelectedCards([]);
    setMissedWords([]);
    setIsTransitioning(false);

    // Grab the pool of pairs
    const pool = levelConfig.wordPool;

    // Shuffle and slice the requested number of pairs
    const shuffledPool = shuffle(pool);
    const selectedPairs = shuffledPool.slice(0, levelConfig.pairCount);

    // Create cards
    const newCards: Card[] = [];
    selectedPairs.forEach((pair, pairIdx) => {
      newCards.push({
        id: pairIdx * 2,
        word: pair.word1,
        pairIndex: pairIdx,
        isFlipped: false,
        isMatched: false
      });
      newCards.push({
        id: pairIdx * 2 + 1,
        word: pair.word2,
        pairIndex: pairIdx,
        isFlipped: false,
        isMatched: false
      });
    });

    setCards(shuffle(newCards));

    // Play welcome instruction
    speakText(levelConfig.instruction);
  };

  // Load level on mount or level change
  useEffect(() => {
    initializeGame();
  }, [levelStr]);

  // Tick timer
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCardClick = async (cardIndex: number) => {
    if (isTransitioning) return;

    const clickedCard = cards[cardIndex];
    if (clickedCard.isFlipped || clickedCard.isMatched) {
      // If already face-up, just speak the word again
      speakText(clickedCard.word);
      return;
    }

    // Speak word on flip
    speakText(clickedCard.word);

    // Flip the clicked card
    const updatedCards = [...cards];
    updatedCards[cardIndex].isFlipped = true;
    setCards(updatedCards);

    const nextSelected = [...selectedCards, cardIndex];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setIsTransitioning(true);

      const [firstIdx, secondIdx] = nextSelected;
      const card1 = cards[firstIdx];
      const card2 = cards[secondIdx];

      if (card1.pairIndex === card2.pairIndex) {
        // MATCH!
        setTimeout(() => {
          const finalCards = [...cards];
          finalCards[firstIdx].isMatched = true;
          finalCards[secondIdx].isMatched = true;
          setCards(finalCards);
          setSelectedCards([]);
          setIsTransitioning(false);

          toast.success('Found a match!', {
            icon: <Check className="w-8 h-8 md:w-10 md:h-10 text-green-700 shrink-0" />,
            className:
              'bg-green-100 text-green-700 border-2 border-green-200 rounded-2xl px-8 py-4 text-2xl md:text-3xl font-bold shadow-xl flex items-center justify-center gap-4',
            duration: 2500
          });

          // Check if game complete
          const allMatched = finalCards.every((c) => c.isMatched);
          if (allMatched) {
            setTimeout(() => {
              handleLevelComplete();
            }, 2500);
          }
        }, 500);
      } else {
        // NO MATCH!
        // Record missed words for clinical analysis
        setMissedWords((prev) => {
          const arr = [...prev];
          if (!arr.includes(card1.word)) arr.push(card1.word);
          if (!arr.includes(card2.word)) arr.push(card2.word);
          return arr;
        });

        setTimeout(() => {
          const finalCards = [...cards];
          finalCards[firstIdx].isFlipped = false;
          finalCards[secondIdx].isFlipped = false;
          setCards(finalCards);
          setSelectedCards([]);
          setIsTransitioning(false);

          toast.error('Not a match, try again!', {
            icon: <X className="w-8 h-8 md:w-10 md:h-10 text-red-700 shrink-0" />,
            className:
              'bg-red-100 text-red-700 border-2 border-red-200 rounded-2xl px-8 py-4 text-2xl md:text-3xl font-bold shadow-xl flex items-center justify-center gap-4',
            duration: 2500
          });
        }, 2500);
      }
    }
  };

  const handleLevelComplete = async () => {
    const totalPairs = levelConfig.pairCount;
    // For memory matching, task completion is the primary success criterion.
    // We award 100% accuracy and full score upon board completion, focusing evaluation on Time Taken.
    const accuracy = 100;
    const score = totalPairs;

    const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const formattedTime = `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;

    const activeId = progressorId || 'demo';

    // 1. Submit telemetry to database FIRST using locally calculated variables
    await submitGameSession({
      progressorId: activeId,
      gameId: activeGameId,
      level: levelNum,
      score: score,
      totalQuestions: totalPairs,
      accuracy: accuracy,
      timeTaken: formattedTime
    });

    // 3. Navigate to result screen
    navigate('/result', {
      state: {
        score,
        totalQuestions: totalPairs,
        total: totalPairs,
        timeTaken: formattedTime,
        timeElapsed: elapsedSeconds,
        gameId: activeGameId,
        level: levelNum,
        progressorId: activeId,
        missedWords
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const matchedCount = cards.filter((c) => c.isMatched).length;
  const totalCards = cards.length;
  const progressPercent = totalCards > 0 ? (matchedCount / totalCards) * 100 : 0;

  // Resolve grid cols class
  const getGridColsClass = () => {
    if (totalCards <= 16) return 'grid-cols-4';
    if (totalCards <= 20) return 'grid-cols-4 sm:grid-cols-5';
    if (totalCards <= 24) return 'grid-cols-4 sm:grid-cols-6';
    if (totalCards <= 30) return 'grid-cols-5 sm:grid-cols-6';
    return 'grid-cols-6';
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
              <h3 className="font-bold text-foreground">Sound Sync</h3>
              <p className="text-sm text-muted-foreground">Level {levelStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-sans">Time</p>
              <p className="font-medium tabular-nums">{formatTime(timeElapsed)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-sans">Matches</p>
              <p className="font-medium">
                {matchedCount / 2}/{totalCards / 2}
              </p>
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
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col items-center justify-center">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6347] mb-4"></div>
            <p className="text-muted-foreground">Initializing memory voyage...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Instruction Banner */}
            <div className="mb-8 text-center max-w-2xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-extrabold font-poppins leading-tight">
                  {levelConfig.instruction}
                </h2>
                <button
                  onClick={() => speakText(levelConfig.instruction)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer"
                  aria-label="Speak instruction"
                >
                  <Volume2 className="w-6 h-6 text-muted-foreground hover:text-primary" />
                </button>
              </div>
              <p className="text-muted-foreground text-sm font-sans">
                {levelConfig.description}
              </p>
            </div>

            {/* Cards Grid */}
            <div className={`grid ${getGridColsClass()} gap-4 w-full max-w-4xl mb-6`}>
              {cards.map((card, idx) => {
                const isRevealed = card.isFlipped || card.isMatched;

                return (
                  <motion.button
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    disabled={isTransitioning}
                    className={`aspect-square rounded-[1.5rem] border-2 flex flex-col items-center justify-center p-2 relative shadow-md transition-all duration-300 ${
                      card.isMatched
                        ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 opacity-80 cursor-default'
                        : card.isFlipped
                        ? 'border-[#FF6347] bg-[#FF6347]/10 text-foreground scale-102 shadow-lg'
                        : 'border-border bg-card hover:border-[#FF6347]/50 hover:bg-[#FF6347]/5 hover:scale-105 active:scale-95 text-muted-foreground cursor-pointer'
                    }`}
                    whileHover={{ y: isRevealed ? 0 : -4 }}
                    whileTap={{ scale: isRevealed ? 1 : 0.95 }}
                  >
                    {isRevealed ? (
                      <div className="flex flex-col items-center justify-center w-full h-full text-center relative p-1">
                        {/* Dynamic Lucide Icon */}
                        <div className="text-primary mb-1.5 flex items-center justify-center">
                          {getOptionIcon(card.word)}
                        </div>
                        {/* Word Label */}
                        <h4 className="font-extrabold uppercase text-xs sm:text-sm md:text-base tracking-wide select-none leading-tight break-all">
                          {card.word}
                        </h4>
                        {/* Embedded Audio Playback Trigger */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(card.word);
                          }}
                          className="absolute bottom-1 right-1 p-1 rounded-full bg-background/50 hover:bg-background shadow-sm text-[#FF6347] transition-all cursor-pointer z-10"
                          title="Speak word"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-3xl font-black text-[#FF6347]/80">?</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Quick Restart Action */}
            <button
              onClick={initializeGame}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-[1.25rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 border border-border text-foreground text-sm font-semibold transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Cards
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pb-8 text-center text-xs text-muted-foreground font-sans">
        Sound Voyage Clinical Suite • Sound Sync Memory Matcher
      </div>
      <QuitGameModal
        isOpen={showQuitModal}
        onClose={() => setShowQuitModal(false)}
        onConfirm={() => navigate(-1)}
      />
    </div>
  );
}
