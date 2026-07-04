import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, X, Trash2, History, ShieldAlert, TrendingUp, LogOut, Users, BarChart3, Target, Map, Route, Shuffle, PackageSearch, LucideIcon, Bell, Award, CheckCircle2, AlertCircle, Clock, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ThemeToggle } from './ThemeToggle';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import LogoutConfirmModal from './ui/LogoutConfirmModal';
import ProfileModal from './ui/ProfileModal';

interface Progressor {
  id: string;
  name: string;
  age: number;
  lastSession: string;
  recentSession?: {
    date: string;
    gameName?: string;
  };
  assignedEmail?: string;
  parentName?: string;
  completedLevels: string[];
  assignedLevels: string[];
}

interface GameSession {
  id: string;
  game_id: string;
  level: number;
  score: number;
  accuracy: number;
  time_taken: string;
  created_at: string;
  progressor_id?: string;
}

interface Game {
  id: string;
  name: string;
  icon: LucideIcon;
}

const GAMES: Game[] = [
  { id: 'phoneme-pop', name: 'Phoneme Pop', icon: Target },
  { id: 'position-pilot', name: 'Position Pilot', icon: Map },
  { id: 'sound-trail', name: 'Sound Trail', icon: Route },
  { id: 'sound-synk', name: 'Sound Synk', icon: Shuffle },
  { id: 'sound-sorter', name: 'Sound Sorter', icon: PackageSearch },
];
export default function PractitionerDashboard() {
  const [activeView, setActiveView] = useState<'progressors' | 'analytics' | 'tasks' | 'notifications'>('progressors');
  const [selectedProgressor, setSelectedProgressor] = useState<Progressor | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProgressorName, setNewProgressorName] = useState('');
  const [newProgressorAge, setNewProgressorAge] = useState('');
  const [newProgressorEmail, setNewProgressorEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [progressors, setProgressors] = useState<Progressor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [progressorToDelete, setProgressorToDelete] = useState<Progressor | null>(null);

  // View details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsProgressor, setSelectedDetailsProgressor] = useState<Progressor | null>(null);
  const [detailsActiveTab, setDetailsActiveTab] = useState<'progression' | 'history'>('progression');
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const navigate = useNavigate();
  const [currentPractitionerId, setCurrentPractitionerId] = useState<string | null>(null);
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

  // Setup dynamic loading of progressors
  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        // Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          toast.error('Authentication failed. Please log in again.');
          navigate('/');
          return;
        }

        // Profile Fetch
        const { data: practData, error: profileError } = await supabase
          .from('practitioners')
          .select('id, name, email, avatar_url')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (profileError || !practData) {
          toast.error('Access denied: Practitioner profile not found.');
          navigate('/');
          return;
        }

        // State Lock
        setCurrentPractitionerId(practData.id);
        setUserData({
          id: practData.id,
          name: practData.name || '',
          email: practData.email || '',
          avatar_url: practData.avatar_url || null,
        });

        // Registry Fetch
        const { data, error: registryError } = await supabase
          .from('progressors')
          .select('*, game_sessions ( created_at, game_id )')
          .eq('practitioner_id', practData.id)
          .order('name');

        if (registryError) {
          toast.error('Error fetching progressors: ' + registryError.message);
        } else if (data) {
          setProgressors(data.map(p => {
            const sessions = Array.isArray(p.game_sessions) ? [...p.game_sessions] : [];
            sessions.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const mostRecent = sessions[0];

            let recentSessionObj = undefined;
            let lastSessionText = 'No sessions yet';

            if (mostRecent && mostRecent.created_at) {
              const dateStr = new Date(mostRecent.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const gameNameMap: Record<string, string> = {
                'sound-sorter': 'Sound Sorter',
                'position-pilot': 'Position Pilot',
                'phoneme-pop': 'Phoneme Pop',
                'sound-sync': 'Sound Sync',
                'sound-trail': 'Sound Trail'
              };
              const gameName = mostRecent.game_id ? (gameNameMap[mostRecent.game_id] || mostRecent.game_id) : undefined;
              lastSessionText = gameName ? `${dateStr} - ${gameName}` : dateStr;
              recentSessionObj = { date: dateStr, gameName };
            } else if (p.last_session) {
              lastSessionText = p.last_session;
            }

            return {
              id: p.id,
              name: p.name || 'Unnamed Progressor',
              age: p.age || 0,
              assignedEmail: p.assigned_email || '',
              parentName: p.parent_name || '',
              lastSession: lastSessionText,
              recentSession: recentSessionObj,
              completedLevels: Array.isArray(p.completed_levels) ? p.completed_levels.map(String) : [],
              assignedLevels: Array.isArray(p.assigned_levels) ? p.assigned_levels.map(String) : []
            };
          }));
        }
      } catch (err) {
        console.error('Failed to initialize dashboard:', err);
        toast.error('An unexpected error occurred during dashboard initialization.');
      } finally {
        setIsLoading(false);
      }
    };
    initializeDashboard();
  }, [navigate]);

  // Analytics State
  const [analyticsSessions, setAnalyticsSessions] = useState<GameSession[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('All');

  // Task Assignment State
  const [selectedLevelsToAssign, setSelectedLevelsToAssign] = useState<string[]>([]);
  const [savingAssignments, setSavingAssignments] = useState(false);

  // Notifications State
  const [notificationsSessions, setNotificationsSessions] = useState<GameSession[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Helper function to convert MM:SS to seconds
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

  // Helper function to format seconds to MM:SS
  const formatSeconds = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Fetch telemetry whenever selectedProgressor is changed for Analytics
  useEffect(() => {
    if (selectedProgressor) {
      const fetchAnalyticsData = async () => {
        setLoadingAnalytics(true);
        try {
          const { data, error } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('progressor_id', selectedProgressor.id)
            .order('created_at', { ascending: true });
          if (error) {
            console.error('Error fetching analytics sessions:', error.message);
          } else {
            setAnalyticsSessions(data || []);
          }
        } catch (err) {
          console.error('Unexpected error fetching analytics sessions:', err);
        } finally {
          setLoadingAnalytics(false);
        }
      };
      fetchAnalyticsData();
      // Initialize selectedLevelsToAssign with progressor's current assignments
      setSelectedLevelsToAssign(selectedProgressor.assignedLevels || []);
    } else {
      setAnalyticsSessions([]);
      setSelectedLevelsToAssign([]);
    }
  }, [selectedProgressor]);

  // Fetch recent notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (activeView === 'notifications' && progressors.length > 0) {
        setLoadingNotifications(true);
        try {
          const progressorIds = progressors.map(p => p.id);
          const { data, error } = await supabase
            .from('game_sessions')
            .select('*')
            .in('progressor_id', progressorIds)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching notifications:', error.message);
          } else {
            setNotificationsSessions(data || []);
          }
        } catch (err) {
          console.error('Unexpected error fetching notifications:', err);
        } finally {
          setLoadingNotifications(false);
        }
      }
    };
    fetchNotifications();
  }, [activeView, progressors]);

  const filteredProgressors = progressors.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProgressor = async () => {
    const assignedEmail = newProgressorEmail;

    try {
      if (!currentPractitionerId) {
        toast.error("Practitioner session not found");
        return;
      }

      const newId = 'PRG-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const newName = newProgressorName || 'Pending Registration';

      // Insert directly into progressors table
      const { error: profileError } = await supabase
        .from('progressors')
        .insert([
          {
            id: newId,
            name: newName,
            practitioner_id: currentPractitionerId,
            age: parseInt(newProgressorAge, 10) || 0,
            completed_levels: [],
            assigned_email: assignedEmail || null,
            parent_name: parentName || null
          }
        ]);

      if (profileError) {
        console.error('Error creating progressor:', profileError.message);
        toast.error('Failed to create progressor: ' + profileError.message);
        return;
      }

      // Update state list
      const newProgressor: Progressor = {
        id: newId,
        name: newName,
        age: parseInt(newProgressorAge, 10) || 0,
        assignedEmail: assignedEmail || '',
        parentName: parentName || '',
        lastSession: 'No sessions yet',
        completedLevels: [],
        assignedLevels: []
      };

      setProgressors(prev => [...prev, newProgressor]);
      toast.success(`Successfully generated Progressor ID: ${newId}`);
    } catch (err) {
      console.error('Failed to create progressor:', err);
      toast.error('An unexpected error occurred during progressor creation.');
    } finally {
      setShowCreateModal(false);
      setNewProgressorName('');
      setNewProgressorAge('');
      setNewProgressorEmail('');
      setParentName('');
    }
  };

  // Fetch game sessions for details modal
  const fetchGameSessions = async (progressorId: string) => {
    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('progressor_id', progressorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching game sessions:', error.message);
      } else {
        setSessions(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleOpenDetails = (progressor: Progressor) => {
    setSelectedDetailsProgressor(progressor);
    setShowDetailsModal(true);
    fetchGameSessions(progressor.id);
  };

  // Delete Progressor logic
  const handleDeleteProgressor = async () => {
    if (!progressorToDelete) return;
    try {
      // Delete from progressors table
      const { error: profileError } = await supabase
        .from('progressors')
        .delete()
        .eq('id', progressorToDelete.id);

      if (profileError) {
        console.error('Error deleting progressor profile:', profileError.message);
        toast.error('Failed to delete progressor: ' + profileError.message);
        return;
      }

      setProgressors(prev => prev.filter(p => p.id !== progressorToDelete.id));
      toast.success(`Progressor ${progressorToDelete.name} has been deleted successfully.`);
    } catch (err) {
      console.error('Failed to delete progressor:', err);
      toast.error('An unexpected error occurred during progressor deletion.');
    } finally {
      setShowDeleteModal(false);
      setProgressorToDelete(null);
    }
  };

  // Save task assignments to Supabase
  const handleSaveAssignments = async () => {
    if (!selectedProgressor) {
      toast.error('No progressor selected.');
      return;
    }
    setSavingAssignments(true);
    try {
      // Fetch the progressor's current assigned_levels array to avoid data loss
      const { data: progressor, error: fetchError } = await supabase
        .from('progressors')
        .select('assigned_levels')
        .eq('id', selectedProgressor.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current assignments:', fetchError.message);
        toast.error('Failed to retrieve current assignments: ' + fetchError.message, {
          duration: 5000,
        });
        setSavingAssignments(false);
        return;
      }

      // Merge newly selected levels with existing ones without duplicates
      const mergedLevels = Array.from(new Set([...(progressor?.assigned_levels || []), ...selectedLevelsToAssign]));

      const { error: updateError } = await supabase
        .from('progressors')
        .update({ assigned_levels: mergedLevels })
        .eq('id', selectedProgressor.id);

      if (updateError) {
        console.error('Error saving assignments:', updateError.message);
        toast.error('Failed to update task assignments: ' + updateError.message, {
          duration: 5000,
        });
      } else {
        toast.success(`Successfully updated assignments for ${selectedProgressor.name}`);
        
        // Update in-memory state for progressors
        setProgressors(prev => prev.map(p => {
          if (p.id === selectedProgressor.id) {
            return {
              ...p,
              assignedLevels: mergedLevels
            };
          }
          return p;
        }));
        
        // Update currently selected progressor to keep them in sync
        setSelectedProgressor(prev => prev ? {
          ...prev,
          assignedLevels: mergedLevels
        } : null);

        // Reset the selection UI state to represent the newly merged assignments
        setSelectedLevelsToAssign(mergedLevels);
      }
    } catch (err) {
      console.error('Unexpected error saving assignments:', err);
      toast.error('An unexpected error occurred while saving assignments.', {
        duration: 5000,
      });
    } finally {
      setSavingAssignments(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-poppins">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground text-sm font-medium">Verifying credentials and loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-72 bg-sidebar border-r border-sidebar-border p-6 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="mb-12 flex items-center gap-3">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-12 h-12 rounded-full border border-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
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
                <User className="w-6 h-6" />
              </div>
            )}
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight font-sans leading-tight" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>Practitioner Dashboard</h1>
          </div>
        </div>

        <nav className="space-y-3">
          <button
            onClick={() => setActiveView('progressors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 ${activeView === 'progressors'
                ? 'bg-primary text-primary-foreground shadow-lg font-bold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
          >
            <Users className="w-5 h-5" />
            Progressor Registry
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 ${activeView === 'analytics'
                ? 'bg-primary text-primary-foreground shadow-lg font-bold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>

          <button
            onClick={() => setActiveView('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 ${activeView === 'tasks'
                ? 'bg-primary text-primary-foreground shadow-lg font-bold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
          >
            <TrendingUp className="w-5 h-5" />
            Task Assignments
          </button>

          <button
            onClick={() => setActiveView('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 ${activeView === 'notifications'
                ? 'bg-primary text-primary-foreground shadow-lg font-bold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </button>
        </nav>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] text-sidebar-foreground hover:bg-sidebar-accent hover:scale-105 active:scale-95 transition-all mt-auto absolute bottom-6 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Progressor Registry View */}
        {activeView === 'progressors' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-foreground">Progressor Registry</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-[2rem] bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-bold"
              >
                <Plus className="w-5 h-5" />
                Create New Progressor
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search progressors by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-[2rem] bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Progressor List */}
            <div className="grid gap-4">
              {filteredProgressors.map((progressor) => (
                <div
                  key={progressor.id}
                  className="bg-card p-6 rounded-[2rem] border border-border hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedProgressor(progressor)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-foreground">{progressor.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        ID: {progressor.id} • Age: {progressor.age} • Last Session:{' '}
                        {progressor.recentSession ? (
                          <span className="text-foreground font-medium">
                            {progressor.recentSession.date}
                            {progressor.recentSession.gameName ? ` - ${progressor.recentSession.gameName}` : ''}
                          </span>
                        ) : progressor.lastSession !== 'No sessions yet' ? (
                          <span className="text-foreground font-medium">{progressor.lastSession}</span>
                        ) : (
                          <span className="italic">No sessions yet</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(progressor);
                        }}
                        className="px-4 py-2 rounded-[1rem] bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 font-bold font-sans"
                        style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProgressorToDelete(progressor);
                          setShowDeleteModal(true);
                        }}
                        className="p-2.5 rounded-[1rem] bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
                        title="Delete Progressor ID"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h1 className="text-foreground">Analytics Dashboard</h1>
              
              {/* Selectors */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-64">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Select Progressor</label>
                  <select
                    value={selectedProgressor?.id || ''}
                    onChange={(e) => {
                      const prog = progressors.find(p => p.id === e.target.value);
                      setSelectedProgressor(prog || null);
                    }}
                    className="w-full px-4 py-3 rounded-[1rem] bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-bold transition-all"
                  >
                    <option value="">-- Select Progressor --</option>
                    {progressors.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {!selectedProgressor ? (
              <div className="text-center py-20 bg-card rounded-[2rem] border border-border p-8">
                <p className="text-muted-foreground">Select a progressor from the dropdown to load analytics</p>
              </div>
            ) : loadingAnalytics ? (
              <div className="flex flex-col items-center justify-center py-20 bg-card rounded-[2rem] border border-border p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Fetching telemetry records...</p>
              </div>
            ) : (() => {
              const filteredSessions = analyticsSessions.filter(s => 
                selectedGameFilter === 'All' ? true : s.game_id === selectedGameFilter
              );

              if (filteredSessions.length === 0) {
                return (
                  <div className="text-center py-20 bg-card rounded-[2rem] border border-border p-8">
                    <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-foreground text-lg mb-2">No Session Telemetry</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      No game sessions recorded for <strong>{selectedProgressor.name}</strong> under the selected game filter.
                    </p>
                  </div>
                );
              }

              // Compute stats
              const totalSessionsCount = filteredSessions.length;
              const avgScore = (filteredSessions.reduce((acc, s) => acc + s.score, 0) / totalSessionsCount).toFixed(1);
              const avgAccuracy = Math.round(filteredSessions.reduce((acc, s) => acc + s.accuracy, 0) / totalSessionsCount);
              const totalSeconds = filteredSessions.reduce((acc, s) => acc + timeToSeconds(s.time_taken), 0);
              const avgSeconds = Math.round(totalSeconds / totalSessionsCount);
              const avgDuration = formatSeconds(avgSeconds);

              // Prepare Chart Data
              const chartData = filteredSessions.map((s, index) => ({
                name: `S${index + 1}`,
                date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                level: `Level ${s.level}`,
                accuracy: s.accuracy,
                score: s.score,
                timeSeconds: timeToSeconds(s.time_taken),
                timeString: s.time_taken,
                gameName: GAMES.find(g => g.id === s.game_id)?.name || s.game_id,
              }));

              return (
                <div className="space-y-6">
                  {/* Game Filter Pills */}
                  <div className="bg-card p-6 rounded-[2rem] border border-border">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Filter by Game</p>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => setSelectedGameFilter('All')}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                          selectedGameFilter === 'All'
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'bg-secondary hover:bg-muted text-foreground border border-border'
                        }`}
                      >
                        All Games
                      </button>
                      {GAMES.map(game => {
                        const Icon = game.icon;
                        const isSelected = selectedGameFilter === game.id;
                        return (
                          <button
                            key={game.id}
                            onClick={() => setSelectedGameFilter(game.id)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                : 'bg-secondary hover:bg-muted text-foreground border border-border'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {game.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-card p-6 rounded-[1.5rem] border border-border flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                        <History className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{totalSessionsCount}</p>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider font-sans">Total Sessions</p>
                      </div>
                    </div>

                    <div className="bg-card p-6 rounded-[1.5rem] border border-border flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0 text-green-500">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{avgAccuracy}%</p>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider font-sans">Avg Accuracy</p>
                      </div>
                    </div>

                    <div className="bg-card p-6 rounded-[1.5rem] border border-border flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{avgScore}</p>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider font-sans">Avg Score</p>
                      </div>
                    </div>

                    <div className="bg-card p-6 rounded-[1.5rem] border border-border flex items-center gap-4 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{avgDuration}</p>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider font-sans">Avg Duration</p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Telemetry Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart 1: Accuracy Trend */}
                    <div className="bg-card p-6 rounded-[2rem] border border-border flex flex-col justify-between shadow-sm">
                      <div className="mb-4">
                        <h4 className="text-foreground font-bold font-sans">Accuracy (%)</h4>
                        <p className="text-xs text-muted-foreground">Target sound identification accuracy trend</p>
                      </div>
                      <div className="w-full h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                            <YAxis domain={[0, 100]} stroke="#888888" fontSize={11} tickLine={false} />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-card border border-border p-4 rounded-2xl shadow-xl">
                                      <p className="font-bold text-foreground mb-1 text-xs">{data.gameName}</p>
                                      <p className="text-[10px] text-muted-foreground mb-2">{data.level} • {data.date}</p>
                                      <p className="text-xs font-bold text-[#f43f5e]">Accuracy: {data.accuracy}%</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area type="monotone" dataKey="accuracy" stroke="#f43f5e" strokeWidth={3} fill="url(#accuracyGrad)" activeDot={{ r: 6 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Chart 2: Score Progression */}
                    <div className="bg-card p-6 rounded-[2rem] border border-border flex flex-col justify-between shadow-sm">
                      <div className="mb-4">
                        <h4 className="text-foreground font-bold font-sans">Score</h4>
                        <p className="text-xs text-muted-foreground">Points achieved per gameplay session</p>
                      </div>
                      <div className="w-full h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                            <YAxis domain={['auto', 'auto']} stroke="#888888" fontSize={11} tickLine={false} />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-card border border-border p-4 rounded-2xl shadow-xl">
                                      <p className="font-bold text-foreground mb-1 text-xs">{data.gameName}</p>
                                      <p className="text-[10px] text-muted-foreground mb-2">{data.level} • {data.date}</p>
                                      <p className="text-xs font-bold text-[#3b82f6]">Score: {data.score}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fill="url(#scoreGrad)" activeDot={{ r: 6 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Chart 3: Speed / Time Taken */}
                    <div className="bg-card p-6 rounded-[2rem] border border-border flex flex-col justify-between shadow-sm">
                      <div className="mb-4">
                        <h4 className="text-foreground font-bold font-sans">Time Taken (Seconds)</h4>
                        <p className="text-xs text-muted-foreground">Duration of session in seconds</p>
                      </div>
                      <div className="w-full h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                            <YAxis domain={['auto', 'auto']} stroke="#888888" fontSize={11} tickLine={false} />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-card border border-border p-4 rounded-2xl shadow-xl">
                                      <p className="font-bold text-foreground mb-1 text-xs">{data.gameName}</p>
                                      <p className="text-[10px] text-muted-foreground mb-2">{data.level} • {data.date}</p>
                                      <p className="text-xs font-bold text-[#10b981]">Time Taken: {data.timeSeconds}s ({data.timeString})</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area type="monotone" dataKey="timeSeconds" stroke="#10b981" strokeWidth={3} fill="url(#speedGrad)" activeDot={{ r: 6 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Task Assignment View */}
        {activeView === 'tasks' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h1 className="text-foreground">Task Assignments</h1>
              
              {/* Selectors */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-64">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Select Progressor</label>
                  <select
                    value={selectedProgressor?.id || ''}
                    onChange={(e) => {
                      const prog = progressors.find(p => p.id === e.target.value);
                      setSelectedProgressor(prog || null);
                    }}
                    className="w-full px-4 py-3 rounded-[1rem] bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-bold transition-all"
                  >
                    <option value="">-- Select Progressor --</option>
                    {progressors.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                {selectedProgressor && (
                  <div className="flex items-end">
                    <button
                      onClick={handleSaveAssignments}
                      disabled={savingAssignments}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-[1.25rem] bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {savingAssignments ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                          Saving...
                        </>
                      ) : 'Save Assignments'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {selectedProgressor ? (
              <div className="space-y-6">
                <div className="bg-card p-6 rounded-[1.5rem] border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-1">Assign levels for {selectedProgressor.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Click levels to toggle assignments. Levels 1 & 2 are open by default, levels 3-10 must be explicitly assigned to unlock.</p>
                  
                  {/* Summary of currently selected levels */}
                  <div className="flex flex-wrap gap-2 mb-4 p-4 rounded-xl bg-secondary/20 border border-border">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider self-center mr-2">Assigned:</span>
                    {selectedLevelsToAssign.length === 0 ? (
                      <span className="text-sm text-muted-foreground italic">No levels assigned yet (locked to Levels 1 & 2)</span>
                    ) : (
                      selectedLevelsToAssign.map(key => {
                        const parts = key.split('-');
                        const gameId = parts.slice(0, -1).join('-');
                        const level = parts[parts.length - 1];
                        const gameName = GAMES.find(g => g.id === gameId)?.name || gameId;
                        return (
                          <span key={key} className="text-xs bg-primary/15 text-primary px-3 py-1 rounded-[1rem] font-bold border border-primary/25">
                            {gameName} Lvl {level}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {GAMES.map((game) => {
                    const Icon = game.icon;
                    const gameAssignedCount = selectedLevelsToAssign.filter(l => l.startsWith(`${game.id}-`)).length;
                    
                    return (
                      <div key={game.id} className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm flex flex-col justify-between">
                        <button
                          onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
                          className="w-full p-6 hover:bg-secondary/20 transition-all text-left flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-foreground">{game.name}</h3>
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{gameAssignedCount} levels assigned</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                            {selectedGame === game.id ? 'Collapse' : 'Expand'}
                          </span>
                        </button>

                        {selectedGame === game.id && (
                          <div className="p-6 pt-0 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 mt-4">Select Levels:</p>
                            <div className="grid grid-cols-5 gap-2">
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                                const levelKey = `${game.id}-${level}`;
                                const isAssigned = selectedLevelsToAssign.includes(levelKey);
                                
                                return (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() => {
                                      if (isAssigned) {
                                        setSelectedLevelsToAssign(prev => prev.filter(k => k !== levelKey));
                                      } else {
                                        setSelectedLevelsToAssign(prev => [...prev, levelKey]);
                                      }
                                    }}
                                    className={`aspect-square rounded-[1rem] transition-all duration-200 shadow-md font-bold text-sm relative flex items-center justify-center border hover:scale-105 active:scale-95 ${
                                      isAssigned
                                        ? 'bg-primary border-primary text-primary-foreground shadow-primary/20 shadow-lg scale-105 font-extrabold'
                                        : 'bg-secondary border-border text-foreground hover:bg-secondary-accent'
                                    }`}
                                  >
                                    {level}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-[2rem] border border-border p-8 animate-in fade-in">
                <p className="text-muted-foreground">Select a progressor from the dropdown to view level assignments</p>
              </div>
            )}
          </div>
        )}
        {/* Notifications View */}
        {activeView === 'notifications' && (
          <div>
            <h1 className="mb-8 text-foreground">Activity Notifications</h1>

            {loadingNotifications ? (
              <div className="flex flex-col items-center justify-center py-20 bg-card rounded-[2rem] border border-border p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Fetching recent activities...</p>
              </div>
            ) : notificationsSessions.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-[2rem] border border-border p-8">
                <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-foreground text-lg mb-2">No Recent Activity</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">There are no recent gameplay sessions recorded for any of your assigned progressors.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notificationsSessions.map((session) => {
                  const progressor = progressors.find(p => p.id === session.progressor_id);
                  const progressorName = progressor ? progressor.name : 'Unknown Progressor';
                  const game = GAMES.find(g => g.id === session.game_id);
                  const gameName = game ? game.name : session.game_id;
                  const GameIcon = game ? game.icon : Bell;
                  
                  const levelKey = `${session.game_id}-${session.level}`;
                  const isAssigned = progressor?.assignedLevels?.includes(levelKey) || false;
                  const isCompleted = session.accuracy >= 60;
                  
                  // Format activity message
                  const activityText = isCompleted
                    ? `${progressorName} completed ${gameName} Level ${session.level}`
                    : `${progressorName} attempted ${gameName} Level ${session.level}`;

                  return (
                    <div 
                      key={session.id} 
                      className={`bg-card p-6 rounded-[1.5rem] border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCompleted 
                          ? isAssigned 
                            ? 'border-green-500/30 shadow-[0_4px_12px_rgba(34,197,94,0.05)] bg-green-500/[0.01]' 
                            : 'border-border'
                          : 'border-border opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? isAssigned 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-primary/10 text-primary'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {isCompleted ? <GameIcon className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        </div>
                        
                        <div>
                          <p className="text-foreground font-bold font-sans text-base leading-snug">
                            {activityText}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground font-mono">
                              {new Date(session.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground font-semibold">
                              Score: {session.score}/10
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground font-semibold">
                              Accuracy: {session.accuracy}%
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground font-semibold">
                              Duration: {session.time_taken}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50">
                        {isCompleted ? (
                          isAssigned ? (
                            <span className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-[1rem] font-bold font-sans">
                              Assigned Task
                            </span>
                          ) : (
                            <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-[1rem] font-bold font-sans">
                              Independent
                            </span>
                          )
                        ) : (
                          <span className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-[1rem] font-bold font-sans">
                            Practice Run
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">
                          ID: {session.progressor_id}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Progressor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-in fade-in">
          <div className="bg-card rounded-[2rem] p-8 max-w-md w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground font-sans font-semibold" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>Create New Progressor</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-foreground font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>Progressor Name</label>
                <input
                  type="text"
                  value={newProgressorName}
                  onChange={(e) => setNewProgressorName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block mb-2 text-foreground font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>Age</label>
                <input
                  type="number"
                  value={newProgressorAge}
                  onChange={(e) => setNewProgressorAge(e.target.value)}
                  placeholder="Enter age"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block mb-2 text-foreground font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>Assigned Email</label>
                <input
                  type="email"
                  value={newProgressorEmail}
                  onChange={(e) => setNewProgressorEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block mb-2 text-foreground font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>Parent's Full Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Parent's Full Name"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
              </div>

              <button
                onClick={handleCreateProgressor}
                className="w-full px-8 py-4 rounded-[2rem] bg-[#FF6B4A] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-bold font-sans"
                style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}
              >
                Generate Progressor ID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && progressorToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-in fade-in">
          <div className="bg-card rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground font-sans font-semibold text-xl" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>
                Confirm Deletion
              </h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProgressorToDelete(null);
                }}
                className="p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center py-2">
                <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-[#FF6B4A]" />
                <p className="text-foreground font-sans leading-relaxed text-base" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>
                  Are you sure you want to delete this Progressor ID? This action cannot be undone.
                </p>
                <p className="text-sm text-muted-foreground font-mono mt-2" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                  ID: {progressorToDelete.id} • {progressorToDelete.name}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleDeleteProgressor}
                  className="flex-1 px-6 py-3.5 rounded-[1.5rem] bg-[#FF6B4A] text-white hover:scale-105 active:scale-95 transition-all duration-300 font-bold font-sans"
                  style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProgressorToDelete(null);
                  }}
                  className="flex-1 px-6 py-3.5 rounded-[1.5rem] bg-secondary hover:bg-muted text-foreground border border-border hover:scale-105 active:scale-95 transition-all duration-300 font-sans"
                  style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedDetailsProgressor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-in fade-in">
          <div className="bg-card rounded-[2rem] p-8 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in duration-300 border border-border overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-semibold text-foreground font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>
                  Details: {selectedDetailsProgressor.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                  Progressor ID: {selectedDetailsProgressor.id}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedDetailsProgressor(null);
                  setSessions([]);
                  setDetailsActiveTab('progression');
                }}
                className="p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-6 mb-6 border-b border-border pb-1 flex-shrink-0">
              <button
                onClick={() => setDetailsActiveTab('progression')}
                className={`pb-2 px-1 text-sm font-bold transition-all relative ${
                  detailsActiveTab === 'progression'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Game Progression
              </button>
              <button
                onClick={() => setDetailsActiveTab('history')}
                className={`pb-2 px-1 text-sm font-bold transition-all relative ${
                  detailsActiveTab === 'history'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Session History
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto pr-2 min-h-0">
              {detailsActiveTab === 'progression' && (
                <div>
                  {!selectedDetailsProgressor.completedLevels || selectedDetailsProgressor.completedLevels.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                      <Award className="w-16 h-16 mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground text-lg font-sans font-medium" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>
                        No game data available for this progressor yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                      {GAMES.map((game) => {
                        const Icon = game.icon;
                        const completed = selectedDetailsProgressor.completedLevels || [];
                        const gameCompletedCount = completed.filter(l => l.startsWith(`${game.id}-`)).length;

                        return (
                          <div key={game.id} className="bg-secondary/15 rounded-[1.5rem] p-6 border border-border">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                  <Icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-base font-bold text-foreground">{game.name}</h3>
                              </div>
                              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-[1rem] font-bold">
                                {gameCompletedCount}/10 Level{gameCompletedCount !== 1 ? 's' : ''}
                              </span>
                            </div>

                            <div className="grid grid-cols-5 gap-2">
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                                const levelKey = `${game.id}-${level}`;
                                const isDone = completed.includes(levelKey);
                                const isAssigned = (selectedDetailsProgressor.assignedLevels || []).includes(levelKey);

                                return (
                                  <div
                                    key={level}
                                    className={`aspect-square rounded-[0.75rem] flex flex-col items-center justify-center font-bold text-xs transition-all relative ${
                                      isDone
                                        ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                                        : isAssigned
                                          ? 'bg-secondary border-2 border-primary/50 text-foreground'
                                          : 'bg-secondary text-muted-foreground border border-border opacity-40'
                                    }`}
                                    title={isDone ? `Level ${level} Completed` : isAssigned ? `Level ${level} Assigned & Uncompleted` : `Level ${level} Locked/Not Done`}
                                  >
                                    <span>{level}</span>
                                    {isAssigned && !isDone && (
                                      <span className="w-1.5 h-1.5 bg-primary rounded-full absolute bottom-1" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {detailsActiveTab === 'history' && (
                <div>
                  {loadingSessions ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF6B4A] mb-4"></div>
                      <p className="text-muted-foreground font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>Loading session history...</p>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-20">
                      <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground font-sans font-medium" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>No session records found for this progressor.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-border rounded-xl pb-4">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-secondary/50">
                          <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>
                              Game ID
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>
                              Game Level
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>
                              Score achieved
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>
                              Accuracy percentage
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>
                              Session Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                          {sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-secondary/30 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground font-sans" style={{ fontFamily: "'Google Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif" }}>
                                {session.game_id === 'phoneme-pop' ? 'Phoneme Pop' :
                                  session.game_id === 'position-pilot' ? 'Position Pilot' :
                                    session.game_id === 'sound-trail' ? 'Sound Trail' :
                                      session.game_id === 'sound-synk' ? 'Sound Synk' :
                                        session.game_id === 'sound-sorter' ? 'Sound Sorter' : session.game_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                                Level {session.level}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                                {session.score}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                                {session.accuracy}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                                {new Date(session.created_at).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <LogoutConfirmModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogoutConfirm} 
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        role="practitioner"
        userId={currentPractitionerId || ''}
        userData={userData}
        onUpdate={(newAvatarUrl) => {
          setUserData(prev => prev ? { ...prev, avatar_url: newAvatarUrl } : null);
        }}
      />
    </div>
  );
}
