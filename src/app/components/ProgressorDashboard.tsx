import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { LogOut, Lock, Target, Map as MapIcon, Route, Shuffle, PackageSearch, LucideIcon, Bell, User, Award } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useGameSession } from '../context/GameSessionContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import LogoutConfirmModal from './ui/LogoutConfirmModal';
import ProfileModal from './ui/ProfileModal';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

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
    icon: MapIcon,
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

  const [isVerifying, setIsVerifying] = useState(true);

  // Secure Route Guard & IDOR Prevention
  useEffect(() => {
    const checkOwnership = async () => {
      setIsVerifying(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          toast.error('Authentication required. Please log in again.');
          navigate('/');
          return;
        }

        const { data: trueProfile, error: profileError } = await supabase
          .from('progressors')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (profileError || !trueProfile) {
          toast.error('Access denied: Profile not found or unauthorized.');
          navigate('/');
          return;
        }

        if (progressorId !== trueProfile.id) {
          toast.error('Access denied: You do not have permission to view this dashboard.');
          // Redirect the user to their own authorized URL
          navigate(`/progressor/${trueProfile.id}`);
          return;
        }

        setIsVerifying(false);
      } catch (err) {
        console.error('IDOR check error:', err);
        navigate('/');
      }
    };

    checkOwnership();
  }, [progressorId, navigate]);

  const { completedLevels, assignedLevels, earnedBadges, setProgressor, updateSession } = useGameSession();
  const safeCompletedLevels = Array.isArray(completedLevels) ? completedLevels : [];
  const safeAssignedLevels = Array.isArray(assignedLevels) ? assignedLevels : [];

  const [selectedGame, setSelectedGame] = useState<string | null>(() => {
    return location.state?.selectedGame || null;
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userData, setUserData] = useState<{ id: string; name: string; age?: number; email?: string; avatar_url: string | null } | null>(null);

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

  const [showNotifications, setShowNotifications] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; key: string; text: string; read: boolean; gameId: string; levelNum: number }>>([]);

  const popoverRef = useRef<HTMLDivElement>(null);
  const badgePopoverRef = useRef<HTMLDivElement>(null);

  const hasUnread = notifications.some(n => !n.read);

  const markAllRead = () => {
    if (!progressorId) return;
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      const readKeys = updated.map(n => n.key);
      try {
        localStorage.setItem(`voyage_read_assignments_${progressorId}`, JSON.stringify(readKeys));
      } catch (err) {
        console.error('Error saving read assignments to localStorage:', err);
      }
      return updated;
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (badgePopoverRef.current && !badgePopoverRef.current.contains(event.target as Node)) {
        setShowBadges(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set the active progressor in context and fetch/subscribe to the DB
  useEffect(() => {
    if (!progressorId) return;

    setProgressor(progressorId);

    const fetchLatestData = async () => {
      try {
        const { data, error } = await supabase
          .from('progressors')
          .select('id, name, age, assigned_email, completed_levels, assigned_levels, avatar_url, earned_badges')
          .eq('id', progressorId)
          .maybeSingle();

        if (data && !error) {
          updateSession(
            progressorId,
            data.name || '',
            data.completed_levels || [],
            data.assigned_levels || [],
            data.earned_badges || []
          );
          setUserData({
            id: data.id,
            name: data.name || '',
            age: data.age || 0,
            email: data.assigned_email || '',
            avatar_url: data.avatar_url || null,
          });
        }
      } catch (err) {
        console.error('Error fetching latest progressor data:', err);
      }
    };

    fetchLatestData();

    // Set up a real-time subscription to the progressor's database record
    const subscription = supabase
      .channel(`progressor-updates-${progressorId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'progressors',
          filter: `id=eq.${progressorId}`,
        },
        (payload) => {
          const newData = payload.new as {
            id: string;
            name?: string;
            age?: number;
            assigned_email?: string;
            completed_levels?: any[];
            assigned_levels?: any[];
            avatar_url?: string | null;
            earned_badges?: any[];
          };
          updateSession(
            progressorId,
            newData.name || '',
            newData.completed_levels || [],
            newData.assigned_levels || [],
            newData.earned_badges || []
          );
          setUserData({
            id: newData.id,
            name: newData.name || '',
            age: newData.age || 0,
            email: newData.assigned_email || '',
            avatar_url: newData.avatar_url || null,
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [progressorId]);

  // Pre-select game if returning from result screen
  useEffect(() => {
    if (location.state?.selectedGame) {
      setSelectedGame(location.state.selectedGame);
    }
  }, [location.state]);

  // Derive notifications from assigned levels
  useEffect(() => {
    if (!progressorId) return;

    if (safeAssignedLevels.length > 0) {
      let readKeys: string[] = [];
      try {
        const stored = localStorage.getItem(`voyage_read_assignments_${progressorId}`);
        if (stored) {
          readKeys = JSON.parse(stored);
          if (!Array.isArray(readKeys)) readKeys = [];
        }
      } catch (err) {
        console.error('Error reading read assignments from localStorage:', err);
      }

      setNotifications(() => {
        return safeAssignedLevels.map((levelKey, idx) => {
          const lastDashIndex = levelKey.lastIndexOf('-');
          const gameId = levelKey.substring(0, lastDashIndex);
          const levelNum = levelKey.substring(lastDashIndex + 1);
          const gameName = GAMES.find(g => g.id === gameId)?.name || gameId;
          const text = `New assignment: ${gameName} - Level ${levelNum}`;
          
          return {
            id: idx,
            key: levelKey,
            text,
            read: readKeys.includes(levelKey),
            gameId,
            levelNum: parseInt(levelNum, 10)
          };
        });
      });
    } else {
      setNotifications([]);
    }
  }, [safeAssignedLevels, progressorId]);

  const isLevelUnlocked = (gameId: string, levelNum: number) => {
    const currentLevelKey = `${gameId}-${levelNum}`;
    const previousLevelKey = `${gameId}-${levelNum - 1}`;

    if (levelNum === 1) return true;

    if (levelNum === 2) {
      return safeCompletedLevels.includes(previousLevelKey);
    }

    // Strict Practitioner Gate for Level 3+
    return safeAssignedLevels.includes(currentLevelKey);
  };

  const handleLevelClick = (gameId: string, level: number) => {
    const isUnlocked = isLevelUnlocked(gameId, level);
    if (isUnlocked) {
      navigate(`/game/${gameId}/${level}`);
    } else {
      if (level >= 3) {
        toast.error("A practitioner hasn't assigned you this level yet.");
      }
    }
  };

  const handleNotificationClick = (notif: { gameId: string; levelNum: number; key: string }) => {
    if (progressorId) {
      try {
        const stored = localStorage.getItem(`voyage_read_assignments_${progressorId}`);
        let readKeys: string[] = [];
        if (stored) {
          readKeys = JSON.parse(stored);
          if (!Array.isArray(readKeys)) readKeys = [];
        }
        if (!readKeys.includes(notif.key)) {
          readKeys.push(notif.key);
          localStorage.setItem(`voyage_read_assignments_${progressorId}`, JSON.stringify(readKeys));
        }
      } catch (err) {
        console.error('Error saving read notification to localStorage:', err);
      }
    }
    setNotifications(prev => prev.map(n => n.key === notif.key ? { ...n, read: true } : n));
    setShowNotifications(false);
    navigate(`/game/${notif.gameId}/${notif.levelNum}`);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-poppins">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground text-sm font-medium">Verifying secure session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
              aria-label="Open profile modal"
            >
              {userData?.avatar_url ? (
                <img
                  src={userData.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#FF6347]/10 flex items-center justify-center text-[#FF6347]">
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}
            </button>
            <div>
              <h1 className="mb-0.5 text-lg sm:text-xl font-bold text-foreground">Ready for your Voyage?</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Choose a game to start playing</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50">
            <ThemeToggle />

            {/* Badges Popover */}
            <div className="relative" ref={badgePopoverRef}>
              <button
                onClick={() => {
                  setShowBadges(!showBadges);
                  setShowNotifications(false);
                }}
                className="p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] bg-card shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border border-border relative flex items-center justify-center text-foreground cursor-pointer"
                aria-label="Badges"
                title="Your Badges"
              >
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                {earnedBadges && earnedBadges.length > 0 && (
                  <span className="absolute top-2 right-2 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-yellow-400 rounded-full ring-2 ring-card" />
                )}
              </button>

              {showBadges && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-card border border-border rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl p-4 sm:p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                    <h3 className="text-foreground font-bold text-sm sm:text-base">Master Badges</h3>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {!earnedBadges || earnedBadges.length === 0 ? (
                      <div className="text-center py-6 text-xs sm:text-sm text-muted-foreground">
                        Complete Level 10 of any game to earn a badge!
                      </div>
                    ) : (
                      earnedBadges.map((badgeId) => {
                        const gameId = badgeId.replace('-master', '');
                        const gameName = GAMES.find(g => g.id === gameId)?.name || gameId;
                        return (
                          <div
                            key={badgeId}
                            className="w-full flex items-center gap-3 p-3 rounded-[1.25rem] text-xs sm:text-sm transition-all border block bg-yellow-500/10 border-yellow-500/20 text-foreground font-medium"
                          >
                            <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <span>{gameName} Master</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Popover */}
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => {
                  const nextShow = !showNotifications;
                  setShowNotifications(nextShow);
                  setShowBadges(false);
                  if (nextShow) {
                    markAllRead();
                  }
                }}
                className="p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] bg-card shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border border-border relative flex items-center justify-center text-foreground"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {hasUnread && (
                  <span className="absolute top-2 right-2 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#FF6347] rounded-full ring-2 ring-card" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-card border border-border rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl p-4 sm:p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                    <h3 className="text-foreground font-bold text-sm sm:text-base">Practitioner Assignments</h3>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs sm:text-sm text-muted-foreground">
                        No new notifications
                      </div>
                    ) : (
                      [...notifications].reverse().map((notif) => (
                        <button
                          key={notif.key}
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full text-left p-3 rounded-[1.25rem] text-xs sm:text-sm transition-all border block hover:scale-[1.02] active:scale-95 cursor-pointer ${
                            notif.read
                              ? 'bg-secondary/40 border-transparent text-muted-foreground hover:bg-secondary/60'
                              : 'bg-primary/10 border-primary/20 text-foreground font-medium hover:bg-primary/15'
                          }`}
                        >
                          {notif.text}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[1.25rem] sm:rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all border border-border text-foreground font-bold text-xs sm:text-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {GAMES.map((game, index) => {
              const Icon = game.icon;
              return (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className="group bg-card rounded-[1.5rem] sm:rounded-[2rem] border border-border p-6 md:p-8 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 text-left overflow-hidden relative animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                    </div>
                    <h2 className="mb-2 text-lg md:text-xl text-foreground font-bold">{game.name}</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">{game.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedGame(null)}
              className="mb-6 md:mb-8 px-5 md:px-6 py-2.5 md:py-3 rounded-[1.25rem] md:rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300 border border-border text-foreground text-sm font-bold"
            >
              ← Back to Games
            </button>

            <div className="bg-card rounded-[1.5rem] sm:rounded-[2rem] border border-border p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 md:mb-8">
                {(() => {
                  const game = GAMES.find((g) => g.id === selectedGame);
                  const Icon = game?.icon;
                  return (
                    <>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {Icon && <Icon className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-primary" />}
                      </div>
                      <div>
                        <h1 className="mb-1 text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground">{game?.name}</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">{game?.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <h3 className="mb-4 sm:mb-6 text-base sm:text-lg font-bold text-foreground">Select a Level</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2 sm:gap-4">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                  const isAssigned = safeAssignedLevels.includes(`${selectedGame}-${level}`);
                  const isUnlocked = isLevelUnlocked(selectedGame, level);
                  const isCompleted = safeCompletedLevels.includes(`${selectedGame}-${level}`);

                  const levelButton = (
                    <button
                      key={level}
                      onClick={() => handleLevelClick(selectedGame, level)}
                      className={`aspect-square rounded-[1rem] sm:rounded-[1.5rem] transition-all duration-300 shadow-md sm:shadow-lg relative flex flex-col items-center justify-center p-1 sm:p-2 border ${
                        isUnlocked
                          ? isCompleted
                            ? 'bg-primary/20 border-primary text-primary hover:scale-110'
                            : 'bg-primary text-primary-foreground hover:scale-110 hover:shadow-2xl active:scale-95 border-primary'
                          : 'bg-secondary border-border text-muted-foreground opacity-50 cursor-pointer'
                      } ${isAssigned && isUnlocked ? 'ring-2 sm:ring-4 ring-primary/50' : ''}`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-base sm:text-2xl font-bold">{level}</span>
                        {!isUnlocked && <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />}
                      </div>
                      {isCompleted && (
                        <span className="text-[8px] sm:text-[10px] text-primary font-semibold mt-0.5">Done</span>
                      )}
                      {level >= 3 && !isUnlocked && (
                        <span className="text-[7px] sm:text-[8px] text-muted-foreground font-medium mt-0.5 text-center leading-tight px-0.5 hidden sm:block">Req.</span>
                      )}
                    </button>
                  );

                  if (level >= 3 && !isUnlocked) {
                    return (
                      <Tooltip key={level}>
                        <TooltipTrigger asChild>
                          {levelButton}
                        </TooltipTrigger>
                        <TooltipContent>
                          Practitioner Assignment Required
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return levelButton;
                })}
              </div>

              <div className="mt-6 md:mt-8 p-4 sm:p-6 rounded-[1.25rem] sm:rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center gap-2 sm:gap-3">
                <Target className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs sm:text-sm text-primary font-medium">
                  Tip: Levels with a ring around them are assigned by your practitioner!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <LogoutConfirmModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogoutConfirm} 
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        role="progressor"
        userId={progressorId || ''}
        userData={userData}
        onUpdate={(newAvatarUrl) => {
          setUserData(prev => prev ? { ...prev, avatar_url: newAvatarUrl } : null);
        }}
      />
    </div>
  );
}
