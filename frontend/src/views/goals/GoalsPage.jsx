import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { XP, addXp } from '../../lib/xp.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { EmptyState } from '../../ui/components/EmptyState.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { Badge, Button, Card, Input, ProgressBar, SectionLabel } from '../../ui/components/ui.jsx'
import { PageShell } from '../_shared/PageShell.jsx'

export function GoalsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [goals, setGoals] = useState([])
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')

  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setGoals(data ?? [])
    })()
  }, [user?.id])

  async function addGoal() {
    if (!user?.id) return
    const t = title.trim()
    if (!t) return
    const { data, error } = await supabase
      .from('goals')
      .insert({ user_id: user.id, title: t, deadline: deadline || null, milestones: [], progress: 0 })
      .select('*')
      .single()
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setGoals((x) => [data, ...x])
    setTitle('')
    setDeadline('')
  }

  async function addMilestone(goalId, text) {
    if (!user?.id) return
    const g = goals.find((x) => x.id === goalId)
    if (!g) return
    const t = text.trim()
    if (!t) return
    const next = [...(g.milestones ?? []), { id: crypto.randomUUID?.() ?? String(Math.random()), text: t, done: false }]
    const progress = next.length ? Math.round((next.filter((m) => m.done).length / next.length) * 100) : 0
    const { error } = await supabase.from('goals').update({ milestones: next, progress }).eq('id', goalId)
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setGoals((x) => x.map((y) => (y.id === goalId ? { ...y, milestones: next, progress } : y)))
  }

  async function toggleMilestone(goalId, mid) {
    if (!user?.id) return
    const g = goals.find((x) => x.id === goalId)
    if (!g) return
    const next = (g.milestones ?? []).map((m) => (m.id === mid ? { ...m, done: !m.done } : m))
    const progress = next.length ? Math.round((next.filter((m) => m.done).length / next.length) * 100) : 0
    const { error } = await supabase.from('goals').update({ milestones: next, progress }).eq('id', goalId)
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setGoals((x) => x.map((y) => (y.id === goalId ? { ...y, milestones: next, progress } : y)))
    const changed = (g.milestones ?? []).find((m) => m.id === mid)
    if (changed && !changed.done) {
      const r = await addXp(user.id, XP.milestone)
      if (r.ok) toast.push({ tone: 'success', text: `+${XP.milestone} XP` })
    }
  }

  async function deleteGoal(goalId) {
    const { error } = await supabase.from('goals').delete().eq('id', goalId)
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setGoals((x) => x.filter((y) => y.id !== goalId))
  }

  const streak = useMemo(() => {
    // lightweight "goal streak": days with any milestone completed, based on local history
    const key = user?.id ? `dex:goalStreak:${user.id}` : 'dex:goalStreak:na'
    const raw = localStorage.getItem(key)
    return raw ? Number(raw) : 0
  }, [user?.id])

  return (
    <PageShell
      label="Goals"
      title={
        <span className="flex items-center gap-3">
          Goals <Badge tone="gold">STREAK {streak}</Badge>
        </span>
      }
    >
      <Card>
        <div className="flex items-center justify-between gap-4">
          <SectionLabel>Create goal</SectionLabel>
          <Badge tone="muted">{goals.length} total</Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" />
          <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="Deadline (YYYY-MM-DD)" />
          <Button onClick={addGoal}>Create</Button>
        </div>
      </Card>

      {goals.length === 0 ? (
        <EmptyState title="No goals yet" message="Set a deadline. Break it into milestones. Earn XP by finishing." />
      ) : (
        <div className="grid gap-6">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onAddMilestone={addMilestone} onToggle={toggleMilestone} onDelete={deleteGoal} />
          ))}
        </div>
      )}
    </PageShell>
  )
}

function GoalCard({ goal, onAddMilestone, onToggle, onDelete }) {
  const [ms, setMs] = useState('')
  const list = goal.milestones ?? []
  const done = list.filter((m) => m.done).length
  const progress = goal.progress ?? (list.length ? Math.round((done / list.length) * 100) : 0)
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionLabel>Goal</SectionLabel>
          <div className="mt-2 text-lg font-bold text-text">{goal.title}</div>
          <div className="mt-1 text-sm text-muted">
            Deadline: <span className="mono">{goal.deadline ?? '—'}</span>
          </div>
        </div>
        <button className="text-xs font-semibold text-muted hover:text-text transition duration-200" onClick={() => onDelete(goal.id)}>
          delete
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted uppercase tracking-[0.24em]">
          <span>Progress</span>
          <span className="mono">{progress}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar value={progress} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <Input value={ms} onChange={(e) => setMs(e.target.value)} placeholder="Add milestone…" />
        <Button
          onClick={() => {
            onAddMilestone(goal.id, ms)
            setMs('')
          }}
        >
          Add
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="mt-4 text-sm text-muted">No milestones yet.</div>
      ) : (
        <div className="mt-4 grid gap-2">
          {list.map((m) => (
            <label key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg/30 px-3 py-2">
              <div className="flex items-center gap-3 text-sm text-text">
                <input type="checkbox" checked={!!m.done} onChange={() => onToggle(goal.id, m.id)} />
                <span className={m.done ? 'line-through text-muted' : ''}>{m.text}</span>
              </div>
              <Badge tone={m.done ? 'success' : 'muted'}>{m.done ? 'DONE' : 'OPEN'}</Badge>
            </label>
          ))}
        </div>
      )}
    </Card>
  )
}


