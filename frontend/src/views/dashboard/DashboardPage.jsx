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

  return (
    <div className="pb-24">
      {/* GLOWING HERO SECTION */}
      <div className="mb-16 mt-8 flex flex-col items-center text-center relative">
        <div className="absolute top-0 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative grid h-[180px] w-[180px] place-items-center rounded-full bg-surface/80 backdrop-blur-md border border-primary/40 shadow-[0_0_60px_rgba(0,229,255,0.4)] z-10">
           <div className="absolute inset-0 rounded-full border border-primary/30 animate-[ping_3s_ease-in-out_infinite]" />
           <div className="absolute -inset-8 rounded-full border border-primary/10 animate-[pulse_4s_ease-in-out_infinite]" />
           <div className="absolute -inset-16 rounded-full border border-primary/5 animate-[spin_10s_linear_infinite] border-t-primary/40" />
           <Bot size={80} strokeWidth={1.5} className="text-primary drop-shadow-[0_0_20px_rgba(0,229,255,1)]" />
        </div>
        
        <h1 className="mt-10 text-5xl md:text-7xl font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-white to-primary drop-shadow-[0_0_20px_rgba(0,229,255,0.6)]">
          D E X I V A
        </h1>
        <p className="mt-4 text-sm md:text-base font-bold tracking-[0.4em] text-primary/80 uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
          Your Personal AI Assistant
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-2 opacity-90">
          {[1,2,3,4,5,6,7].map((i) => (
            <div 
              key={i} 
              className="w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,229,255,0.9)]" 
              style={{ 
                height: `${12 + Math.abs(Math.sin(i)*20)}px`, 
                animation: `pulse ${0.4 + (i%3)*0.2}s infinite alternate` 
              }} 
            />
          ))}
        </div>
        
        <div className="mt-12 relative z-20">
          <Button 
            onClick={() => navigate('/ai')} 
            className="px-12 py-5 text-lg tracking-widest shadow-[0_0_40px_rgba(0,229,255,0.6)] hover:shadow-[0_0_60px_rgba(0,229,255,0.8)] hover:-translate-y-1.5 border border-white/20"
          >
             <Bot size={26} className="drop-shadow-[0_0_5px_white]" /> START TALKING
          </Button>
          <div className="mt-8 flex items-center justify-center gap-6">
             <Badge tone="online" className="px-4 py-2 text-xs">AI ONLINE</Badge>
             <Badge tone="online" className="px-4 py-2 text-xs">VOICE READY</Badge>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="text-xl font-bold tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] uppercase">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}
        </div>
        <Badge tone="active">ACTIVE SYSTEM</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <SectionLabel>System XP</SectionLabel>
          {!profile ? (
            <div className="mt-4 grid gap-3">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Level {lev.level}</div>
                  <div className="mt-1 text-sm font-bold text-primary/70 tracking-widest uppercase">
                    <span className="mono text-primary drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]">{lev.into}</span>/<span className="mono">{lev.next}</span> XP to next level
                  </div>
                </div>
                <div className="text-xl font-black text-primary drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]">{Math.round((lev.into / lev.next) * 100)}%</div>
              </div>
              <div className="mt-5">
                <ProgressBar value={(lev.into / lev.next) * 100} />
              </div>
            </div>
          )}
        </Card>

        <Card>
          <SectionLabel>Current Streak</SectionLabel>
          {!profile ? (
            <div className="mt-4 grid gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : (
            <div className="mt-4 flex flex-col justify-center h-full pb-4">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gold/20 ring-1 ring-gold/50 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                  <Flame className="text-gold drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" size={28} />
                </div>
                <div>
                  <div className="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{profile.streak ?? 0} DAYS</div>
                  <div className="text-xs font-bold text-gold/80 tracking-widest uppercase mt-1">Best: {profile.best_streak ?? 0}</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <SectionLabel className="px-2 mb-4">Today at a Glance</SectionLabel>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {Object.entries(c).map(([name, d]) => (
            <div
              key={name}
              onClick={() => navigate(d.path)}
              className="cursor-pointer rounded-xl bg-[#0d1420] p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{ borderTop: `3px solid ${d.color}` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: d.color }}>
                  <d.icon size={16} /> {name}
                </div>
                <div className="rounded-full px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase" style={{ backgroundColor: `${d.color}20`, color: d.color }}>
                  {d.pill}
                </div>
              </div>
              
              <div className="mt-4 text-[32px] font-black leading-none text-white drop-shadow-md">
                {d.val}
              </div>
              
              <div className="mt-5 flex items-center justify-between text-[11px] font-bold text-muted uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  {d.l1}: <span style={{ color: d.color }} className="truncate max-w-[80px] text-right inline-block">{d.v1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {d.l2}: <span style={{ color: d.color }} className="truncate max-w-[80px] text-right inline-block">{d.v2}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <SectionLabel>Daily Directives</SectionLabel>
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 text-lg font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                <Sparkles size={22} className="text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                1 Hard Thing. No Negotiation.
              </div>
              <div className="mt-2 text-sm font-bold text-muted tracking-wide">Execute module. Acquire XP.</div>
            </div>
            <Button onClick={completeChallenge} disabled={busy || challengeDone} className={challengeDone ? 'bg-success/20 text-success shadow-none border-success/30' : ''}>
              {challengeDone ? (
                <>
                  <CheckCircle2 size={18} /> Verified
                </>
              ) : (
                `ACKNOWLEDGE (+${XP.dailyChallenge} XP)`
              )}
            </Button>
          </div>
        </Card>

        <Card>
          <SectionLabel>System Quote</SectionLabel>
          <div className="mt-5 flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/5 ring-1 ring-white/20">
              <Quote size={20} className="text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
            </div>
            <div className="pt-1">
              <div className="text-base font-bold italic text-white/90 leading-relaxed">{quote?.text ?? '—'}</div>
              <div className="mt-3 text-xs font-black text-primary/70 uppercase tracking-[0.3em]">{quote?.by ?? ''}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

