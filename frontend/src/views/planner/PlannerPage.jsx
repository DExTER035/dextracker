import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import { todayISO } from '../../lib/date.js'
import { XP, addXp } from '../../lib/xp.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { EmptyState } from '../../ui/components/EmptyState.jsx'
import { Tabs } from '../../ui/components/Tabs.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { Badge, Button, Card, Input, ProgressBar, SectionLabel } from '../../ui/components/ui.jsx'
import { PageShell } from '../_shared/PageShell.jsx'

export function PlannerPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('tasks')

  // Tasks
  const [tasks, setTasks] = useState([])
  const [taskText, setTaskText] = useState('')
  const [priority, setPriority] = useState('medium')

  // Habits
  const [habits, setHabits] = useState([])
  const [habitName, setHabitName] = useState('')
  const [habitIcon, setHabitIcon] = useState('🔥')

  // Mood
  const [moodToday, setMoodToday] = useState(null)
  const [moodValue, setMoodValue] = useState(3)
  const [moodNote, setMoodNote] = useState('')

  // Journal
  const [pinOk, setPinOk] = useState(false)
  const [pin, setPin] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [entries, setEntries] = useState([])
  const [jTitle, setJTitle] = useState('')
  const [jText, setJText] = useState('')

  const today = todayISO()

  const week = useMemo(() => {
    const d = new Date()
    const day = (d.getDay() + 6) % 7 // Mon=0
    const monday = new Date(d)
    monday.setDate(d.getDate() - day)
    const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return names.map((name, i) => {
      const x = new Date(monday)
      x.setDate(monday.getDate() + i)
      const iso = x.toISOString().slice(0, 10)
      return { name, iso, isToday: iso === today }
    })
  }, [today])

  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      const [{ data: t }, { data: h }, { data: m }, { data: j }] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('mood_logs').select('*').eq('user_id', user.id).gte('created_at', `${today}T00:00:00Z`).lte('created_at', `${today}T23:59:59Z`),
        supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ])
      setTasks(t ?? [])
      setHabits(h ?? [])
      setMoodToday((m ?? [])[0] ?? null)
      setEntries(j ?? [])

      const pinKey = `dex:pin:${user.id}`
      const stored = localStorage.getItem(pinKey)
      setPin(stored ?? '')
      setPinOk(stored ? false : true) // if no PIN set, allow and ask to set
    })()
  }, [user?.id, today])

  async function addTask() {
    const text = taskText.trim()
    if (!text || !user?.id) return
    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: user.id, text, priority })
      .select('*')
      .single()
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setTasks((x) => [data, ...x])
    setTaskText('')
    toast.push({ tone: 'success', text: 'Task added.' })
  }

  async function toggleTask(t) {
    if (!user?.id) return
    const nextDone = !t.done
    const { error } = await supabase.from('tasks').update({ done: nextDone }).eq('id', t.id)
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setTasks((x) => x.map((y) => (y.id === t.id ? { ...y, done: nextDone } : y)))
    if (nextDone) {
      const r = await addXp(user.id, XP.task)
      if (r.ok) toast.push({ tone: 'success', text: `+${XP.task} XP` })
    }
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setTasks((x) => x.filter((y) => y.id !== id))
  }

  function habitDoneToday(h) {
    const arr = Array.isArray(h.completed_dates) ? h.completed_dates : []
    return arr.includes(today)
  }

  async function addHabit() {
    const name = habitName.trim()
    if (!name || !user?.id) return
    const { data, error } = await supabase
      .from('habits')
      .insert({ user_id: user.id, name, icon: habitIcon })
      .select('*')
      .single()
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setHabits((x) => [...x, data])
    setHabitName('')
    toast.push({ tone: 'success', text: 'Habit added.' })
  }

  async function completeHabit(h) {
    if (!user?.id) return
    if (habitDoneToday(h)) return
    const prev = Array.isArray(h.completed_dates) ? h.completed_dates : []
    const next = [...prev, today]
    const { error } = await supabase.from('habits').update({ completed_dates: next }).eq('id', h.id)
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setHabits((x) => x.map((y) => (y.id === h.id ? { ...y, completed_dates: next } : y)))
    const r = await addXp(user.id, XP.habit)
    if (r.ok) toast.push({ tone: 'success', text: `+${XP.habit} XP` })
  }

  const habitsDone = habits.filter(habitDoneToday).length

  async function logMood() {
    if (!user?.id) return
    if (moodToday) return toast.push({ tone: 'muted', text: 'Already logged today.' })
    const map = {
      1: { label: 'awful', emoji: '😖' },
      2: { label: 'bad', emoji: '😕' },
      3: { label: 'okay', emoji: '😐' },
      4: { label: 'good', emoji: '🙂' },
      5: { label: 'amazing', emoji: '😁' },
    }
    const info = map[moodValue]
    const { data, error } = await supabase
      .from('mood_logs')
      .insert({ user_id: user.id, value: moodValue, label: info.label, note: moodNote.trim() || null })
      .select('*')
      .single()
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setMoodToday(data)
    setMoodNote('')
    const r = await addXp(user.id, XP.mood)
    if (r.ok) toast.push({ tone: 'success', text: `+${XP.mood} XP` })
  }

  function unlockOrSetPin() {
    if (!user?.id) return
    const pinKey = `dex:pin:${user.id}`
    if (!pin) {
      const p = pinInput.trim()
      if (p.length < 4 || p.length > 6 || !/^\d+$/.test(p)) {
        toast.push({ tone: 'danger', text: 'PIN must be 4-6 digits.' })
        return
      }
      localStorage.setItem(pinKey, p)
      setPin(p)
      setPinOk(true)
      toast.push({ tone: 'success', text: 'PIN set.' })
      return
    }
    if (pinInput.trim() === pin) setPinOk(true)
    else toast.push({ tone: 'danger', text: 'Wrong PIN.' })
  }

  async function addEntry() {
    if (!user?.id) return
    const title = jTitle.trim()
    const text = jText.trim()
    if (!title || !text) return
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ user_id: user.id, title, text })
      .select('*')
      .single()
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setEntries((x) => [data, ...x])
    setJTitle('')
    setJText('')
    const r = await addXp(user.id, XP.journal)
    if (r.ok) toast.push({ tone: 'success', text: `+${XP.journal} XP` })
  }

  return (
    <PageShell
      label="Planner"
      title="Planner"
      right={
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'tasks', label: 'Tasks' },
            { value: 'habits', label: 'Habits' },
            { value: 'mood', label: 'Mood' },
            { value: 'journal', label: 'Journal' },
          ]}
        />
      }
    >
      {tab === 'tasks' ? (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel>Tasks</SectionLabel>
            <Badge tone="muted">{tasks.filter((t) => !t.done).length} open</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <Input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Add a task…" />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded-xl border border-border bg-bg/40 px-3 py-2 text-sm text-text transition duration-200 focus:border-primary/50 outline-none"
            >
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>
            <Button onClick={addTask}>Add</Button>
          </div>

          {tasks.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No tasks yet" message="Add one. Then finish it. (+20 XP)" />
            </div>
          ) : (
            <div className="mt-6 grid gap-2">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg/30 px-3 py-2 transition duration-200 hover:shadow-glow"
                >
                  <label className="flex items-center gap-3 text-sm text-text">
                    <input type="checkbox" checked={!!t.done} onChange={() => toggleTask(t)} />
                    <span className={t.done ? 'line-through text-muted' : ''}>{t.text}</span>
                    <span
                      className={
                        'ml-2 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] ' +
                        (t.priority === 'high'
                          ? 'border-danger/30 bg-danger/10 text-danger'
                          : t.priority === 'low'
                            ? 'border-border bg-white/5 text-muted'
                            : 'border-gold/30 bg-gold/10 text-gold')
                      }
                    >
                      {t.priority}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="rounded-lg p-2 text-muted transition duration-200 hover:bg-white/5 hover:text-text"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {tab === 'habits' ? (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel>Habits</SectionLabel>
            <Badge tone="gold">
              {habitsDone}/{habits.length} today
            </Badge>
          </div>
          <div className="mt-3">
            <ProgressBar value={habits.length ? (habitsDone / habits.length) * 100 : 0} />
          </div>
          <div className="mt-4 flex items-center gap-2">
            {week.map((d) => (
              <div
                key={d.iso}
                className={
                  'grid h-9 w-9 place-items-center rounded-xl border text-xs font-bold transition duration-200 ' +
                  (d.isToday ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border bg-bg/30 text-muted')
                }
              >
                {d.name[0]}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[120px_1fr_auto]">
            <Input value={habitIcon} onChange={(e) => setHabitIcon(e.target.value)} placeholder="🙂" />
            <Input value={habitName} onChange={(e) => setHabitName(e.target.value)} placeholder="Add a habit…" />
            <Button onClick={addHabit}>Add</Button>
          </div>

          {habits.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No habits yet" message="Add one. Complete it daily. (+15 XP)" />
            </div>
          ) : (
            <div className="mt-6 grid gap-2">
              {habits.map((h) => {
                const done = habitDoneToday(h)
                return (
                  <div
                    key={h.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg/30 px-3 py-2 transition duration-200 hover:shadow-glow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-white/5">
                        <span className="text-lg">{h.icon}</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text">{h.name}</div>
                        <div className="text-xs text-muted">Streak: {h.streak ?? 0}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {week.map((d) => {
                          const arr = Array.isArray(h.completed_dates) ? h.completed_dates : []
                          const filled = arr.includes(d.iso)
                          return (
                            <div
                              key={d.iso}
                              className={
                                'h-2.5 w-2.5 rounded-full ring-1 transition duration-200 ' +
                                (filled ? 'bg-primary ring-primary/40' : 'bg-transparent ring-border/70')
                              }
                              title={d.iso}
                            />
                          )
                        })}
                      </div>
                      <Button onClick={() => completeHabit(h)} disabled={done} variant={done ? 'ghost' : 'primary'}>
                        {done ? 'Done' : `Complete (+${XP.habit} XP)`}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      ) : null}

      {tab === 'mood' ? (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel>Mood</SectionLabel>
            {moodToday ? <Badge tone="success">LOGGED</Badge> : <Badge tone="muted">TODAY</Badge>}
          </div>
          {moodToday ? (
            <div className="mt-4 rounded-2xl border border-border bg-bg/30 p-4">
              <div className="text-sm text-text">
                Today: <span className="font-bold">{moodToday.label}</span> ({moodToday.value}/5)
              </div>
              {moodToday.note ? <div className="mt-2 text-sm text-muted">{moodToday.note}</div> : null}
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { v: 1, e: '😖', l: 'awful' },
                  { v: 2, e: '😕', l: 'bad' },
                  { v: 3, e: '😐', l: 'okay' },
                  { v: 4, e: '🙂', l: 'good' },
                  { v: 5, e: '😁', l: 'amazing' },
                ].map((m) => (
                  <button
                    key={m.v}
                    onClick={() => setMoodValue(m.v)}
                    className={
                      'flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition duration-200 ' +
                      (m.v === moodValue ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border bg-white/5 text-text hover:bg-white/10')
                    }
                  >
                    <span className="text-lg">{m.e}</span>
                    {m.l}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <textarea
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="Optional note…"
                  className="min-h-24 w-full rounded-2xl border border-border bg-bg/40 px-3 py-2 text-sm text-text placeholder:text-muted outline-none transition duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="mt-3">
                <Button onClick={logMood}>Log (+{XP.mood} XP)</Button>
              </div>
            </>
          )}
        </Card>
      ) : null}

      {tab === 'journal' ? (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel>Journal</SectionLabel>
            <Badge tone={pinOk ? 'success' : 'muted'}>{pinOk ? 'UNLOCKED' : 'LOCKED'}</Badge>
          </div>
          {!pinOk ? (
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <Input
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder={pin ? 'Enter PIN' : 'Set a 4-6 digit PIN'}
              />
              <Button onClick={unlockOrSetPin}>{pin ? 'Unlock' : 'Set PIN'}</Button>
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3">
                <Input value={jTitle} onChange={(e) => setJTitle(e.target.value)} placeholder="Title" />
                <textarea
                  value={jText}
                  onChange={(e) => setJText(e.target.value)}
                  placeholder="Write…"
                  className="min-h-32 w-full rounded-2xl border border-border bg-bg/40 px-3 py-2 text-sm text-text placeholder:text-muted outline-none transition duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <Button onClick={addEntry}>Add entry (+{XP.journal} XP)</Button>
              </div>

              {entries.length === 0 ? (
                <div className="mt-6">
                  <EmptyState title="No entries yet" message="Write one. Your future self will thank you." />
                </div>
              ) : (
                <div className="mt-6 grid gap-3">
                  {entries.map((e) => (
                    <div key={e.id} className="rounded-2xl border border-border bg-bg/30 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-bold text-text">{e.title}</div>
                        <div className="text-xs text-muted mono">{new Date(e.created_at).toLocaleString()}</div>
                      </div>
                      <div className="mt-2 text-sm text-muted whitespace-pre-wrap">{e.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      ) : null}
    </PageShell>
  )
}

