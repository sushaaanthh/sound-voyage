import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Home, Lock, Target, Map, Route, Shuffle, PackageSearch, LucideIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useGameSession } from '../context/GameSessionContext';

interface Game {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

const GAMES: Game[] = [
  {
    id: 'phoneme-pop',
    name: 'Phoneme Pop',
    icon: Target,
    description: 'Identify words with target sounds',
    color: 'from-red-400 to-pink-500',
  },
  {
    id: 'position-pilot',
    name: 'Position Pilot',
    icon: Map,
    description: 'Find where sounds appear in words',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'sound-trail',
    name: 'Sound Trail',
    icon: Route,
    description: 'Discover changed phoneme positions',
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: 'sound-synk',
    name: 'Sound Synk',
    icon: Shuffle,
    description: 'Match pairs of similar sounds',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'sound-sorter',
    name: 'Sound Sorter',
    icon: PackageSearch,
    description: 'Arrange phonemes in correct order',
    color: 'from-purple-400 to-violet-500',
  },
];

export default function ProgressorDashboard() {
  const { progressorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { completedLevels, setProgressor } = useGameSession();

  const [selectedGame, setSelectedGame] = useState<string | null>(() => {
    return location.state?.selectedGame || null;
  });

  const [assignedLevels] = useState([1, 2, 3]);

  // Set the active progressor in context
  useEffect(() => {
    if (progressorId) {
      setProgressor(progressorId);
    }
  }, [progressorId, setProgressor]);

  // Pre-select game if returning from result screen
  useEffect(() => {
    if (location.state?.selectedGame) {
      setSelectedGame(location.state.selectedGame);
    }
  }, [location.state]);

  const handleLevelClick = (gameId: string, level: number) => {
    navigate(`/game/${gameId}/${level}`);
  };

  const isLevelUnlocked = (levelNum: number) => {
    if (levelNum > 3) return false;
    if (levelNum === 1) return true;

    // Evaluate the completedLevels array.
    // If Level 1 is NOT passed, Level 2 and Level 3 must be locked.
    if (levelNum === 2) {
      return completedLevels.includes(1);
    }
    if (levelNum === 3) {
      return completedLevels.includes(1) && completedLevels.includes(2);
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-foreground">Ready for your Voyage?</h1>
            <p className="text-muted-foreground">Choose a game to start playing</p>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all border border-border text-foreground font-bold"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {GAMES.map((game, index) => {
              const Icon = game.icon;
              return (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className="group bg-card rounded-[2rem] border border-border p-8 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 text-left overflow-hidden relative animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-[#FF6347]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-[#FF6347]" />
                    </div>
                    <h2 className="mb-2 text-foreground">{game.name}</h2>
                    <p className="text-sm text-muted-foreground">{game.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedGame(null)}
              className="mb-8 px-6 py-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300 border border-border text-foreground"
            >
              Back to Games
            </button>

            <div className="bg-card rounded-[2rem] border border-border p-8">
              <div className="flex items-center gap-6 mb-8">
                {(() => {
                  const game = GAMES.find((g) => g.id === selectedGame);
                  const Icon = game?.icon;
                  return (
                    <>
                      <div className="w-24 h-24 rounded-3xl bg-[#FF6347]/10 flex items-center justify-center">
                        {Icon && <Icon className="w-16 h-16 text-[#FF6347]" />}
                      </div>
                      <div>
                        <h1 className="mb-2 text-foreground">{game?.name}</h1>
                        <p className="text-muted-foreground">{game?.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <h3 className="mb-6 text-foreground">Select a Level</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                  const isAssigned = assignedLevels.includes(level);
                  const isUnlocked = isLevelUnlocked(level);
                  const isCompleted = completedLevels.includes(level);

                  return (
                    <button
                      key={level}
                      onClick={() => isUnlocked && handleLevelClick(selectedGame, level)}
                      disabled={!isUnlocked}
                      className={`aspect-square rounded-[1.5rem] transition-all duration-300 shadow-lg relative flex flex-col items-center justify-center p-2 border ${
                        isUnlocked
                          ? isCompleted
                            ? 'bg-[#FF6347]/20 border-[#FF6347] text-white hover:scale-110'
                            : 'bg-[#FF6347] text-white hover:scale-110 hover:shadow-2xl active:scale-95 border-[#FF6347]'
                          : 'bg-secondary border-border text-muted-foreground cursor-not-allowed opacity-50'
                      } ${isAssigned && isUnlocked ? 'ring-4 ring-[#FF6347]/50' : ''}`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-2xl font-bold">{level}</span>
                        {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      {isCompleted && (
                        <span className="text-[10px] text-[#FF6347] font-semibold mt-1">Done</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 p-6 rounded-[1.5rem] bg-[#FF6347]/10 border border-[#FF6347]/20 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FF6347]" />
                <p className="text-sm text-[#FF6347]">
                  Tip: Levels with a ring around them are assigned by your practitioner!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
