# ⚡ DexTrack — Your Complete Life OS

> Track habits, health, study, finance, goals, and more — powered by AI.

[![Vercel](https://img.shields.io/badge/Live-dextracker--tau.vercel.app-6366f1?style=flat&logo=vercel)](https://dextracker-tau.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-DExTER035%2Fdextracker-181717?style=flat&logo=github)](https://github.com/DExTER035/dextracker)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat&logo=pwa)](https://dextracker-tau.vercel.app)

---

## 🚀 Live App

**[dextracker-tau.vercel.app](https://dextracker-tau.vercel.app)**

Install it as a PWA on Android/iOS — works offline!

---

## ✨ Features

| Section | What it does |
|---|---|
| ⚡ **Dashboard** | XP bar, streak card, mood chart, daily challenge, AI morning briefing |
| 📋 **Daily Planner** | Tasks with priorities, pomodoro timer, drag & drop |
| 🏃 **Health** | Meal tracking with AI food scanner, mood logging, sleep tracker |
| 💰 **Finance** | Income/expense tracker, budget goals, monthly chart |
| 🎯 **Goals** | Long-term goals with milestones and progress tracking |
| 📚 **Study** | Study sessions, subject breakdowns, flashcards, revision calendar |
| 🏋️ **Fitness** | Workout templates, muscle group tracking, progression charts |
| 🤖 **AI Suite** | Chat, study quiz, debate mode, motivational coach, code explainer |
| ⚙️ **Settings** | Language (EN/हिंदी/मराठी), theme, Gemini API key, notifications |

---

## 🤖 AI Features

- **AI Morning Briefing** — personalized daily summary on the Dashboard (needs Gemini key)
- **AI Food Scanner** — photo → nutritional data (Gemini Vision)
- **DexAI Chat** — 6 modes: assistant, study coach, debate, motivation, code, DexCommand
- **Voice Commands** — navigate the entire app hands-free

Get a free Gemini API key: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## 🎮 Gamification

- **XP system** — earn points for every action
- **Levels** — unlock new levels as XP accumulates
- **Badges** — achievement badges for milestones
- **Daily challenges** — fresh challenge every day
- **Habit streaks** — fire emoji escalates with consecutive days

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS, Glassmorphism |
| Charts | Chart.js via react-chartjs-2 |
| Backend | Node.js + Express (hosted on Render) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth + Google OAuth |
| AI | Google Gemini 2.0 Flash API |
| Hosting | Vercel (frontend) + Render (backend) |
| PWA | Service Worker, Web App Manifest |

---

## 📱 Progressive Web App

DexTrack is fully installable as a PWA:

- **Android**: Open in Chrome → ⋮ → "Add to Home Screen"
- **iOS**: Open in Safari → Share → "Add to Home Screen"
- **Desktop**: Click the install icon in Chrome / Edge address bar

---

## 🗄️ Database Schema

10 tables in Supabase, all with Row Level Security:

`profiles` · `tasks` · `habits` · `mood_logs` · `meals` · `sleep_logs` · `goals` · `study_sessions` · `workouts` · `transactions`

---

## 🌐 Localization

- 🇬🇧 English
- 🇮🇳 हिंदी (Hindi)
- 🇮🇳 मराठी (Marathi)

Switch languages instantly from **Settings → Language**.

---

## 📦 Project Structure

```
dextracker/
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── components/    # Sidebar, Login, Topbar, Onboarding, DexCommand
│   │   ├── sections/      # Dashboard, Daily, Life, Finance, Goals, Study, Track, DexAI, Settings, Social
│   │   ├── context/       # AppContext (user, XP, toast, language)
│   │   ├── lib/           # Supabase client & CRUD helpers
│   │   └── i18n/          # EN / हिंदी / मराठी translations
│   └── public/            # PWA manifest, icons, screenshots, sw.js
└── backend/               # Express API (Render)
```

---

## 🔧 Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev   # http://localhost:5173

# Backend
cd backend
npm install
npm run dev   # http://localhost:3001
```

### Environment Variables

**Frontend** (`.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3001/api
```

**Backend** (`.env`):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=3001
```

---

## 🔗 Links

- **Live App:** [dextracker-tau.vercel.app](https://dextracker-tau.vercel.app)
- **Supabase:** [supabase.com/dashboard/project/qscirujupsjypjjilppr](https://supabase.com/dashboard/project/qscirujupsjypjjilppr)
- **GitHub:** [github.com/DExTER035/dextracker](https://github.com/DExTER035/dextracker)

---

<p align="center">Built with ⚡ by <strong>DExTER035</strong></p>
