import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, X, Trash2, History, ShieldAlert, Eye, TrendingUp, Home, Users, BarChart3, Target, Map, Route, Shuffle, PackageSearch, LucideIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ThemeToggle } from './ThemeToggle';
import { supabase } from '../../lib/supabase';

interface Progressor {
  id: string;
  name: string;
  age: number;
  lastSession: string;
  assignedEmail?: string;
}

interface GameSession {
  id: string;
  game_id: string;
  level: number;
  score: number;
  accuracy: number;
  time_taken: string;
  created_at: string;
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

const mockProgressors: Progressor[] = [
  { id: 'E001', name: 'Sushanth Kumar', age: 8, lastSession: '2026-04-20' },
  { id: 'E002', name: 'Priya Sharma', age: 10, lastSession: '2026-04-22' },
  { id: 'E003', name: 'Rohan Patel', age: 7, lastSession: '2026-04-18' },
];

const mockAnalytics = [
  { week: 'Week 1', phonemePop: 65, positionPilot: 70, soundTrail: 60, soundSynk: 55, soundSorter: 68 },
  { week: 'Week 2', phonemePop: 72, positionPilot: 75, soundTrail: 68, soundSynk: 62, soundSorter: 74 },
  { week: 'Week 3', phonemePop: 78, positionPilot: 82, soundTrail: 75, soundSynk: 70, soundSorter: 80 },
  { week: 'Week 4', phonemePop: 85, positionPilot: 88, soundTrail: 82, soundSynk: 78, soundSorter: 86 },
];

export default function PractitionerDashboard() {
  const [activeView, setActiveView] = useState<'progressors' | 'analytics' | 'tasks'>('progressors');
  const [selectedProgressor, setSelectedProgressor] = useState<Progressor | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProgressorName, setNewProgressorName] = useState('');
  const [newProgressorAge, setNewProgressorAge] = useState('');
  const [newProgressorEmail, setNewProgressorEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [progressors, setProgressors] = useState<Progressor[]>(mockProgressors);

  // Deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [progressorToDelete, setProgressorToDelete] = useState<Progressor | null>(null);

  // View details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsProgressor, setSelectedDetailsProgressor] = useState<Progressor | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const navigate = useNavigate();

  // Setup dynamic loading of progressors
  useEffect(() => {
    const fetchProgressors = async () => {
      try {
        const { data, error } = await supabase
          .from('progressors')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching progressors:', error.message);
        } else if (data && data.length > 0) {
          setProgressors(data.map(p => ({
            id: p.id,
            name: p.name || 'Unnamed Progressor',
            age: p.age || 0,
            assignedEmail: p.assigned_email || '',
            lastSession: p.last_session || 'No sessions yet'
          })));
        }
      } catch (err) {
        console.error('Failed to load progressors:', err);
      }
    };
    fetchProgressors();
  }, []);

  const filteredProgressors = progressors.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProgressor = async () => {
    const nextNum = progressors.length + 1;
    const newId = `E${String(nextNum).padStart(3, '0')}`;

    try {
      // Get practitioner auth session
      const { data: { user } } = await supabase.auth.getUser();
      const practitionerId = user?.id || null;

      // 1. Insert into progressor_ids table
      const { error: idError } = await supabase
        .from('progressor_ids')
        .insert([
          {
            id: newId,
            practitioner_id: practitionerId,
            is_claimed: false,
            assigned_email: newProgressorEmail || null
          }
        ]);

      if (idError) {
        console.error('Error inserting progressor ID:', idError.message);
        alert('Failed to generate Progressor ID: ' + idError.message);
        return;
      }

      // 2. Insert into progressors profile table
      const { error: profileError } = await supabase
        .from('progressors')
        .insert([
          {
            id: newId,
            name: newProgressorName,
            age: parseInt(newProgressorAge, 10) || 0,
            completed_levels: [],
            assigned_email: newProgressorEmail || null
          }
        ]);

      if (profileError) {
        console.error('Error creating progressor profile:', profileError.message);
        alert('ID generated in progressor_ids, but profile creation failed: ' + profileError.message);
        return;
      }

      // Update state list
      const newProgressor: Progressor = {
        id: newId,
        name: newProgressorName,
        age: parseInt(newProgressorAge, 10) || 0,
        assignedEmail: newProgressorEmail || '',
        lastSession: 'No sessions yet'
      };

      setProgressors(prev => [...prev, newProgressor]);
      alert(`New Progressor Created!\nProgressor ID: ${newId}\nName: ${newProgressorName}\nAge: ${newProgressorAge}`);
    } catch (err) {
      console.error('Failed to create progressor:', err);
      alert('An unexpected error occurred during progressor creation.');
    } finally {
      setShowCreateModal(false);
      setNewProgressorName('');
      setNewProgressorAge('');
      setNewProgressorEmail('');
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
      // 1. Delete from progressors profile table
      const { error: profileError } = await supabase
        .from('progressors')
        .delete()
        .eq('id', progressorToDelete.id);

      if (profileError) {
        console.error('Error deleting progressor profile:', profileError.message);
      }

      // 2. Delete from progressor_ids table
      const { error: idError } = await supabase
        .from('progressor_ids')
        .delete()
        .eq('id', progressorToDelete.id);

      if (idError) {
        console.error('Error deleting progressor ID:', idError.message);
      }

      setProgressors(prev => prev.filter(p => p.id !== progressorToDelete.id));
      alert(`Progressor ${progressorToDelete.name} has been deleted successfully.`);
    } catch (err) {
      console.error('Failed to delete progressor:', err);
    } finally {
      setShowDeleteModal(false);
      setProgressorToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-72 bg-sidebar border-r border-sidebar-border p-6 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="mb-12">
          <h2 className="mb-2 text-foreground" style={{ fontSize: '1.75rem' }}>Clinical Dashboard</h2>
          <p className="text-sm text-muted-foreground">Practitioner Portal</p>
        </div>

        <nav className="space-y-3">
          <button
            onClick={() => setActiveView('progressors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 ${
              activeView === 'progressors'
                ? 'bg-primary text-primary-foreground shadow-lg font-bold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
          >
            <Users className="w-5 h-5" />
            Progressor Registry
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 ${
              activeView === 'analytics'
                ? 'bg-primary text-primary-foreground shadow-lg font-bold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>

          <button
            onClick={() => setActiveView('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 ${
              activeView === 'tasks'
                ? 'bg-primary text-primary-foreground shadow-lg font-bold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Task Assignments
          </button>
        </nav>

        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] text-sidebar-foreground hover:bg-sidebar-accent hover:scale-105 active:scale-95 transition-all mt-auto absolute bottom-6"
        >
          <Home className="w-5 h-5" />
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
                className="w-full pl-14 pr-6 py-4 rounded-[2rem] bg-[#F2F5F3] border border-border focus:outline-none focus:ring-2 focus:ring-primary text-[#24292E] placeholder-muted-foreground"
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
                        ID: {progressor.id} • Age: {progressor.age} • Last Session: {progressor.lastSession}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(progressor);
                        }}
                        className="px-4 py-2 rounded-[1rem] bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 font-bold font-sans"
                        style={{ fontFamily: "'Inter', sans-serif" }}
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
            <h1 className="mb-8 text-foreground">Analytics Dashboard</h1>

            {selectedProgressor ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-foreground">{selectedProgressor.name}</h2>
                    <p className="text-muted-foreground">Progress Overview</p>
                  </div>
                  <button
                    onClick={() => setSelectedProgressor(null)}
                    className="px-6 py-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300 text-foreground border border-border"
                  >
                    Back to List
                  </button>
                </div>

                <div className="bg-card p-8 rounded-[2rem] border border-border">
                  <h3 className="mb-6 text-foreground">Progressor Progress Across All Games</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={mockAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="phonemePop" stroke="#FF6347" strokeWidth={3} name="Phoneme Pop" />
                      <Line type="monotone" dataKey="positionPilot" stroke="#4169E1" strokeWidth={3} name="Position Pilot" />
                      <Line type="monotone" dataKey="soundTrail" stroke="#32CD32" strokeWidth={3} name="Sound Trail" />
                      <Line type="monotone" dataKey="soundSynk" stroke="#FFD700" strokeWidth={3} name="Sound Synk" />
                      <Line type="monotone" dataKey="soundSorter" stroke="#9370DB" strokeWidth={3} name="Sound Sorter" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <BarChart3 className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select a progressor from the Progressor Registry to view analytics</p>
              </div>
            )}
          </div>
        )}

        {/* Task Assignment View */}
        {activeView === 'tasks' && (
          <div>
            <h1 className="mb-8 text-foreground">Task Assignments</h1>

            {selectedProgressor ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-foreground">Assign Tasks to {selectedProgressor.name}</h2>
                    <p className="text-muted-foreground">Select a game and level</p>
                  </div>
                  <button
                    onClick={() => setSelectedProgressor(null)}
                    className="px-6 py-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300 text-foreground border border-border"
                  >
                    Back to List
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {GAMES.map((game) => {
                    const Icon = game.icon;
                    return (
                      <div key={game.id} className="bg-card rounded-[2rem] border border-border overflow-hidden">
                        <button
                          onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
                          className="w-full p-6 hover:bg-secondary/50 hover:scale-105 active:scale-95 transition-all text-foreground"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-[#FF6347]/10 flex items-center justify-center mb-3 mx-auto">
                            <Icon className="w-10 h-10 text-[#FF6347]" />
                          </div>
                          <h3 className="text-lg text-foreground">{game.name}</h3>
                        </button>

                        {selectedGame === game.id && (
                          <div className="p-6 pt-0">
                            <p className="text-sm text-muted-foreground mb-4">Select Levels to Assign:</p>
                            <div className="grid grid-cols-5 gap-2">
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                                <button
                                  key={level}
                                  className="aspect-square rounded-[1rem] bg-[#FF6347] text-white hover:scale-110 active:scale-95 transition-all shadow-md font-bold"
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <TrendingUp className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select a progressor from the Progressor Registry to assign tasks</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Progressor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-in fade-in">
          <div className="bg-card rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground font-sans font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>Create New Progressor</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-foreground font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>Progressor Name</label>
                <input
                  type="text"
                  value={newProgressorName}
                  onChange={(e) => setNewProgressorName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-[#F2F5F3] border border-border focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] text-[#24292E] placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block mb-2 text-foreground font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>Age</label>
                <input
                  type="number"
                  value={newProgressorAge}
                  onChange={(e) => setNewProgressorAge(e.target.value)}
                  placeholder="Enter age"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-[#F2F5F3] border border-border focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] text-[#24292E] placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block mb-2 text-foreground font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>Assigned Email</label>
                <input
                  type="email"
                  value={newProgressorEmail}
                  onChange={(e) => setNewProgressorEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-[#F2F5F3] border border-border focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] text-[#24292E] placeholder-muted-foreground"
                />
              </div>

              <button
                onClick={handleCreateProgressor}
                className="w-full px-8 py-4 rounded-[2rem] bg-[#FF6B4A] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-bold font-sans"
                style={{ fontFamily: "'Inter', sans-serif" }}
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
              <h2 className="text-foreground font-sans font-semibold text-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                <p className="text-foreground font-sans leading-relaxed text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProgressorToDelete(null);
                  }}
                  className="flex-1 px-6 py-3.5 rounded-[1.5rem] bg-secondary hover:bg-muted text-foreground border border-border hover:scale-105 active:scale-95 transition-all duration-300 font-sans"
                  style={{ fontFamily: "'Inter', sans-serif" }}
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
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-semibold text-foreground font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Session History: {selectedDetailsProgressor.name}
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
                }}
                className="p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable table container with explicit padding boundaries */}
            <div className="flex-1 overflow-y-auto pr-2 min-h-0">
              {loadingSessions ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF6B4A] mb-4"></div>
                  <p className="text-muted-foreground font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>Loading session history...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-20">
                  <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>No session records found for this progressor.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Game ID
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Game Level
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Score achieved
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Accuracy percentage
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Session Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
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
          </div>
        </div>
      )}
    </div>
  );
}
