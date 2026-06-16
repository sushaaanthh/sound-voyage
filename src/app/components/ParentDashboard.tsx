import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Home, Clock, TrendingUp, MessageSquare, Star, Link as LinkIcon, Award, Target, Calendar, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ThemeToggle } from './ThemeToggle';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Progressor {
  id: string;
  name: string;
  age: number;
  completed_levels: string[];
  assigned_levels: string[];
  last_session?: string;
  parent_id?: string;
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [children, setChildren] = useState<Progressor[]>([]);
  const [selectedChild, setSelectedChild] = useState<Progressor | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [linkProgressorId, setLinkProgressorId] = useState('');
  const [linking, setLinking] = useState(false);

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
        setCurrentUser(user);
        await fetchChildren(user.id);
      } catch (err) {
        console.error('Failed to initialize parent portal:', err);
        toast.error('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    initializeParentPortal();
  }, [navigate]);

  const fetchChildren = async (parentId: string) => {
    try {
      const { data, error } = await supabase
        .from('progressors')
        .select('*')
        .eq('parent_id', parentId)
        .order('name');

      if (error) {
        console.error('Error fetching children:', error.message);
        toast.error('Failed to load child profiles.');
        return;
      }

      const formattedChildren: Progressor[] = (data || []).map(p => ({
        id: p.id,
        name: p.name || 'Unnamed Child',
        age: p.age || 0,
        completed_levels: Array.isArray(p.completed_levels) ? p.completed_levels.map(String) : [],
        assigned_levels: Array.isArray(p.assigned_levels) ? p.assigned_levels.map(String) : [],
        last_session: p.last_session || undefined,
        parent_id: p.parent_id
      }));

      setChildren(formattedChildren);

      // Select active child based on URL parameter or first child available
      if (formattedChildren.length > 0) {
        const childInUrl = formattedChildren.find(c => c.id === progressorId);
        setSelectedChild(childInUrl || formattedChildren[0]);
      } else {
        setSelectedChild(null);
      }
    } catch (err) {
      console.error('Unexpected error fetching children:', err);
    }
  };

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

  // Handle child linking
  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    const childIdInput = linkProgressorId.trim();
    if (!childIdInput) return;

    setLinking(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error("You must be logged in to link a child account.");
        return;
      }

      // Query if progressor exists
      const { data: progressor, error: fetchError } = await supabase
        .from('progressors')
        .select('id, parent_id, name')
        .eq('id', childIdInput)
        .maybeSingle();

      if (fetchError || !progressor) {
        toast.error("Progressor ID not found in the progressors table.");
        return;
      }

      if (progressor.parent_id === user.id) {
        toast.info("This child is already linked to your account.");
        return;
      }

      // Update progressor row to link parent_id
      const { error: updateError } = await supabase
        .from('progressors')
        .update({ parent_id: user.id })
        .eq('id', childIdInput);

      if (updateError) {
        toast.error("Failed to link child account: " + updateError.message);
      } else {
        toast.success(`Successfully linked ${progressor.name || childIdInput}!`);
        setLinkProgressorId('');
        // Refresh children list
        await fetchChildren(user.id);
      }
    } catch (err) {
      console.error('Link child exception:', err);
      toast.error("An unexpected error occurred while linking child.");
    } finally {
      setLinking(false);
    }
  };

  // Level unlock helper logic
  const isLevelUnlocked = (gameId: string, levelNum: number, completedLevels: string[], assignedLevels: string[]) => {
    const currentLevelKey = `${gameId}-${levelNum}`;
    const safeCompleted = Array.isArray(completedLevels) ? completedLevels : [];
    const safeAssigned = Array.isArray(assignedLevels) ? assignedLevels : [];
    
    if (safeAssigned.includes(currentLevelKey)) return true;
    if (levelNum === 1) return true;

    const previousLevelKey = `${gameId}-${levelNum - 1}`;
    return safeCompleted.includes(previousLevelKey);
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-foreground">
              {selectedChild ? `${selectedChild.name}'s Observation Deck` : 'Observation Deck'}
            </h1>
            <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
              <User className="w-4 h-4 text-primary" />
              Parent Portal • View Only Access
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                toast.success('Logged out successfully');
                navigate('/');
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all text-foreground border border-border cursor-pointer font-semibold"
            >
              <Home className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Child Selector Tabs & Link Account form */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
          
          {/* Linked Children Tabs */}
          <div className="flex-1">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Linked Children</h3>
            {children.length === 0 ? (
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border/60 text-center">
                <p className="text-muted-foreground text-sm font-medium">No children linked to this parent account yet.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className={`px-6 py-3.5 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 border cursor-pointer ${
                      selectedChild?.id === child.id
                        ? 'bg-primary text-primary-foreground border-primary font-bold shadow-lg shadow-primary/10'
                        : 'bg-card text-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    {child.name} <span className="opacity-70 text-xs font-normal">({child.id})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Link Child Form */}
          <div className="w-full md:w-96 bg-card border border-border rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-foreground font-bold mb-1 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              Link Child's Account
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Enter your child's Progressor ID (e.g. E001) to view their live gameplay telemetry.</p>
            <form onSubmit={handleLinkChild} className="flex gap-2">
              <input
                type="text"
                placeholder="Progressor ID"
                value={linkProgressorId}
                onChange={(e) => setLinkProgressorId(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-[1.25rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                disabled={linking}
                required
              />
              <button
                type="submit"
                disabled={linking}
                className="px-5 py-2.5 rounded-[1.25rem] bg-primary text-primary-foreground font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50 cursor-pointer"
              >
                {linking ? 'Linking...' : 'Link'}
              </button>
            </form>
          </div>
        </div>

        {selectedChild ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Play Time */}
              <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm flex items-center gap-5">
                <div className="p-4 rounded-[1.5rem] bg-primary/10 flex-shrink-0 text-primary">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Play Time</p>
                  <h2 className="text-foreground font-extrabold mt-0.5">{totalMinutes} mins</h2>
                  <p className="text-xs text-muted-foreground mt-1">Across {sessions.length} sessions</p>
                </div>
              </div>

              {/* Top Performing Game */}
              <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm flex items-center gap-5">
                <div className="p-4 rounded-[1.5rem] bg-amber-500/10 flex-shrink-0 text-amber-500">
                  <Star className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Game</p>
                  <h3 className="text-foreground font-extrabold mt-0.5 truncate max-w-[180px]">{topGameName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{topGameAccuracy > 0 ? `${topGameAccuracy}% average accuracy` : 'No games played yet'}</p>
                </div>
              </div>

              {/* Progress Level */}
              <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm flex items-center gap-5">
                <div className="p-4 rounded-[1.5rem] bg-green-500/10 flex-shrink-0 text-green-500">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Overall Progress</p>
                  <h2 className="text-foreground font-extrabold mt-0.5">{overallProgressRating}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{overallProgressDescription}</p>
                </div>
              </div>
            </div>

            {/* Highest Unlocked Levels Grid */}
            <div className="bg-card rounded-[2rem] border border-border p-8 mb-10 shadow-sm">
              <h3 className="text-foreground font-bold mb-1 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Game Unlock Status
              </h3>
              <p className="text-xs text-muted-foreground mb-6">Levels 1 & 2 are open by default. Higher levels are unlocked sequentially or explicitly assigned by a practitioner.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {GAMES.map(game => {
                  const highestLvl = getHighestUnlockedLevel(game.id, selectedChild.completed_levels, selectedChild.assigned_levels);
                  const completedForGame = selectedChild.completed_levels.filter(l => l.startsWith(game.id)).length;
                  return (
                    <div key={game.id} className="p-5 rounded-2xl bg-secondary/20 border border-border/60 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-foreground text-sm truncate">{game.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">Unlocked up to</p>
                        <p className="text-xl font-extrabold text-primary mt-1">Level {highestLvl}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Play Time Chart */}
                <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm">
                  <h3 className="mb-4 text-foreground font-bold text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Weekly Play Time (mins)
                  </h3>
                  <div className="w-full h-64">
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
                <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm">
                  <h3 className="mb-4 text-foreground font-bold text-base flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Average Accuracy per Game
                  </h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gamePerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis type="number" domain={[0, 100]} stroke="#888888" fontSize={11} tickLine={false} />
                        <YAxis dataKey="game" type="category" width={110} stroke="#888888" fontSize={11} tickLine={false} />
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
            <div className="bg-card rounded-[2rem] border border-border p-8 shadow-sm">
              <h3 className="mb-6 text-foreground font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Recent Gameplay Sessions
              </h3>

              {sessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-60" />
                  <p className="font-semibold text-sm">No game session telemetry recorded yet.</p>
                  <p className="text-xs opacity-75 mt-1">Once your child starts playing games, reports will populate here.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
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
                        className="p-5 rounded-2xl bg-secondary/20 border border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:scale-[1.005] hover:border-primary/20 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-base">{gameName}</span>
                            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full">
                              Lvl {session.level}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {sessionDate}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Accuracy</p>
                            <p className={`text-base font-extrabold ${session.accuracy >= 60 ? 'text-green-500' : 'text-amber-500'}`}>
                              {session.accuracy}%
                            </p>
                          </div>
                          <div className="text-left sm:text-right min-w-[70px]">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Score</p>
                            <p className="text-base font-extrabold text-foreground">{session.score}</p>
                          </div>
                          <div className="text-left sm:text-right min-w-[80px]">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Time Taken</p>
                            <p className="text-base font-extrabold text-foreground">{session.time_taken}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Read-only Alert Info */}
            <div className="mt-10 p-6 rounded-[2rem] bg-primary/10 border border-primary/20 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-primary animate-pulse" />
              <h3 className="mb-2 text-foreground font-bold">Clinical View-Only Environment</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
                As a parent, your access dashboard provides real-time telemetry observation reports. Level assignments, task scheduling, and detailed diagnosis analytics are managed by your child's certified practitioner. For any changes, please consult your practitioner directly.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-card rounded-[2rem] border border-border p-8 max-w-2xl mx-auto shadow-sm">
            <LinkIcon className="w-16 h-16 mx-auto mb-4 text-primary opacity-80" />
            <h3 className="text-foreground text-xl font-bold mb-2">Observation Deck Setup</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm leading-relaxed">
              Welcome to Sound Voyage! You have successfully signed up. To start viewing progress charts and gameplay telemetry, please link your child's Progressor ID using the link panel above.
            </p>
            <div className="flex justify-center gap-2 items-center text-xs text-muted-foreground">
              <span>Need help? Ask your child's practitioner for their ID.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
