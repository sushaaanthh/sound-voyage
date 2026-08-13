# Sound Voyage

**A clinical phonological awareness platform for speech-language pathologists and children.**

Sound Voyage is a web-based cognitive assessment tool built for Samvidh Psych Services. It delivers structured, game-based phonological exercises that help children develop sound awareness, improve articulation, and build the cognitive foundations for reading and language. Practitioners manage child profiles, assign targeted levels, and track progress through a dedicated analytics dashboard.

---

## Features

### For Practitioners
- Secure login with practitioner-specific dashboard
- Create and manage child profiles (Progressors) with unique short IDs
- Assign specific game levels to children
- View per-child session history, accuracy trends, and earned badges
- Recharts-powered analytics with session data visualisations

### For Children (Progressors)
- Five distinct phonological games, each with progressive difficulty levels
- Real-time audio feedback using a layered TTS pipeline (HuggingFace → SpeechSynthesis)
- Indian-English voice targeting for culturally appropriate pronunciation
- Mastery badges awarded on game completion
- Bell/buzzer sound feedback on correct and incorrect answers
- Light / dark mode toggle

### For Parents
- Linked parent accounts to monitor their child's assigned levels and progress

---

## Games

| Game | Description |
|---|---|
| **Phoneme Pop** | Identify whether a word contains the target sound. Covers binary, multiple-choice, select-all, and position mechanics across levels. |
| **Position Pilot** | Determine whether the target sound appears at the start, middle, or end of a spoken word. |
| **Sound Trail** | Navigate a word-graph by identifying phoneme transitions between words. Levels 6+ activate Working Memory Mode. |
| **Sound Synk** | Memory-match card game pairing words that share phonological properties. |
| **Sound Sorter** | Arrange phoneme tiles into the correct sequence to spell a word. |

All games track accuracy, time taken, and missed words. Passing threshold is **60% accuracy**. Level unlock in the database requires **70% accuracy**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Build Tool | Vite 6 + `@vitejs/plugin-react` |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + CSS custom properties |
| Routing | React Router v7 (`createBrowserRouter`) |
| Backend | Supabase (Postgres + Auth + Realtime) |
| Animation | Motion (`motion/react`) |
| Charts | Recharts |
| TTS (Primary) | HuggingFace Inference API — `espnet/kan-bayashi_ljspeech_vits` |
| TTS (Fallback) | Web Speech API (`SpeechSynthesisUtterance`) with Indian-English voice lock |
| AI | Google Generative AI (Gemini) |
| Icons | Lucide React |
| Toasts | Sonner |
| Package Manager | pnpm |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── App.tsx                    # Root with providers
│   ├── routes.tsx                 # All client-side routes
│   ├── components/
│   │   ├── LandingPage.tsx        # Auth + role-based routing
│   │   ├── PractitionerDashboard.tsx
│   │   ├── ProgressorDashboard.tsx
│   │   ├── ParentDashboard.tsx
│   │   ├── GameScreen.tsx         # Game router
│   │   ├── ResultScreen.tsx       # Scoring, badges, confetti
│   │   ├── games/                 # Individual game engines
│   │   └── ui/                    # Radix/shadcn UI primitives
│   └── context/
│       └── GameSessionContext.tsx # Global session + badge state
├── data/                          # Static game level data
├── hooks/
│   └── useAudioCache.ts           # HuggingFace TTS pre-fetch hook
├── lib/
│   ├── audioUtils.ts              # TTS + phoneme translation engine
│   ├── supabase.ts                # Supabase singleton client
│   ├── telemetryUtils.ts          # Session DB writes + level unlock logic
│   └── gemini.ts                  # Gemini AI client
├── utils/
│   └── huggingFaceTTS.ts          # HF Inference API fetch helper
└── styles/
    ├── theme.css                  # Design tokens (light + dark)
    └── fonts.css                  # Font-face declarations
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_DB_URL=your_supabase_project_url
VITE_DB_ANON_KEY=your_supabase_anon_key
VITE_HF_API_KEY=your_huggingface_api_key
```

| Variable | Description |
|---|---|
| `VITE_DB_URL` | Your Supabase project URL |
| `VITE_DB_ANON_KEY` | Supabase `anon` public key |
| `VITE_HF_API_KEY` | HuggingFace API key for TTS inference |

### Development

```bash
pnpm dev
```

The app runs at `http://localhost:5173` by default.

### Production Build

```bash
pnpm build
```

---

## Database

Sound Voyage uses Supabase with the following core tables:

- `practitioners` — clinician accounts linked to Supabase Auth
- `parents` — parent accounts linked to Supabase Auth
- `progressors` — child profiles with `completed_levels`, `assigned_levels`, and `earned_badges` arrays
- `game_sessions` — full telemetry log of every completed game session
- `progressor_ids` — pre-generated short IDs issued by practitioners for child self-registration

Row Level Security (RLS) is enabled on all tables. The `progressor_ids` table allows public `SELECT` and `UPDATE` for the registration claim flow, and `INSERT` only for authenticated practitioners.

---

## Attributions

See [`ATTRIBUTIONS.md`](./ATTRIBUTIONS.md) for third-party asset credits.

---

*Built for Samvidh Psych Services · Clinical Phonological Awareness Platform*
