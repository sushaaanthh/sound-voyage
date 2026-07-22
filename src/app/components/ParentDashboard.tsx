import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { LogOut, Clock, TrendingUp, MessageSquare, Star, Award, Target, Calendar, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ThemeToggle } from './ThemeToggle';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import LogoutConfirmModal from './ui/LogoutConfirmModal';

interface Progressor {
  id: string;
  name: string;
  age: number;
  completed_levels: string[];
  assigned_levels: string[];
  last_session?: string;
  parent_id?: string;
  earned_badges: string[];
}

interface GameSession {
  id: string;
  game_id: string;
  level: number;
  score: number;
  accuracy: number;
  time_taken: string;
  created_at: string;
  progressor_id: string;
}

interface Game {
  id: string;
  name: string;
}

const GAMES: Game[] = [
  { id: 'phoneme-pop', name: 'Phoneme Pop' },
  { id: 'position-pilot', name: 'Position Pilot' },
  { id: 'sound-trail', name: 'Sound Trail' },
  { id: 'sound-synk', name: 'Sound Synk' },
  { id: 'sound-sorter', name: 'Sound Sorter' },
];

const timeToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  return parseInt(timeStr, 10) || 0;
};


export default function ParentDashboard() {
  const { progressorId } = useParams();
  const navigate = useNavigate();

  // Authentication & Profile States
  const [children, setChildren] = useState<Progressor[]>([]);
  const [selectedChild, setSelectedChild] = useState<Progressor | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('An error occurred during logout.');
      navigate('/');
    }
  };

  // Fetch Parent profile and children on load
  useEffect(() => {
    const initializeParentPortal = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          toast.error('Authentication required. Please log in again.');
          navigate('/');
          return;
        }

        const { data: linkedChildren, error } = await supabase
          .from('progressors')
          .select('*')
          .eq('parent_id', user.id);

        if (error) {
          console.error('Error fetching children:', error.message);
          toast.error('Failed to load child profiles.');
          return;
        }

        const formattedChildren: Progressor[] = (linkedChildren || []).map(p => ({
          id: p.id,
          name: p.name || 'Unnamed Child',
          age: p.age || 0,
          completed_levels: Array.isArray(p.completed_levels) ? p.completed_levels.map(String) : [],
          assigned_levels: Array.isArray(p.assigned_levels) ? p.assigned_levels.map(String) : [],
          earned_badges: Array.isArray(p.earned_badges) ? p.earned_badges.map(String) : [],
          last_session: p.last_session || undefined,
          parent_id: p.parent_id
        }));

        setChildren(formattedChildren);

        if (formattedChildren.length > 0) {
          const childInUrl = formattedChildren.find(c => c.id === progressorId);
          setSelectedChild(childInUrl || formattedChildren[0]);
        } else {
          setSelectedChild(null);
        }
      } catch (err) {
        console.error('Failed to initialize parent portal:', err);
        toast.error('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    initializeParentPortal();
  }, [navigate, progressorId]);

  // Fetch telemetry sessions when selected child changes
  useEffect(() => {
    if (!selectedChild) {
      setSessions([]);
      return;
    }

    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('progressor_id', selectedChild.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching game sessions:', error.message);
        } else {
          setSessions(data || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching game sessions:', err);
      }
    };

    fetchSessions();
  }, [selectedChild]);

  // Level unlock helper logic
  const isLevelUnlocked = (gameId: string, levelNum: number, completedLevels: string[], assignedLevels: string[]) => {
    const currentLevelKey = `${gameId}-${levelNum}`;
    const safeCompleted = Array.isArray(completedLevels) ? completedLevels : [];
    const safeAssigned = Array.isArray(assignedLevels) ? assignedLevels : [];
    const previousLevelKey = `${gameId}-${levelNum - 1}`;

    if (levelNum === 1) return true;

    if (levelNum === 2) {
      return safeCompleted.includes(previousLevelKey);
    }

    // Strict Practitioner Gate for Level 3+
    return safeAssigned.includes(currentLevelKey);
  };

  const getHighestUnlockedLevel = (gameId: string, completedLevels: string[], assignedLevels: string[]) => {
    let highest = 1;
    for (let l = 2; l <= 10; l++) {
      if (isLevelUnlocked(gameId, l, completedLevels, assignedLevels)) {
        highest = l;
      }
    }
    return highest;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading Observation Deck...</p>
      </div>
    );
  }

  // Calculate stats for current active child
  const totalSeconds = sessions.reduce((sum, s) => sum + timeToSeconds(s.time_taken), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  // Top game calculation based on average accuracy
  const gameStats: { [gameId: string]: { totalAccuracy: number; count: number } } = {};
  sessions.forEach(s => {
    if (!gameStats[s.game_id]) {
      gameStats[s.game_id] = { totalAccuracy: 0, count: 0 };
    }
    gameStats[s.game_id].totalAccuracy += s.accuracy;
    gameStats[s.game_id].count += 1;
  });
  
  let topGameName = 'N/A';
  let topGameAccuracy = 0;
  Object.entries(gameStats).forEach(([gameId, stats]) => {
    const avg = Math.round(stats.totalAccuracy / stats.count);
    if (avg > topGameAccuracy) {
      topGameAccuracy = avg;
      topGameName = GAMES.find(g => g.id === gameId)?.name || gameId;
    }
  });

  // Calculate dynamic progress rating
  const completedCount = selectedChild?.completed_levels?.length || 0;
  let overallProgressRating = 'N/A';
  let overallProgressDescription = 'Play games to show progress';
  if (selectedChild) {
    if (completedCount === 0) {
      overallProgressRating = 'Getting Started';
      overallProgressDescription = 'No levels completed yet';
    } else if (completedCount < 5) {
      overallProgressRating = 'Developing';
      overallProgressDescription = 'Making good first steps';
    } else if (completedCount < 15) {
      overallProgressRating = 'Steady';
      overallProgressDescription = 'Consistent improvements';
    } else {
      overallProgressRating = 'Excellent';
      overallProgressDescription = 'Advanced level completions';
    }
  }

  // Generate dynamic 7-day play time chart data
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    return last7Days.map(date => {
      const dateStr = date.toDateString();
      const daySessions = sessions.filter(s => new Date(s.created_at).toDateString() === dateStr);
      const secs = daySessions.reduce((sum, s) => sum + timeToSeconds(s.time_taken), 0);
      return {
        day: days[date.getDay()],
        minutes: Math.round(secs / 60)
      };
    });
  };

  // Generate game accuracy chart data
  const gamePerformance = GAMES.map(game => {
    const gameSessions = sessions.filter(s => s.game_id === game.id);
    const avgAccuracy = gameSessions.length > 0
      ? Math.round(gameSessions.reduce((sum, s) => sum + s.accuracy, 0) / gameSessions.length)
      : 0;
    return {
      game: game.name,
      score: avgAccuracy
    };
  });

  const weeklyData = getWeeklyData();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-1 text-foreground">
              {selectedChild ? `${selectedChild.name}'s Observation Deck` : 'Observation Deck'}
            </h1>
            <p className="text-muted-foreground flex items-center gap-1 text-xs sm:text-sm font-medium">
              <User className="w-4 h-4 text-primary flex-shrink-0" />
              Parent Portal • View Only Access
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50">
            <ThemeToggle />

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[1.25rem] sm:rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all text-foreground border border-border cursor-pointer text-xs sm:text-sm font-semibold"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        
        {/* Child Selector Tabs */}
        {children.length > 0 && (
          <div className="mb-6 md:mb-10">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Linked Children</h3>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-[1.25rem] sm:rounded-[1.5rem] text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 border cursor-pointer ${
                    selectedChild?.id === child.id
                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-lg shadow-primary/10'
                      : 'bg-card text-foreground border-border hover:bg-secondary'
                  }`}
                >
                  {child.name} <span className="opacity-70 text-[10px] sm:text-xs font-normal">({child.id})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedChild ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
              {/* Play Time */}
              <div className="bg-card rounded-[1.5rem] sm:rounded-[2rem] border border-border p-4 sm:p-6 shadow-sm flex items-center gap-4 sm:gap-5">
                <div className="p-3 sm:p-4 rounded-[1.25rem] sm:rounded-[1.5rem] bg-primary/10 flex-shrink-0 text-primary">
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Play Time</p>
                  <h2 className="text-foreground font-extrabold text-lg sm:text-2xl mt-0.5">{totalMinutes} mins</h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">Across {sessions.length} sessions</p>
                </div>
              </div>

              {/* Top Performing Game */}
              <div className="bg-card rounded-[1.5rem] sm:rounded-[2rem] border border-border p-4 sm:p-6 shadow-sm flex items-center gap-4 sm:gap-5">
                <div className="p-3 sm:p-4 rounded-[1.25rem] sm:rounded-[1.5rem] bg-amber-500/10 flex-shrink-0 text-amber-500">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Game</p>
                  <h3 className="text-foreground font-extrabold text-base sm:text-xl mt-0.5 truncate">{topGameName}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{topGameAccuracy > 0 ? `${topGameAccuracy}% avg accuracy` : 'No games played yet'}</p>
                </div>
              </div>

              {/* Progress Level */}
              <div className="bg-card rounded-[1.5rem] sm:rounded-[2rem] border border-border p-4 sm:p-6 shadow-sm flex items-center gap-4 sm:gap-5">
                <div className="p-3 sm:p-4 rounded-[1.25rem] sm:rounded-[1.5rem] bg-green-500/10 flex-shrink-0 text-green-500">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Overall Progress</p>
                  <h2 className="text-foreground font-extrabold text-lg sm:text-2xl mt-0.5 truncate">{overallProgressRating}</h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{overallProgressDescription}</p>
                </div>
              </div>
            </div>

            {/* Earned Mastery Badges */}
            {selectedChild.earned_badges && selectedChild.earned_badges.length > 0 && (
              <div className="flex items-center gap-3 mb-6 md:mb-10 p-4 sm:p-5 bg-yellow-50 dark:bg-yellow-500/10 rounded-[1.5rem] sm:rounded-[2rem] border border-yellow-200 dark:border-yellow-500/20 shadow-sm">
                <Award className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                <span className="text-sm font-bold text-yellow-800 dark:text-yellow-300 mr-1">Mastery Badges:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedChild.earned_badges.map((badge: string) => {
                    const badgeGameId = badge.replace('-master', '');
                    const badgeGameName = GAMES.find(g => g.id === badgeGameId)?.name || badgeGameId;
                    return (
                      <div key={badge} title={`${badgeGameName} Master`} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/20 dark:bg-yellow-500/20 rounded-full border border-yellow-300 dark:border-yellow-500/30">
                        <Award className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-yellow-800 dark:text-yellow-300">{badgeGameName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-card rounded-[1.5rem] sm:rounded-[2rem] border border-border p-4 sm:p-6 md:p-8 mb-6 md:mb-10 shadow-sm">
              <h3 className="text-foreground font-bold text-base sm:text-lg mb-1 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary flex-shrink-0" />
                Game Unlock Status
              </h3>
              <p className="text-xs text-muted-foreground mb-4 sm:mb-6">Levels 1 & 2 are open by default. Higher levels are unlocked sequentially or explicitly assigned by a practitioner.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                {GAMES.map(game => {
                  const highestLvl = getHighestUnlockedLevel(game.id, selectedChild.completed_levels, selectedChild.assigned_levels);
                  const completedForGame = selectedChild.completed_levels.filter(l => l.startsWith(game.id)).length;
                  const hasEarnedBadge = selectedChild.earned_badges.includes(`${game.id}-master`);
                  
                  return (
                    <div key={game.id} className="relative p-4 sm:p-5 rounded-2xl bg-secondary/20 border border-border/60 flex flex-col justify-between overflow-hidden">
                      {/* Badge Indicator */}
                      {hasEarnedBadge && (
                        <div className="absolute top-2 right-2 text-yellow-500 bg-yellow-500/10 p-1.5 rounded-full" title="Master Badge Earned!">
                          <Award className="w-5 h-5 fill-yellow-500" />
                        </div>
                      )}
                      
                      <div className="pr-6">
                        <h4 className="font-bold text-foreground text-sm truncate">{game.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">Unlocked up to</p>
                        <p className="text-lg sm:text-xl font-extrabold text-primary mt-1">Level {highestLvl}</p>
                      </div>
                      <div className="mt-3 sm:mt-4 pt-2.5 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Completions</span>
                        <span className="font-bold text-foreground">{completedForGame} / 10</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Charts Section */}
            {sessions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-10">
                {/* Play Time Chart */}
                <div className="bg-card rounded-[1.5rem] sm:rounded-[2rem] border border-border p-4 sm:p-6 shadow-sm">
                  <h3 className="mb-4 text-foreground font-bold text-sm sm:text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    Weekly Play Time (mins)
                  </h3>
                  <div className="w-full h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                        <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '1rem' }}
                          labelClassName="text-foreground font-semibold text-xs"
                          itemStyle={{ color: '#FF6347', fontSize: '12px' }}
                        />
                        <Bar dataKey="minutes" fill="#FF6347" radius={[6, 6, 0, 0]} maxBarSize={45} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Game Accuracy Chart */}
                <div className="bg-card rounded-[1.5rem] sm:rounded-[2rem] border border-border p-4 sm:p-6 shadow-sm">
                  <h3 className="mb-4 text-foreground font-bold text-sm sm:text-base flex items-center gap-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    Average Accuracy per Game
                  </h3>
                  <div className="w-full h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gamePerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis type="number" domain={[0, 100]} stroke="#888888" fontSize={11} tickLine={false} />
                        <YAxis dataKey="game" type="category" width={90} stroke="#888888" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '1rem' }}
                          labelClassName="text-foreground font-semibold text-xs"
                          itemStyle={{ color: '#FF6347', fontSize: '12px' }}
                        />
                        <Bar dataKey="score" fill="#FF6347" radius={[0, 6, 6, 0]} maxBarSize={25} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Recent Activity List */}
            <div className="bg-card rounded-[1.5rem] sm:rounded-[2rem] border border-border p-4 sm:p-6 md:p-8 shadow-sm">
              <h3 className="mb-4 sm:mb-6 text-foreground font-bold text-base sm:text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
                Recent Gameplay Sessions
              </h3>

              {sessions.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-muted-foreground opacity-60" />
                  <p className="font-semibold text-xs sm:text-sm">No game session telemetry recorded yet.</p>
                  <p className="text-[10px] sm:text-xs opacity-75 mt-1">Once your child starts playing games, reports will populate here.</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {sessions.slice(0, 15).map((session) => {
                    const gameName = GAMES.find(g => g.id === session.game_id)?.name || session.game_id;
                    const sessionDate = new Date(session.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={session.id}
                        className="p-4 sm:p-5 rounded-2xl bg-secondary/20 border border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 hover:scale-[1.005] hover:border-primary/20 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm sm:text-base">{gameName}</span>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full">
                              Lvl {session.level}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {sessionDate}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 sm:gap-4 items-center justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Accuracy</p>
                            <p className={`text-sm sm:text-base font-extrabold ${session.accuracy >= 60 ? 'text-green-500' : 'text-amber-500'}`}>
                              {session.accuracy}%
                            </p>
                          </div>
                          <div className="text-left sm:text-right min-w-[50px] sm:min-w-[70px]">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Score</p>
                            <p className="text-sm sm:text-base font-extrabold text-foreground">{session.score}</p>
                          </div>
                          <div className="text-left sm:text-right min-w-[60px] sm:min-w-[80px]">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Time</p>
                            <p className="text-sm sm:text-base font-extrabold text-foreground">{session.time_taken}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Read-only Alert Info */}
            <div className="mt-8 sm:mt-10 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-primary/10 border border-primary/20 text-center">
              <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-primary animate-pulse" />
              <h3 className="mb-1.5 text-foreground font-bold text-sm sm:text-base">Clinical View-Only Environment</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
                As a parent, your access dashboard provides real-time telemetry observation reports. Level assignments, task scheduling, and detailed diagnosis analytics are managed by your child's certified practitioner. For any changes, please consult your practitioner directly.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-card rounded-[1.5rem] sm:rounded-[2rem] border border-border p-6 sm:p-8 max-w-2xl mx-auto shadow-sm">
            <User className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-primary opacity-80" />
            <h3 className="text-foreground text-lg sm:text-xl font-bold mb-2">Observation Deck Setup</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
              Welcome to your Observation Deck. Your account is currently pending assignment. Samvidh Psych Services will link your child's profile shortly.
            </p>
          </div>
        )}
      </div>

      <LogoutConfirmModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogoutConfirm} 
      />
    </div>
  );
}
