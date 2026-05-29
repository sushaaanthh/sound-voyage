import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Trophy, ThumbsUp, Target, Clock, RotateCcw, ArrowRight, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeToggle } from './ThemeToggle';
import { useGameSession } from '../context/GameSessionContext';

export default function ResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  const { progress, completeLevel } = useGameSession();

  const state = location.state || {};
  const score = typeof state.score === 'number' ? state.score : 0;
  const totalQuestions = typeof state.totalQuestions === 'number'
    ? state.totalQuestions
    : (typeof state.total === 'number' ? state.total : 10);

  const timeTaken = typeof state.timeTaken === 'string' ? state.timeTaken : '00:00';
  const gameId = typeof state.gameId === 'string' ? state.gameId : 'phoneme-pop';
  const level = typeof state.level === 'number' ? state.level : 1;

  const accuracy = Math.round((score / totalQuestions) * 100);
  const explorerId = progress?.explorerId || 'demo';

  let title = '';
  let subtitle = '';
  let IconComponent = Trophy;
  let iconColorClass = '';

  if (accuracy >= 80) {
    title = 'Outstanding!';
    subtitle = 'Excellent phoneme recognition.';
    IconComponent = Trophy;
    iconColorClass = 'text-[#FF6347]';
  } else if (accuracy >= 60) {
    title = 'Good Effort!';
    subtitle = 'You are making great progress.';
    IconComponent = ThumbsUp;
    iconColorClass = 'text-[#FF6347]';
  } else {
    title = 'Keep Practicing';
    subtitle = "Let's try that one more time.";
    IconComponent = Target;
    iconColorClass = 'text-gray-400';
  }

  // Record completion to Game Session Context on mount if accuracy meets threshold
  useEffect(() => {
    if (accuracy >= 60) {
      completeLevel(gameId, level, score, accuracy, timeTaken);
    }
  }, [accuracy, gameId, level, score, timeTaken, completeLevel]);

  useEffect(() => {
    if (accuracy < 60) return;

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

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
    }, 250);

    return () => clearInterval(interval);
  }, [accuracy]);

  const handleContinue = () => {
    navigate(`/explorer/${explorerId}`, {
      state: {
        selectedGame: gameId,
        completedLevel: level,
        passed: true
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#1D1C16] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,99,71,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,99,71,0.15),transparent_50%)]" />

      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 max-w-2xl w-full animate-in fade-in zoom-in duration-500">
        <div className="bg-[#2C2B24] border border-[#3E3C33] rounded-[2rem] shadow-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#1D1C16] border border-[#3E3C33] mb-8 shadow-2xl animate-in zoom-in duration-700">
            <IconComponent className={`w-16 h-16 ${iconColorClass}`} />
          </div>

          <h1 className="mb-4 text-white">{title}</h1>
          <p className="mb-12 opacity-80 text-white" style={{ fontSize: '1.25rem' }}>
            {subtitle}
          </p>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-[1.5rem] bg-[#1D1C16] border border-[#3E3C33] animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-[#FF6347]" />
              </div>
              <p className="text-3xl mb-1 text-white">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>

            <div className="p-6 rounded-[1.5rem] bg-[#1D1C16] border border-[#3E3C33] animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-[#FF6347]" />
              </div>
              <p className="text-3xl mb-1 text-white">
                {score}/{totalQuestions}
              </p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>

            <div className="p-6 rounded-[1.5rem] bg-[#1D1C16] border border-[#3E3C33] animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-[#FF6347]" />
              </div>
              <p className="text-3xl mb-1 text-white">{timeTaken}</p>
              <p className="text-sm text-muted-foreground">Time Taken</p>
            </div>
          </div>

          {/* Conditional Completed Level Header */}
          {accuracy >= 60 && (
            <div className="mb-12 p-6 rounded-[1.5rem] bg-gradient-to-r from-[#FF6347]/5 to-[#FF6347]/10 border border-[#FF6347]/20">
              <p className="text-muted-foreground mb-1">Completed</p>
              <h3 className="capitalize text-white">{gameId.replace(/-/g, ' ')} - Level {level}</h3>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/game/${gameId}/${level}`)}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-[2rem] border border-[#3E3C33] bg-[#1D1C16] hover:bg-[#2C2B24] hover:scale-105 active:scale-95 transition-all duration-300 text-white"
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

        {accuracy >= 80 && (
          <div className="mt-6 flex items-center justify-center gap-2 text-[#FF6347] animate-pulse">
            <Star className="w-5 h-5 fill-[#FF6347]" />
            <p>You unlocked the next level!</p>
            <Star className="w-5 h-5 fill-[#FF6347]" />
          </div>
        )}
      </div>
    </div>
  );
}
