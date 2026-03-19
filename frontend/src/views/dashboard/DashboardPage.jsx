import { Award, Bot, CheckCircle2, Flame, Quote, Sparkles, Trophy, BadgeDollarSign, HeartPulse, GraduationCap, ListTodo, Target, Dumbbell } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { todayISO } from '../../lib/date.js'
import { XP, addXp, levelFromXp } from '../../lib/xp.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { Badge, Button, Card, Input, ProgressBar, SectionLabel, Skeleton } from '../../ui/components/ui.jsx'
import { EmptyState } from '../../ui/components/EmptyState.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'

export function DashboardPage() {
  const { user, profile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [wins, setWins] = useState([])
  const [winText, setWinText] = useState('')
  const [quote, setQuote] = useState(null)
  const [busy, setBusy] = useState(false)
  const [stats, setStats] = useState(null)

  const xp = profile?.xp ?? 0
  const lev = useMemo(() => levelFromXp(xp), [xp])

  useEffect(() => {
    const key = `dex:wins:${user?.id ?? 'anon'}:${todayISO()}`
    const raw = localStorage.getItem(key)
    setWins(raw ? JSON.parse(raw) : [])
    setQuote({
      text: 'Discipline isn’t a personality trait. It’s a decision you renew daily.',
      by: 'DEXTRACKER',
    })
  }, [user?.id])

  useEffect(() => {
    async function loadStats() {
      if (!user?.id) return
      const today = todayISO()
      const thisMonth = today.slice(0, 7)
      
      try {
        const [
          { data: tasks }, { data: habits },
          { data: txs },
          { data: sleep }, { data: water }, { data: mood },
          { data: study },
          { data: goals },
          { data: fit }
        ] = await Promise.all([
          supabase.from('tasks').select('*').eq('user_id', user.id).eq('date', today),
          supabase.from('habits').select('*').eq('user_id', user.id),
          supabase.from('finance_transactions').select('*').eq('user_id', user.id),
          supabase.from('health_sleep').select('*').eq('user_id', user.id),
          supabase.from('health_water').select('*').eq('user_id', user.id).eq('date', today),
          supabase.from('mood_logs').select('*').eq('user_id', user.id).eq('date', today),
          supabase.from('study_sessions').select('*').eq('user_id', user.id).eq('date', today),
          supabase.from('goals').select('*').eq('user_id', user.id),
          supabase.from('fitness_workouts').select('*').eq('user_id', user.id)
        ])
        
        const tasksDone = tasks?.filter(t => t.completed)?.length || 0
        const habitsDone = habits?.filter(h => h.completed_dates?.includes(today))?.length || 0
        
        const bal = txs?.reduce((a, t) => a + (t.type === 'income' ? t.amount : -t.amount), 0) || 0
        const mTx = txs?.filter(t => t.date?.startsWith(thisMonth)) || []
        const inc = mTx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0) || 0
        const exp = mTx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0) || 0
        
        const avgSlp = sleep?.length ? (sleep.reduce((a, s) => a + s.hours, 0) / sleep.length).toFixed(1) : 0
        const wtr = water?.[0]?.amount || 0
        const md = mood?.[0] ? ['Awful', 'Bad', 'Okay', 'Good', 'Great'][mood[0].score - 1] : '—'
        
        const stMins = study?.reduce((a, s) => a + s.duration, 0) || 0
        const pomo = Math.floor(stMins / 25)
        const sub = study?.[0]?.subject || '—'
        
        const actG = goals?.filter(g => g.progress < g.target)?.length || 0
        
        const wrk = fit?.length || 0
        const cal = fit?.reduce((a, f) => a + (f.calories || 0), 0) || 0
        
        setStats({
           planner: { done: tasksDone, habits: habitsDone },
           finance: { bal, inc, exp },
           health: { sleep: avgSlp, water: wtr, mood: md },
           study: { hrs: (stMins / 60).toFixed(1), pomo, subj: sub },
           goals: { active: actG },
           fitness: { wrk, cal }
        })
      } catch(e) { console.error('Stats load failed', e) }
    }
    loadStats()
  }, [user?.id])

  function saveWins(next) {
    const key = `dex:wins:${user?.id ?? 'anon'}:${todayISO()}`
    localStorage.setItem(key, JSON.stringify(next))
    setWins(next)
  }

  async function addWin() {
    const t = winText.trim()
    if (!t) return
    const next = [{ id: crypto.randomUUID?.() ?? String(Math.random()), text: t, at: Date.now() }, ...wins].slice(0, 20)
    saveWins(next)
    setWinText('')
    toast.push({ tone: 'success', text: 'Win logged.' })
  }

  async function completeChallenge() {
    if (!user?.id) return
    const key = `dex:challenge:${user.id}:${todayISO()}`
    if (localStorage.getItem(key)) {
      toast.push({ tone: 'muted', text: 'Already completed today.' })
      return
    }
    setBusy(true)
    const res = await addXp(user.id, XP.dailyChallenge)
    setBusy(false)
    if (res.ok) {
      localStorage.setItem(key, '1')
      toast.push({ tone: 'success', text: `+${XP.dailyChallenge} XP` })
      await supabase.from('profiles').update({ last_active: todayISO() }).eq('id', user.id)
    } else toast.push({ tone: 'danger', text: res.error ?? 'XP update failed' })
  }

  const challengeDone = user?.id ? localStorage.getItem(`dex:challenge:${user.id}:${todayISO()}`) === '1' : false

  // UI CONFIG FOR DATA CARDS
  const c = {
    Finance: { path: '/finance', color: '#00d4aa', icon: BadgeDollarSign, 
      val: stats ? `$${stats.finance.bal}` : '—', pill: 'BALANCE',
      l1: 'IN', v1: stats ? `$${stats.finance.inc}` : '—',
      l2: 'OUT', v2: stats ? `$${stats.finance.exp}` : '—'
    },
    Health: { path: '/health', color: '#fb7185', icon: HeartPulse, 
      val: stats ? `${stats.health.sleep}h` : '—', pill: 'AVG SLEEP',
      l1: 'WATER', v1: stats ? stats.health.water : '—',
      l2: 'MOOD', v2: stats ? stats.health.mood : '—'
    },
    Study: { path: '/study', color: '#38bdf8', icon: GraduationCap, 
      val: stats ? `${stats.study.hrs}h` : '—', pill: 'HOURS TODAY',
      l1: 'POMOS', v1: stats ? stats.study.pomo : '—',
      l2: 'TOPIC', v2: stats ? stats.study.subj : '—'
    },
    Planner: { path: '/planner', color: '#818cf8', icon: ListTodo, 
      val: stats ? stats.planner.done : '—', pill: 'TASKS DONE',
      l1: 'HABITS', v1: stats ? stats.planner.habits : '—',
      l2: 'PENDING', v2: '—'
    },
    Goals: { path: '/goals', color: '#fbbf24', icon: Target, 
      val: stats ? stats.goals.active : '—', pill: 'ACTIVE GOALS',
      l1: 'STREAK', v1: profile ? `${profile.streak || 0}d` : '—',
      l2: 'MILESTONES', v2: '—'
    },
    Fitness: { path: '/fitness', color: '#fb923c', icon: Dumbbell, 
      val: stats ? stats.fitness.wrk : '—', pill: 'WORKOUTS',
      l1: 'CALORIES', v1: stats ? stats.fitness.cal : '—',
      l2: 'ROUTINE', v2: '—'
    }
  }

  const todayStr = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  return (
    <div className="pb-24 pt-4 md:pt-6 max-w-[1400px] mx-auto space-y-8 px-4 md:px-8 bg-[#04060A] min-h-screen text-white font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-[28px] font-bold text-white tracking-wide">Dashboard</h1>
        <div className="flex items-center gap-4">
          <button className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1c2128] hover:bg-[#2d333b] text-white/50 transition-colors cursor-pointer"><span className="font-bold text-lg">?</span></button>
          <button className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1c2128] hover:bg-[#2d333b] text-white/50 transition-colors cursor-pointer">🎤</button>
          <button className="flex items-center gap-2 rounded-2xl bg-[#1c2128] px-4 h-10 hover:bg-[#2d333b] text-white/70 transition-colors cursor-pointer font-bold text-sm">
            ☀️ Light
          </button>
        </div>
      </div>

      {/* Daily Challenge Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-[20px] bg-[#0A0E17] border border-white/5 px-6 py-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="text-[#f97316] drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">⚡</div>
          <div className="text-[14px] font-bold tracking-wide text-[#38bdf8]">
            Daily Challenge: <span className="font-medium text-white/50 ml-2">Log a social interaction</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
          <div className="bg-gold/10 text-gold rounded-full px-4 py-1.5 text-xs font-bold">+25 XP</div>
          <Button 
            size="sm" 
            onClick={completeChallenge} 
            disabled={busy || challengeDone} 
            className={`rounded-full px-6 py-1.5 transition-all text-sm font-bold shadow-none ${challengeDone ? 'bg-[#0f2e28] text-[#10b981] cursor-not-allowed border border-[#10b981]/20' : 'bg-[#0f766e]/20 border border-[#0f766e] text-[#2dd4bf] hover:bg-[#0f766e]/40'}`}
          >
            Done!
          </Button>
        </div>
      </div>

      {/* Greeting */}
      <div className="flex items-center justify-between mt-10">
        <div>
          <h2 className="text-[32px] font-bold text-white tracking-tight">Good evening 👋</h2>
          <div className="mt-2 text-sm font-semibold text-white/40 tracking-wide">{todayStr}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f59e0b]/20 text-[#f59e0b] rounded-full px-4 py-2 text-xs font-bold">
            🔥 {profile?.streak || 0} day streak
          </div>
          <div className="flex h-8 px-4 items-center justify-center rounded-xl bg-[#4c1d95]/40 text-[#c084fc] text-xs font-black">
            Lv {lev.level}
          </div>
        </div>
      </div>

      {/* 5 Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mt-8">
        <div className="flex flex-col rounded-[20px] bg-[#0A0E17] border border-white/5 px-6 py-6 shadow-[inset_0_-4px_20px_-10px_#06b6d4,0_4px_30px_-5px_rgba(6,182,212,0.3)]">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">TASKS</div>
          <div className="mt-4 text-[42px] font-black leading-none text-[#38bdf8]">{stats?.planner?.done || 0}</div>
          <div className="mt-4 text-xs font-semibold text-[#06b6d4]/50">done today</div>
        </div>
        
        <div className="flex flex-col rounded-[24px] bg-[#0A0E17] border border-white/5 px-6 py-6 ring-1 ring-[#c084fc]/10 shadow-[inset_0_-4px_20px_-10px_#a855f7,0_4px_30px_-5px_rgba(168,85,247,0.3)]">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">HABITS</div>
          <div className="mt-4 text-[42px] font-black leading-none text-[#c084fc]">{stats?.planner?.habits || 0}</div>
          <div className="mt-4 text-xs font-semibold text-[#a855f7]/50">completed</div>
        </div>

        <div className="flex flex-col rounded-[24px] bg-[#0A0E17] border border-white/5 px-6 py-6 ring-1 ring-[#4ade80]/10 shadow-[inset_0_-4px_20px_-10px_#22c55e,0_4px_30px_-5px_rgba(34,197,94,0.3)]">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">STUDY</div>
          <div className="mt-4 text-[42px] font-black leading-none text-[#4ade80]">{stats?.study?.hrs || '0.0'}h</div>
          <div className="mt-4 text-xs font-semibold text-[#22c55e]/50">today</div>
        </div>

        <div className="flex flex-col rounded-[24px] bg-[#0A0E17] border border-white/5 px-6 py-6 ring-1 ring-[#fb923c]/10 shadow-[inset_0_-4px_20px_-10px_#f97316,0_4px_30px_-5px_rgba(249,115,22,0.3)]">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">SPENT</div>
          <div className="mt-4 text-[42px] font-black leading-none text-[#fb923c]">₹{stats?.finance?.exp || 0}</div>
          <div className="mt-4 text-xs font-semibold text-[#f97316]/50">today</div>
        </div>

        <div className="flex flex-col rounded-[24px] bg-[#0A0E17] border border-white/5 px-6 py-6 ring-1 ring-[#f472b6]/10 shadow-[inset_0_-4px_20px_-10px_#ec4899,0_4px_30px_-5px_rgba(236,72,153,0.3)]">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">MOOD</div>
          <div className="mt-4 text-[42px] font-black leading-none text-[#f472b6]">{stats?.health?.mood === '—' ? '—' : (stats?.health?.mood || '—')}</div>
          <div className="mt-4 text-xs font-semibold text-[#ec4899]/50">today</div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-[24px] border border-white/5 bg-[#0A0E17] flex flex-col p-8 h-full shadow-lg">
          <div className="text-white/40 font-black tracking-[0.2em] text-[11px] mb-6 flex items-center gap-2">💬 DAILY QUOTE</div>
          <div className="flex-1 text-xl font-medium italic text-[#64748b] leading-relaxed pr-8">
            "{quote?.text ?? 'Push yourself, because no one else is going to do it for you.'}"
          </div>
          <div className="mt-8 text-xs font-black tracking-widest text-[#334155] uppercase">— {quote?.by ?? 'Unknown'}</div>
        </div>
        
        <div className="rounded-[24px] border border-white/5 bg-[#0A0E17] flex flex-col p-8 h-full shadow-lg">
          <div className="text-white/40 font-black tracking-[0.2em] text-[11px] mb-6 flex items-center gap-2">📋 TODAY'S TASKS</div>
          <div className="flex-1 flex items-center justify-center font-bold text-[#334155] text-sm tracking-wide">
            No tasks today
          </div>
        </div>
      </div>

      {/* Arena Row */}
      <div className="mt-8 rounded-[24px] border border-[#1e1b4b]/40 bg-[#070A11] p-8 pb-12 shadow-[inset_0_0_80px_rgba(20,20,50,0.3)] relative overflow-hidden">
        <div className="text-[#38bdf8]/60 font-black tracking-[0.2em] text-[11px] mb-12 flex items-center gap-2">🏆 ARENA — YOUR PROGRESS</div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12 relative z-10">
          <div className="text-center">
            <div className="text-[64px] font-black text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.4)] leading-none">{profile?.xp || 0}</div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/40">TOTAL XP</div>
          </div>
          <div className="text-center">
            <div className="text-[64px] font-black text-[#f59e0b] drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] leading-none">{profile?.streak || 0}</div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/40">DAY STREAK</div>
          </div>
          <div className="text-center">
            <div className="text-[64px] font-black text-[#a855f7] drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] leading-none">0</div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/40">BADGES</div>
          </div>
          <div className="text-center">
            <div className="text-[64px] font-black text-[#22c55e] drop-shadow-[0_0_20px_rgba(34,197,94,0.4)] leading-none">D</div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/40">WEEK GRADE</div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 lg:px-16 mt-16 relative z-10">
          <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 text-white shadow-[0_0_15px_rgba(0,229,255,0.2)] px-4 py-2 text-[11px] font-bold">✅ First Task</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">🏆 5 Tasks Done</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">🌟 20 Tasks Done</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">🔥 Habit Builder</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">🔥 3 Day Streak</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">⚡ 7 Day Streak</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">💧 Fully Hydrated</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">🥗 Food Logger</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">🏃 Athlete</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">🥇 PR Holder</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">📓 Journaler</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">😴 Good Sleeper</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">💸 Saver</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">🎯 Goal Chaser</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">👥 Social Butterfly</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">📚 Scholar</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">⭐ Level 3</div>
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 text-white/40 px-4 py-2 text-[11px] font-bold">🌟 Level 5</div>
        </div>
      </div>
      
      {/* Weekly Overview Stub */}
      <div className="mt-8 rounded-[24px] border border-white/5 bg-[#0A0E17] p-8 pb-16 shadow-xl">
         <div className="flex justify-between items-center mb-10">
            <div className="text-white/40 font-black tracking-[0.2em] text-[11px] flex items-center gap-2">📈 WEEKLY OVERVIEW</div>
            <div className="flex items-center gap-4 text-xs font-bold text-white/50">
               <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4]"></div> Tasks</span>
               <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-[#a855f7]"></div> Habits</span>
               <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-[#22c55e]"></div> Study hrs</span>
            </div>
         </div>
         {/* Fake Chart Grid */}
         <div className="relative w-full h-40 border-l border-b border-white/10 flex flex-col justify-between ml-4">
            <div className="w-full h-[1px] bg-white/5 border-dashed relative"><span className="absolute -left-8 -top-2 text-[10px] text-white/30">1.0</span></div>
            <div className="w-full h-[1px] bg-white/5 border-dashed relative"><span className="absolute -left-8 -top-2 text-[10px] text-white/30">0.5</span></div>
            <div className="w-full h-[1px] bg-white/5 border-dashed relative"><span className="absolute -left-8 -top-2 text-[10px] text-white/30">0.0</span></div>
         </div>
      </div>
    </div>
  )
}

