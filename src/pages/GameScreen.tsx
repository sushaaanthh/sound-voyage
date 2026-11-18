import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Home, Volume2, RotateCcw, Cat, Dog, Fish, Bird, CheckCircle, XCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { PhonemeText } from './PhonemeText';
import QuitGameModal from './ui/QuitGameModal';
import PhonemePop from './games/PhonemePop';
import PositionPilot from './games/PositionPilot';
import SoundTrail from './games/SoundTrail';
import SoundSync from './games/SoundSync';
import SoundSorter from './games/SoundSorter';
import gameData from '../../data/gameData.json';

interface Card {
  id: number;
  word: string;
  hasTargetSound?: boolean;
  isFlipped?: boolean;
  isMatched?: boolean;
}

export default function GameScreen() {
  const { gameId, level } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(10);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ show: boolean; correct: boolean } | null>(null);
  const [showQuitModal, setShowQuitModal] = useState(false);

  // Dynamic Routing & Load for Phoneme Pop clinical module
  const gameLevels = (gameData as any)[gameId || ''];
  const levelData = gameLevels ? gameLevels[level || ''] : null;

  if (gameId === 'phoneme-pop') {
    return (
      <PhonemePop
        levelData={levelData}
        onComplete={(finalScore, totalQ) => {
          navigate('/result', {
            state: {
              score: finalScore,
              total: totalQ,
              timeElapsed,
              gameId,
              level: Number(level),
            },
          });
        }}
      />
    );
  }

  if (gameId === 'position-pilot') {
    return <PositionPilot />;
  }

  if (gameId === 'sound-trail') {
    return <SoundTrail />;
  }

  if (gameId === 'sound-synk' || gameId === 'sound-sync') {
    return <SoundSync />;
  }

  if (gameId === 'sound-sorter') {
    return <SoundSorter />;
  }

  // Game-specific states
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [draggedItems, setDraggedItems] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (gameId === 'sound-synk') {
      initializeMemoryGame();
    } else if (gameId === 'sound-sorter') {
      initializeSorterGame();
    }
  }, [gameId]);

  const initializeMemoryGame = () => {
    const words = ['cat', 'bat', 'mat', 'hat', 'rat', 'sat', 'pat', 'fat'];
    const gameCards = words.flatMap((word, idx) => [
      { id: idx * 2, word, isFlipped: false, isMatched: false },
      { id: idx * 2 + 1, word, isFlipped: false, isMatched: false },
    ]);
    setCards(gameCards.sort(() => Math.random() - 0.5));
  };

  const initializeSorterGame = () => {
    setDraggedItems(['', '', '', '']);
  };

  const handleAnswer = (answerId: number, isCorrect: boolean) => {
    setSelectedAnswer(answerId);

    // Show feedback overlay
    setShowFeedback({ show: true, correct: isCorrect });

    if (isCorrect) {
      setScore(score + 1);
    }

    // Wait 2.5 seconds before proceeding
    setTimeout(() => {
      setShowFeedback(null);

      if (currentQuestion < totalQuestions) {
        setCurrentQuestion(currentQuestion + 1);
        setProgress((currentQuestion / totalQuestions) * 100);
        setSelectedAnswer(null);
      } else {
        navigate('/result', {
          state: {
            score: isCorrect ? score + 1 : score,
            total: totalQuestions,
            timeElapsed,
            gameId,
            level,
          },
        });
      }
    }, 2500);
  };

  const handleCardFlip = (cardId: number) => {
    if (selectedCards.length === 2) return;

    const newCards = cards.map((card) =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard?.word === secondCard?.word) {
        setTimeout(() => {
          setCards(
            cards.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          setSelectedCards([]);
          setScore(score + 1);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(
            cards.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const playSound = () => {
    alert('Playing audio: "Listen for the /k/ sound"');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowQuitModal(true)}
              className="p-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
            </button>
            <div>
              <h3 className="capitalize">{gameId?.replace(/-/g, ' ')}</h3>
              <p className="text-sm text-muted-foreground">Level {level}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Time</p>
              <p>{formatTime(timeElapsed)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p>{score}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {gameId !== 'sound-synk' && (
        <div className="bg-secondary h-2">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Game Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Phoneme Pop */}
        {gameId === 'phoneme-pop' && (
          <div className="text-center">
            <button
              onClick={playSound}
              className="mb-12 w-32 h-32 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 mx-auto flex items-center justify-center"
            >
              <Volume2 className="w-12 h-12" />
            </button>

            <h2 className="mb-4">Which word has the /k/ sound?</h2>
            <p className="text-muted-foreground mb-12">
              Question {currentQuestion} of {totalQuestions}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { id: 1, word: 'Cat', icon: Cat, correct: true },
                { id: 2, word: 'Dog', icon: Dog, correct: false },
                { id: 3, word: 'Fish', icon: Fish, correct: false },
                { id: 4, word: 'Bird', icon: Bird, correct: false },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id, option.correct)}
                    disabled={selectedAnswer !== null}
                    className={`p-8 rounded-[2rem] border-2 transition-all ${
                      selectedAnswer === option.id
                        ? option.correct
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-border bg-card hover:shadow-xl hover:scale-105 active:scale-95'
                    } ${selectedAnswer !== null ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-12 h-12 text-primary" />
                    </div>
                    <h3>{option.word}</h3>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Position Pilot */}
        {gameId === 'position-pilot' && (
          <div className="text-center">
            <button
              onClick={playSound}
              className="mb-12 w-32 h-32 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 mx-auto flex items-center justify-center"
            >
              <Volume2 className="w-12 h-12" />
            </button>

            <h2 className="mb-4">Where do you hear the /s/ sound in "sun"?</h2>
            <p className="text-muted-foreground mb-12">
              Question {currentQuestion} of {totalQuestions}
            </p>

            <div className="flex justify-center gap-8">
              {[
                { id: 1, position: 'Start', correct: true },
                { id: 2, position: 'Middle', correct: false },
                { id: 3, position: 'End', correct: false },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id, option.correct)}
                  disabled={selectedAnswer !== null}
                  className={`w-48 h-48 rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-center ${
                    selectedAnswer === option.id
                      ? option.correct
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-border bg-card hover:shadow-xl hover:scale-105 active:scale-95'
                  } ${selectedAnswer !== null ? 'cursor-not-allowed' : ''}`}
                >
                  <h2>{option.position}</h2>
                </button>
              ))}
            </div>
          </div>
        )}


        {/* Sound Synk */}
        {gameId === 'sound-synk' && (
          <div className="text-center">
            <h2 className="mb-4">Match the sound pairs!</h2>
            <p className="text-muted-foreground mb-12">Find all matching pairs</p>

            <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => !card.isMatched && !card.isFlipped && handleCardFlip(card.id)}
                  disabled={card.isMatched}
                  className={`aspect-square rounded-[1.5rem] transition-all duration-300 shadow-lg ${
                    card.isFlipped || card.isMatched
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border-2 border-border hover:scale-105 active:scale-95'
                  } ${card.isMatched ? 'opacity-50' : ''}`}
                >
                  {card.isFlipped || card.isMatched ? (
                    <span className="text-2xl">{card.word}</span>
                  ) : (
                    <span className="text-4xl">?</span>
                  )}
                </button>
              ))}
            </div>

            {cards.every((card) => card.isMatched) && (
              <div className="mt-12 animate-in fade-in zoom-in">
                <button
                  onClick={() =>
                    navigate('/result', {
                      state: {
                        score,
                        total: cards.length / 2,
                        timeElapsed,
                        gameId,
                        level,
                      },
                    })
                  }
                  className="px-12 py-5 rounded-[2rem] bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sound Sorter */}
        {gameId === 'sound-sorter' && (
          <div className="text-center">
            <button
              onClick={playSound}
              className="mb-12 w-32 h-32 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 mx-auto flex items-center justify-center"
            >
              <Volume2 className="w-12 h-12" />
            </button>

            <h2 className="mb-4">Arrange the phonemes to spell "CAT"</h2>
            <p className="text-muted-foreground mb-12">
              Question {currentQuestion} of {totalQuestions}
            </p>

            <div className="max-w-2xl mx-auto">
              {/* Drop zones */}
              <div className="flex justify-center gap-4 mb-12">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="w-32 h-32 rounded-[1.5rem] border-2 border-dashed border-border bg-card flex items-center justify-center"
                  >
                    {draggedItems[idx] ? (
                      <PhonemeText phoneme={draggedItems[idx]} className="text-3xl" />
                    ) : (
                      <span className="text-muted-foreground">Drop here</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Draggable items */}
              <div className="flex justify-center gap-4">
                {['/t/', '/c/', '/a/'].map((phoneme, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const emptyIdx = draggedItems.findIndex((item) => item === '');
                      if (emptyIdx !== -1) {
                        const newItems = [...draggedItems];
                        newItems[emptyIdx] = phoneme;
                        setDraggedItems(newItems);

                        if (newItems.every((item) => item !== '')) {
                          setTimeout(() => {
                            const isCorrect = newItems.join('') === '/c//a//t/';
                            handleAnswer(1, isCorrect);
                            setDraggedItems(['', '', '']);
                          }, 500);
                        }
                      }
                    }}
                    className="w-32 h-32 rounded-[1.5rem] bg-primary text-primary-foreground shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
                  >
                    <PhonemeText phoneme={phoneme} className="text-3xl" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setDraggedItems(['', '', ''])}
                className="mt-8 flex items-center gap-2 px-6 py-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300 mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Overlay */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
          <div
            className={`p-16 rounded-[3.5rem] shadow-2xl animate-in zoom-in ${
              showFeedback.correct
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            <div className="flex flex-col items-center gap-6">
              {showFeedback.correct ? (
                <>
                  <CheckCircle className="w-32 h-32" />
                  <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">Right Answer!</h1>
                </>
              ) : (
                <>
                  <XCircle className="w-32 h-32" />
                  <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">Oops, Wrong Answer!</h1>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <QuitGameModal
        isOpen={showQuitModal}
        onClose={() => setShowQuitModal(false)}
        onConfirm={() => navigate(-1)}
      />
    </div>
  );
}
