import { useEffect, useMemo, useState } from 'react'
import { fetchApi } from '../../lib/api.js'
import { isoDays, todayISO } from '../../lib/date.js'
import { XP, addXp } from '../../lib/xp.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { EmptyState } from '../../ui/components/EmptyState.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { Badge, Button, Card, Input, SectionLabel } from '../../ui/components/ui.jsx'
import { PageShell } from '../_shared/PageShell.jsx'

export function FitnessPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [activity, setActivity] = useState('running')
  const [duration, setDuration] = useState('')
  const [calories, setCalories] = useState('')
  const [notes, setNotes] = useState('')
  const [workouts, setWorkouts] = useState([])

  const activities = [
    'running',
    'gym',
    'yoga',
    'cricket',
    'walking',
    'cycling',
    'basketball',
    'swimming',
    'badminton',
  ]

  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      try {
        const data = await fetchApi(`/api/${user.id}/fitness`)
        const sorted = (data ?? []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
        setWorkouts(sorted.slice(0, 200))
      } catch (err) {
        toast.push({ tone: 'danger', text: 'Failed to load workouts.' })
      }
    })()
  }, [user?.id])

  async function logWorkout() {
    if (!user?.id) return
    const dur = Number(duration || 0)
    const cal = Number(calories || 0)
    if (!dur) return
    try {
      const data = await fetchApi(`/api/${user.id}/fitness`, {
        method: 'POST',
        body: JSON.stringify({ activity, duration: dur, calories: cal, notes: notes.trim() || null, date: todayISO() })
      })
      setWorkouts((x) => [data, ...x])
      setDuration('')
      setCalories('')
      setNotes('')
      const r = await addXp(user.id, XP.workout, 'Logged Workout')
      if (r.ok) toast.push({ tone: 'success', text: `+${XP.workout} XP` })
    } catch (error) {
      toast.push({ tone: 'danger', text: error.message })
    }
  }

  async function delWorkout(id) {
    try {
      await fetchApi(`/api/${user.id}/fitness/${id}`, { method: 'DELETE' })
      setWorkouts((x) => x.filter((y) => y.id !== id))
    } catch(err) {}
  }

  const weekly = useMemo(() => {
    const days = isoDays(7)
    const map = new Map(days.map((d) => [d, { minutes: 0, calories: 0, sessions: 0 }]))
    for (const w of workouts) {
      const d = w.date || (w.createdAt ? new Date(w.createdAt).toISOString().slice(0, 10) : '')
      if (!map.has(d)) continue
      const cur = map.get(d)
      cur.minutes += Number(w.duration ?? 0)
      cur.calories += Number(w.calories ?? 0)
      cur.sessions += 1
    }
    const sum = Array.from(map.values()).reduce((a, x) => {
      a.minutes += x.minutes
      a.calories += x.calories
      a.sessions += x.sessions
      return a
    }, { minutes: 0, calories: 0, sessions: 0 })
    return sum
  }, [workouts])

  return (
    <PageShell label="Fitness" title="Fitness">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <SectionLabel>This week</SectionLabel>
          <div className="mt-2 text-2xl font-bold text-text mono">{weekly.minutes} min</div>
          <div className="mt-1 text-sm text-muted">Sessions: <span className="mono text-text">{weekly.sessions}</span></div>
        </Card>
        <Card>
          <SectionLabel>Calories</SectionLabel>
          <div className="mt-2 text-2xl font-bold text-text mono">{weekly.calories}</div>
          <div className="mt-1 text-sm text-muted">Estimated</div>
        </Card>
        <Card>
          <SectionLabel>XP</SectionLabel>
          <div className="mt-2 text-2xl font-bold text-primary mono">+{weekly.sessions * XP.workout}</div>
          <div className="mt-1 text-sm text-muted">from workouts</div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <SectionLabel>Log workout</SectionLabel>
          <Badge tone="gold">+{XP.workout} XP</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-9">
          {activities.map((a) => (
            <button
              key={a}
              onClick={() => setActivity(a)}
              className={
                'rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition duration-200 ' +
                (activity === a ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border bg-white/5 text-text hover:bg-white/10')
              }
            >
              {a}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (minutes)" />
          <Input value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="Calories burned" />
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" />
        </div>
        <div className="mt-3">
          <Button onClick={logWorkout}>Log workout</Button>
        </div>
      </Card>

      {workouts.length === 0 ? (
        <EmptyState title="No workouts yet" message="Log something small. Consistency beats intensity." />
      ) : (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel>Recent workouts</SectionLabel>
            <Badge tone="muted">{workouts.length}</Badge>
          </div>
          <div className="mt-4 grid gap-2">
            {workouts.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border border-border bg-bg/30 px-3 py-2">
                <div>
                  <div className="text-sm font-bold text-text capitalize">
                    {w.activity}{' '}
                    <span className="mono text-muted">
                      {w.duration}m • {w.calories} cal • {new Date(w.date || w.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {w.notes ? <div className="text-xs text-muted">{w.notes}</div> : null}
                </div>
                <button className="text-xs font-semibold text-muted hover:text-text transition duration-200" onClick={() => delWorkout(w.id)}>
                  delete
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  )
}

