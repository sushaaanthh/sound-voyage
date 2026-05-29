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

export default function ExplorerDashboard() {
  const { explorerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { progress, setExplorer } = useGameSession();

  const [selectedGame, setSelectedGame] = useState<string | null>(() => {
    return location.state?.selectedGame || null;
  });

  const [assignedLevels] = useState([1, 2, 3]);

  // Set the active explorer in context
  useEffect(() => {
    if (explorerId) {
      setExplorer(explorerId);
    }
  }, [explorerId, setExplorer]);

  // Pre-select game if returning from result screen
  useEffect(() => {
    if (location.state?.selectedGame) {
      setSelectedGame(location.state.selectedGame);
    }
  }, [location.state]);

  const handleLevelClick = (gameId: string, level: number) => {
    navigate(`/game/${gameId}/${level}`);
  };

  const isLevelUnlocked = (gameId: string, levelNum: number) => {
    if (levelNum > 3) return false;
    if (levelNum === 1) return true;

    const completed = progress?.completedLevels[gameId] || [];
    return completed.includes(levelNum - 1);
  };

  return (
    <div className="min-h-screen bg-[#12110D] text-white">
      {/* Header */}
      <div className="bg-[#1D1C16] border-b border-[#2C2B24] px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-white">Ready for your Voyage?</h1>
            <p className="text-muted-foreground">Choose a game to start playing</p>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 rounded-[1.5rem] bg-[#2C2B24] hover:bg-[#3E3C33] hover:scale-105 active:scale-95 transition-all border border-[#3E3C33]"
            >
              <Home className="w-5 h-5 text-white" />
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
                  className="group bg-[#1D1C16] rounded-[2rem] border border-[#2C2B24] p-8 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 text-left overflow-hidden relative animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-[#FF6347]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-[#FF6347]" />
                    </div>
                    <h2 className="mb-2 text-white">{game.name}</h2>
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
              className="mb-8 px-6 py-3 rounded-[1.5rem] bg-[#2C2B24] hover:bg-[#3E3C33] hover:scale-105 active:scale-95 transition-all duration-300 border border-[#3E3C33]"
            >
              Back to Games
            </button>

            <div className="bg-[#1D1C16] rounded-[2rem] border border-[#2C2B24] p-8">
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
                        <h1 className="mb-2 text-white">{game?.name}</h1>
                        <p className="text-muted-foreground">{game?.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <h3 className="mb-6 text-white">Select a Level</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                  const isAssigned = assignedLevels.includes(level);
                  const isUnlocked = isLevelUnlocked(selectedGame, level);
                  const completed = progress?.completedLevels[selectedGame] || [];
                  const isCompleted = completed.includes(level);

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
                          : 'bg-[#2C2B24] border-[#3E3C33] text-muted-foreground cursor-not-allowed opacity-50'
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
                  Tip: Levels with a ring around them are assigned by your psychologist!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
