import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, X, TrendingUp, Home, Users, BarChart3, Target, Map, Route, Shuffle, PackageSearch, LucideIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ThemeToggle } from './ThemeToggle';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastSession: string;
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

const mockPatients: Patient[] = [
  { id: 'P001', name: 'Sushanth Kumar', age: 8, lastSession: '2026-04-20' },
  { id: 'P002', name: 'Priya Sharma', age: 10, lastSession: '2026-04-22' },
  { id: 'P003', name: 'Rohan Patel', age: 7, lastSession: '2026-04-18' },
];

const mockAnalytics = [
  { week: 'Week 1', phonemePop: 65, positionPilot: 70, soundTrail: 60, soundSynk: 55, soundSorter: 68 },
  { week: 'Week 2', phonemePop: 72, positionPilot: 75, soundTrail: 68, soundSynk: 62, soundSorter: 74 },
  { week: 'Week 3', phonemePop: 78, positionPilot: 82, soundTrail: 75, soundSynk: 70, soundSorter: 80 },
  { week: 'Week 4', phonemePop: 85, positionPilot: 88, soundTrail: 82, soundSynk: 78, soundSorter: 86 },
];

export default function PsychologistDashboard() {
  const [activeView, setActiveView] = useState<'patients' | 'analytics' | 'tasks'>('patients');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredPatients = mockPatients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePatient = () => {
    const newId = `P${String(mockPatients.length + 1).padStart(3, '0')}`;
    alert(`New Patient Created!\nPatient ID: ${newId}\nName: ${newPatientName}\nAge: ${newPatientAge}`);
    setShowCreateModal(false);
    setNewPatientName('');
    setNewPatientAge('');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-72 bg-sidebar border-r border-sidebar-border p-6 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="mb-12">
          <h2 className="mb-2" style={{ fontSize: '1.75rem' }}>Clinical Dashboard</h2>
          <p className="text-sm text-muted-foreground">Practitioner Portal</p>
        </div>

        <nav className="space-y-3">
          <button
            onClick={() => setActiveView('patients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 ${
              activeView === 'patients'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
          >
            <Users className="w-5 h-5" />
            Patient Registry
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 ${
              activeView === 'analytics'
                ? 'bg-primary text-primary-foreground shadow-lg'
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
                ? 'bg-primary text-primary-foreground shadow-lg'
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
        {/* Patient Registry View */}
        {activeView === 'patients' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1>Patient Registry</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-[2rem] bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Create New Patient
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search patients by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-[2rem] bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Patient List */}
            <div className="grid gap-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-card p-6 rounded-[2rem] border border-border hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3>{patient.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        ID: {patient.id} • Age: {patient.age} • Last Session: {patient.lastSession}
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-[1rem] bg-primary/10 text-primary">
                      View Details
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
            <h1 className="mb-8">Analytics Dashboard</h1>

            {selectedPatient ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2>{selectedPatient.name}</h2>
                    <p className="text-muted-foreground">Progress Overview</p>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="px-6 py-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Back to List
                  </button>
                </div>

                <div className="bg-card p-8 rounded-[2rem] border border-border">
                  <h3 className="mb-6">Weekly Progress Across All Games</h3>
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
                <p className="text-muted-foreground">Select a patient from the Patient Registry to view analytics</p>
              </div>
            )}
          </div>
        )}

        {/* Task Assignment View */}
        {activeView === 'tasks' && (
          <div>
            <h1 className="mb-8">Task Assignments</h1>

            {selectedPatient ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2>Assign Tasks to {selectedPatient.name}</h2>
                    <p className="text-muted-foreground">Select a game and level</p>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="px-6 py-3 rounded-[1.5rem] bg-secondary hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300"
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
                          className="w-full p-6 hover:bg-secondary/50 hover:scale-105 active:scale-95 transition-all"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 mx-auto">
                            <Icon className="w-10 h-10 text-primary" />
                          </div>
                          <h3 className="text-lg">{game.name}</h3>
                        </button>

                        {selectedGame === game.id && (
                          <div className="p-6 pt-0">
                            <p className="text-sm text-muted-foreground mb-4">Select Levels to Assign:</p>
                            <div className="grid grid-cols-5 gap-2">
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                                <button
                                  key={level}
                                  className="aspect-square rounded-[1rem] bg-primary text-primary-foreground hover:scale-110 active:scale-95 transition-all shadow-md"
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
                <p className="text-muted-foreground">Select a patient from the Patient Registry to assign tasks</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Patient Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-in fade-in">
          <div className="bg-card rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2>Create New Patient</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block mb-2">Patient Name</label>
                <input
                  type="text"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block mb-2">Age</label>
                <input
                  type="number"
                  value={newPatientAge}
                  onChange={(e) => setNewPatientAge(e.target.value)}
                  placeholder="Enter age"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleCreatePatient}
                className="w-full px-8 py-4 rounded-[2rem] bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Generate Patient ID
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
