import { Award, CheckCircle2, Flame, Quote, Sparkles, Trophy } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { todayISO } from '../../lib/date.js'
import { XP, addXp, levelFromXp } from '../../lib/xp.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { Badge, Button, Card, Input, ProgressBar, SectionLabel, Skeleton } from '../../ui/components/ui.jsx'
import { EmptyState } from '../../ui/components/EmptyState.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { PageShell } from '../_shared/PageShell.jsx'

export function DashboardPage() {
  const { user, profile } = useAuth()
  const toast = useToast()
  const [wins, setWins] = useState([])
  const [winText, setWinText] = useState('')
  const [quote, setQuote] = useState(null)
  const [busy, setBusy] = useState(false)

  const xp = profile?.xp ?? 0
  const lev = useMemo(() => levelFromXp(xp), [xp])

  useEffect(() => {
    const key = `dex:wins:${user?.id ?? 'anon'}:${todayISO()}`
    const raw = localStorage.getItem(key)
    setWins(raw ? JSON.parse(raw) : [])
    setQuote({
      text: 'Discipline isn’t a personality trait. It’s a decision you renew daily.',
      by: 'DexTracker',
    })
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

  return (
    <PageShell
      label="Dashboard"
      title={
        <span className="flex items-center gap-3">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}
          <Badge tone="active">ACTIVE</Badge>
        </span>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <SectionLabel>XP</SectionLabel>
          {!profile ? (
            <div className="mt-4 grid gap-3">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-lg font-bold text-text">Level {lev.level}</div>
                  <div className="mt-1 text-sm text-muted">
                    <span className="mono text-text">{lev.into}</span>/<span className="mono">{lev.next}</span> XP to next level
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary">{Math.round((lev.into / lev.next) * 100)}%</div>
              </div>
              <div className="mt-3">
                <ProgressBar value={(lev.into / lev.next) * 100} />
              </div>
            </div>
          )}
        </Card>

        <Card>
          <SectionLabel>Streak</SectionLabel>
          {!profile ? (
            <div className="mt-4 grid gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gold/15 ring-1 ring-gold/30">
                  <Flame className="text-gold" size={18} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-text">{profile.streak ?? 0} days</div>
                  <div className="text-sm text-muted">Best: {profile.best_streak ?? 0}</div>
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar value={Math.min(100, ((profile.streak ?? 0) / Math.max(1, profile.best_streak ?? 1)) * 100)} tone="gold" />
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <SectionLabel>Today at a glance</SectionLabel>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { k: 'Planner', v: 'Tasks + habits pending' },
            { k: 'Health', v: 'Food / water / sleep / weight' },
            { k: 'Finance', v: 'Income vs expenses' },
            { k: 'Study', v: 'Minutes studied today' },
            { k: 'Goals', v: 'Milestones to hit' },
            { k: 'Fitness', v: 'Workout logged?' },
          ].map((x) => (
            <div
              key={x.k}
              className="rounded-2xl border border-border bg-bg/30 p-4 transition duration-200 hover:shadow-glow"
            >
              <div className="text-xs font-semibold tracking-[0.24em] text-muted uppercase">{x.k}</div>
              <div className="mt-2 text-sm text-text">{x.v}</div>
              <div className="mt-1 text-xs text-muted">Opens full section for details.</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <SectionLabel>Daily challenge</SectionLabel>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-base font-bold text-text">
                <Sparkles size={18} className="text-primary" />
                1 hard thing, no negotiation
              </div>
              <div className="mt-1 text-sm text-muted">Do it. Then take the XP.</div>
            </div>
            <Button onClick={completeChallenge} disabled={busy || challengeDone}>
              {challengeDone ? (
                <>
                  <CheckCircle2 size={16} /> Done
                </>
              ) : (
                `Complete (+${XP.dailyChallenge} XP)`
              )}
            </Button>
          </div>
        </Card>

        <Card>
          <SectionLabel>Quote of the day</SectionLabel>
          <div className="mt-3 flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5 ring-1 ring-border">
              <Quote size={18} className="text-primary" />
            </div>
            <div>
              <div className="text-sm text-text">{quote?.text ?? '—'}</div>
              <div className="mt-2 text-xs text-muted uppercase tracking-[0.24em]">{quote?.by ?? ''}</div>
            </div>
          </div>
        </Card>
      </div>

      {wins.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No wins logged today"
          message="Add even tiny wins. Your brain needs evidence."
          action={
            <div className="flex gap-2">
              <Input value={winText} onChange={(e) => setWinText(e.target.value)} placeholder="What did you do right?" />
              <Button onClick={addWin}>Add</Button>
            </div>
          }
        />
      ) : (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel>Recent wins</SectionLabel>
            <div className="flex gap-2">
              <Input value={winText} onChange={(e) => setWinText(e.target.value)} placeholder="Add another win" />
              <Button onClick={addWin}>Add</Button>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {wins.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border border-border bg-bg/30 px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-text">
                  <CheckCircle2 size={16} className="text-success" />
                  {w.text}
                </div>
                <button
                  className="text-xs font-semibold text-muted hover:text-text transition duration-200"
                  onClick={() => saveWins(wins.filter((x) => x.id !== w.id))}
                >
                  remove
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between gap-4">
          <SectionLabel>Badges</SectionLabel>
          <Badge tone="muted">LOCKED/UNLOCKED</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { k: 'First task', unlocked: xp >= 20 },
            { k: '7-day streak', unlocked: (profile?.streak ?? 0) >= 7 },
            { k: '1000 XP', unlocked: xp >= 1000 },
            { k: 'First workout', unlocked: false },
          ].map((b) => (
            <div
              key={b.k}
              className="rounded-2xl border border-border bg-bg/30 p-4 transition duration-200 hover:shadow-glow"
            >
              <div className="flex items-center gap-2">
                <Award size={16} className={b.unlocked ? 'text-gold' : 'text-muted'} />
                <div className="text-sm font-bold text-text">{b.k}</div>
              </div>
              <div className="mt-2 text-xs text-muted uppercase tracking-[0.24em]">
                {b.unlocked ? 'UNLOCKED' : 'LOCKED'}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  )
}

