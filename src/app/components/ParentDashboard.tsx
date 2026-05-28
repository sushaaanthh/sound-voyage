import { useParams, useNavigate } from 'react-router';
import { Home, Clock, TrendingUp, MessageSquare, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ThemeToggle } from './ThemeToggle';

const weeklyData = [
  { day: 'Mon', minutes: 25 },
  { day: 'Tue', minutes: 30 },
  { day: 'Wed', minutes: 20 },
  { day: 'Thu', minutes: 35 },
  { day: 'Fri', minutes: 28 },
  { day: 'Sat', minutes: 15 },
  { day: 'Sun', minutes: 22 },
];

const gamePerformance = [
  { game: 'Phoneme Pop', score: 85 },
  { game: 'Position Pilot', score: 78 },
  { game: 'Sound Trail', score: 82 },
  { game: 'Sound Synk', score: 70 },
  { game: 'Sound Sorter', score: 88 },
];

const psychologistNotes = [
  {
    id: 1,
    date: '2026-04-24',
    message: 'Sushanth is doing great with beginning sounds! Keep up the excellent work.',
    type: 'positive',
  },
  {
    id: 2,
    date: '2026-04-22',
    message: 'Focus on middle sound identification this week. Good progress overall.',
    type: 'note',
  },
  {
    id: 3,
    date: '2026-04-20',
    message: 'Excellent improvement in Sound Sorter game. Very proud!',
    type: 'positive',
  },
];

export default function ParentDashboard() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const totalMinutes = weeklyData.reduce((sum, day) => sum + day.minutes, 0);
  const topGame = gamePerformance.reduce((prev, current) =>
    prev.score > current.score ? prev : current
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="mb-1">Hey {patientId}'s Parent</h1>
            <p className="text-muted-foreground">Observation Deck - View Only Access</p>
          </div>

          <div className="flex items-center gap-4">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Weekly Play Time */}
          <div className="bg-card rounded-[2rem] border border-border p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-[1.5rem] bg-primary/10">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Play Time</p>
                <h2>{totalMinutes} mins</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">This week</p>
          </div>

          {/* Top Performing Game */}
          <div className="bg-card rounded-[2rem] border border-border p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-[1.5rem] bg-primary/10">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Game</p>
                <h3>{topGame.game}</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{topGame.score}% accuracy</p>
          </div>

          {/* Overall Progress */}
          <div className="bg-card rounded-[2rem] border border-border p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-[1.5rem] bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <h2>Excellent</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Above average</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Weekly Play Time Chart */}
          <div className="bg-card rounded-[2rem] border border-border p-8">
            <h3 className="mb-6">Weekly Play Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutes" fill="#FF6347" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Game Performance Chart */}
          <div className="bg-card rounded-[2rem] border border-border p-8">
            <h3 className="mb-6">Game Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gamePerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="game" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="score" fill="#FF6347" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Psychologist Feed */}
        <div className="bg-card rounded-[2rem] border border-border p-8">
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h2>Psychologist Updates</h2>
          </div>

          <div className="space-y-4">
            {psychologistNotes.map((note) => (
              <div
                key={note.id}
                className={`p-6 rounded-[1.5rem] border ${
                  note.type === 'positive'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-secondary border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-muted-foreground">{note.date}</p>
                  {note.type === 'positive' && (
                    <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs">
                      Positive Feedback
                    </span>
                  )}
                </div>
                <p>{note.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-12 p-6 rounded-[2rem] bg-primary/10 border border-primary/20 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h3 className="mb-2">View-Only Access</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            As a parent, you have read-only access to monitor your child's progress. For task
            assignments or detailed analytics, please contact your assigned psychologist.
          </p>
        </div>
      </div>
    </div>
  );
}
