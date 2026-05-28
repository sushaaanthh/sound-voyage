import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Bell, Home, Lock, Target, Map, Route, Shuffle, PackageSearch, LucideIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

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

export default function PatientDashboard() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [assignedLevels] = useState([1, 2, 3]);

  const handleLevelClick = (gameId: string, level: number) => {
    navigate(`/game/${gameId}/${level}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="mb-1">Hey {patientId}! Ready for your Voyage?</h1>
            <p className="text-muted-foreground">Choose a game to start playing</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-4 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full border-2 border-card" />
            </button>

            <ThemeToggle />

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-24 right-8 w-96 bg-card rounded-[2rem] shadow-2xl border border-border p-6 z-50">
          <h3 className="mb-4">Task Notifications</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-[1.5rem] bg-primary/10 border border-primary/20">
              <p className="text-sm">
                <span className="text-primary">New Assignment:</span> Phoneme Pop - Levels 1, 2, 3
              </p>
            </div>
            <div className="p-4 rounded-[1.5rem] bg-secondary">
              <p className="text-sm text-muted-foreground">No other notifications</p>
            </div>
          </div>
        </div>
      )}

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
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="mb-2">{game.name}</h2>
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
              className="mb-8 px-6 py-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300"
            >
              ← Back to Games
            </button>

            <div className="bg-card rounded-[2rem] border border-border p-8">
              <div className="flex items-center gap-6 mb-8">
                {(() => {
                  const game = GAMES.find((g) => g.id === selectedGame);
                  const Icon = game?.icon;
                  return (
                    <>
                      <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
                        {Icon && <Icon className="w-16 h-16 text-primary" />}
                      </div>
                      <div>
                        <h1 className="mb-2">{game?.name}</h1>
                        <p className="text-muted-foreground">{game?.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <h3 className="mb-6">Select a Level</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                  const isAssigned = assignedLevels.includes(level);
                  const isUnlocked = level <= 3;

                  return (
                    <button
                      key={level}
                      onClick={() => isUnlocked && handleLevelClick(selectedGame, level)}
                      disabled={!isUnlocked}
                      className={`aspect-square rounded-[1.5rem] transition-all duration-300 shadow-lg relative ${
                        isUnlocked
                          ? 'bg-primary text-primary-foreground hover:scale-110 hover:shadow-2xl active:scale-95'
                          : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      } ${isAssigned ? 'ring-4 ring-primary/50 animate-pulse' : ''}`}
                    >
                      {isUnlocked ? (
                        <span className="text-2xl">{level}</span>
                      ) : (
                        <Lock className="w-6 h-6 mx-auto" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 p-6 rounded-[1.5rem] bg-primary/10 border border-primary/20">
                <p className="text-sm text-primary">
                  💡 Tip: Levels with a ring around them are assigned by your psychologist!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
