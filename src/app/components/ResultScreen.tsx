import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Trophy, Target, Clock, RotateCcw, ArrowRight, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';
import { useGameSession } from '../context/GameSessionContext';

export default function ResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveGameResult } = useGameSession();

  const state = location.state || {};
  const score = typeof state.score === 'number' ? state.score : 0;
  const totalQuestions = typeof state.totalQuestions === 'number'
    ? state.totalQuestions
    : (typeof state.total === 'number' ? state.total : 10);

  const timeTaken = typeof state.timeTaken === 'string' ? state.timeTaken : '00:00';
  const gameId = typeof state.gameId === 'string' ? state.gameId : 'phoneme-pop';
  const level = typeof state.level === 'number' ? state.level : 1;
  const progressorId = typeof state.progressorId === 'string' ? state.progressorId : 'demo';

  const accuracy = Math.round((score / totalQuestions) * 100);
  const missedWords = Array.isArray(state.missedWords) ? state.missedWords : [];

  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  const gameNames: Record<string, string> = {
    'phoneme-pop': 'Phoneme Pop',
    'position-pilot': 'Position Pilot',
    'sound-trail': 'Sound Trail',
    'sound-synk': 'Sound Synk',
    'sound-sorter': 'Sound Sorter',
  };
  const gameName = gameNames[gameId] || gameId.replace(/-/g, ' ');

  let title = '';
  let subtitle = '';
  let IconComponent = Trophy;
  let iconColorClass = '';

  if (accuracy >= 60) {
    title = `Completed ${gameName} - Level ${level}`;
    subtitle = 'Excellent job on completing this level!';
    IconComponent = Trophy;
    iconColorClass = 'text-[#FF6347]';
  } else {
    title = 'Keep Practicing';
    subtitle = "Let's try that one more time.";
    IconComponent = Target;
    iconColorClass = 'text-gray-400';
  }

  // Save game result to Supabase exactly once on mount
  useEffect(() => {
    saveGameResult(gameId, level, score, accuracy, timeTaken);
  }, []);

  // Show celebratory toasts on mount if completed Level 10
  useEffect(() => {
    let modalTimeout: any = null;
    if (level === 10 && accuracy >= 60) {
      toast.success(`Grand Voyage Completed! 🎖️`, {
        description: `You completed Level 10 of ${gameName} with flying colors!`,
        duration: 5000,
      });
      setTimeout(() => {
        toast(`Master Navigator Badge Unlocked 🏆`, {
          description: `${gameName} has been fully conquered!`,
          duration: 6000,
        });
      }, 1000);
      
      // Show the celebration modal overlay after a small delay
      modalTimeout = setTimeout(() => {
        setShowCelebrationModal(true);
      }, 500);
    }
    return () => {
      if (modalTimeout) {
        clearTimeout(modalTimeout);
      }
    };
  }, [level, accuracy, gameName]);

  // Trigger confetti if they pass
  useEffect(() => {
    if (accuracy < 60) return;

    // Standard celebration for normal levels (3 seconds), epic celebration for level 10 (6 seconds)
    const duration = level === 10 ? 6000 : 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: level === 10 ? 45 : 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = (level === 10 ? 100 : 50) * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FF6347', '#FFD700', '#4169E1', '#32CD32'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FF6347', '#FFD700', '#4169E1', '#32CD32'],
      });

      // Add a center burst for Level 10
      if (level === 10) {
        confetti({
          ...defaults,
          particleCount: particleCount * 0.5,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#FFD700', '#FFA500', '#FF4500'],
        });
      }
    }, 250);

    return () => clearInterval(interval);
  }, [accuracy, level]);

  const handleContinue = () => {
    navigate(`/progressor/${progressorId}`, {
      state: { selectedGame: gameId }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,99,71,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,99,71,0.15),transparent_50%)]" />

      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 max-w-2xl w-full animate-in fade-in zoom-in duration-500">
        <div className="bg-card border border-border rounded-[2rem] shadow-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-background border border-border mb-8 shadow-2xl animate-in zoom-in duration-700">
            <IconComponent className={`w-16 h-16 ${iconColorClass}`} />
          </div>

          <h1 className="mb-4 text-foreground text-3xl font-bold">{title}</h1>
          <p className="mb-12 opacity-80 text-foreground" style={{ fontSize: '1.25rem' }}>
            {subtitle}
          </p>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-[1.5rem] bg-background border border-border animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-[#FF6347]" />
              </div>
              <p className="text-3xl mb-1 text-foreground font-extrabold">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>

            <div className="p-6 rounded-[1.5rem] bg-background border border-border animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-[#FF6347]" />
              </div>
              <p className="text-3xl mb-1 text-foreground font-extrabold">
                {score}/{totalQuestions}
              </p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>

            <div className="p-6 rounded-[1.5rem] bg-background border border-border animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-[#FF6347]" />
              </div>
              <p className="text-3xl mb-1 text-foreground font-extrabold">{timeTaken}</p>
              <p className="text-sm text-muted-foreground">Time Taken</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                if (accuracy >= 60) {
                  navigate(`/progressor/${progressorId}`, {
                    state: { selectedGame: gameId }
                  });
                } else {
                  navigate(`/game/${gameId}/${level}`, {
                    state: { missedWords }
                  });
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-[2rem] border border-border bg-background hover:bg-secondary hover:scale-105 active:scale-95 transition-all duration-300 text-foreground font-bold"
            >
              <RotateCcw className="w-5 h-5 text-[#FF6347]" />
              Try Again
            </button>

            {accuracy >= 60 && (
              <button
                onClick={handleContinue}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-[2rem] bg-[#FF6347] hover:bg-[#FF6347]/90 hover:scale-105 active:scale-95 transition-all duration-300 text-white font-bold"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {accuracy >= 60 && (
          <div className="mt-6 flex items-center justify-center gap-2 text-[#FF6347] animate-pulse">
            <Star className="w-5 h-5 fill-[#FF6347]" />
            <p className="font-semibold">Level Completed!</p>
            <Star className="w-5 h-5 fill-[#FF6347]" />
          </div>
        )}
      </div>

      {/* Celebratory Level 10 Completion Overlay Modal */}
      {showCelebrationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-card border-2 border-yellow-500/50 rounded-[2.5rem] max-w-md w-full p-8 text-center shadow-[0_0_50px_rgba(234,179,8,0.3)] relative overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Decorative gold background highlights */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-br-full pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-500/20 to-transparent rounded-bl-full pointer-events-none" />

            {/* Gold stars scattered subtly */}
            <Star className="w-6 h-6 absolute top-8 left-12 text-yellow-500/30 animate-pulse pointer-events-none" />
            <Star className="w-8 h-8 absolute bottom-20 right-8 text-yellow-500/20 animate-bounce pointer-events-none" />

            {/* Animated Gold Trophy Container */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-6 relative group">
              <div className="absolute inset-0 rounded-full bg-yellow-500/5 animate-ping duration-1000" />
              <Trophy className="w-12 h-12 text-yellow-500 animate-bounce duration-1000" />
            </div>

            <h1 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight">
              Voyage Complete! 🏆
            </h1>
            <p className="text-yellow-500 font-bold uppercase tracking-wider text-sm mb-4">
              {gameName} Champion
            </p>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Amazing job! You have successfully mastered all 10 levels of <strong>{gameName}</strong>. You've earned the title of Master Navigator!
            </p>

            {/* Stats Summary Inside Modal */}
            <div className="bg-muted/50 rounded-2xl p-4 mb-6 border border-border flex justify-around text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Final Score</p>
                <p className="text-lg font-bold text-foreground">{score}/{totalQuestions}</p>
              </div>
              <div className="border-r border-border h-8 my-auto" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Accuracy</p>
                <p className="text-lg font-bold text-green-500">{accuracy}%</p>
              </div>
              <div className="border-r border-border h-8 my-auto" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Time</p>
                <p className="text-lg font-bold text-foreground">{timeTaken}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCelebrationModal(false);
                handleContinue();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold shadow-lg hover:shadow-yellow-500/20 hover:scale-102 active:scale-98 transition-all duration-300"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
