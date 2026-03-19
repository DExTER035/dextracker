import { useEffect, useMemo, useRef, useState } from 'react'
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { supabase } from '../../lib/supabase.js'
import { isoDays } from '../../lib/date.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { Tabs } from '../../ui/components/Tabs.jsx'
import { EmptyState } from '../../ui/components/EmptyState.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { Badge, Button, Card, Input, SectionLabel } from '../../ui/components/ui.jsx'
import { PageShell } from '../_shared/PageShell.jsx'

export function StudyPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('timer')

  // Timer
  const [subject, setSubject] = useState('')
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const tickRef = useRef(null)

  // Pomodoro
  const [pomoRunning, setPomoRunning] = useState(false)
  const [pomoMode, setPomoMode] = useState('work') // work/break
  const [pomoLeft, setPomoLeft] = useState(25 * 60)
  const [pomoCount, setPomoCount] = useState(0)
  const pomoRef = useRef(null)

  // Sessions
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      const { data } = await supabase.from('study_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200)
      setSessions(data ?? [])
    })()
  }, [user?.id])

  useEffect(() => {
    if (!running) return
    tickRef.current = window.setInterval(() => setElapsed((x) => x + 1), 1000)
    return () => window.clearInterval(tickRef.current)
  }, [running])

  function fmt(sec) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  async function saveTimerSession() {
    if (!user?.id) return
    const durMin = Math.max(1, Math.round(elapsed / 60))
    const subj = subject.trim() || 'General'
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({ user_id: user.id, subject: subj, duration: durMin, type: 'timer' })
      .select('*')
      .single()
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setSessions((x) => [data, ...x])
    setElapsed(0)
    setRunning(false)
    toast.push({ tone: 'success', text: 'Session saved.' })
  }

  useEffect(() => {
    if (!pomoRunning) return
    pomoRef.current = window.setInterval(() => {
      setPomoLeft((x) => {
        if (x <= 1) return 0
        return x - 1
      })
    }, 1000)
    return () => window.clearInterval(pomoRef.current)
  }, [pomoRunning])

  useEffect(() => {
    if (!pomoRunning) return
    if (pomoLeft !== 0) return
    if (pomoMode === 'work') {
      setPomoCount((x) => x + 1)
      setPomoMode('break')
      setPomoLeft(5 * 60)
    } else {
      setPomoMode('work')
      setPomoLeft(25 * 60)
    }
  }, [pomoLeft, pomoMode, pomoRunning])

  const chart = useMemo(() => {
    const days = isoDays(7)
    const map = new Map(days.map((d) => [d, 0]))
    for (const s of sessions) {
      const d = new Date(s.created_at).toISOString().slice(0, 10)
      if (map.has(d)) map.set(d, map.get(d) + Number(s.duration ?? 0))
    }
    return days.map((d) => ({ date: d.slice(5), hours: Number((map.get(d) / 60).toFixed(1)) }))
  }, [sessions])

  const subjectBreakdown = useMemo(() => {
    const m = new Map()
    for (const s of sessions) m.set(s.subject, (m.get(s.subject) ?? 0) + Number(s.duration ?? 0))
    return Array.from(m.entries())
      .map(([k, v]) => ({ subject: k, minutes: v }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 6)
  }, [sessions])

  return (
    <PageShell
      label="Study"
      title="Study"
      right={
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'timer', label: 'Timer' },
            { value: 'pomodoro', label: 'Pomodoro' },
            { value: 'sessions', label: 'Sessions' },
          ]}
        />
      }
    >
      {tab === 'timer' ? (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel>Timer</SectionLabel>
            <Badge tone={running ? 'success' : 'muted'}>{running ? 'ACTIVE' : 'IDLE'}</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setElapsed(0)} disabled={running}>
                Reset
              </Button>
              <Button onClick={() => setRunning((x) => !x)}>{running ? 'Stop' : 'Start'}</Button>
              <Button onClick={saveTimerSession} disabled={elapsed < 30}>
                Save
              </Button>
            </div>
          </div>
          <div className="mt-6 text-5xl font-bold text-text mono">{fmt(elapsed)}</div>
          <div className="mt-2 text-sm text-muted">Save writes a session to Supabase when stopped.</div>
        </Card>
      ) : null}

      {tab === 'pomodoro' ? (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel>Pomodoro</SectionLabel>
            <Badge tone={pomoMode === 'work' ? 'online' : 'gold'}>{pomoMode === 'work' ? 'WORK' : 'BREAK'}</Badge>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="text-5xl font-bold text-text mono">{fmt(pomoLeft)}</div>
            <div className="text-sm text-muted">Sessions: <span className="mono text-text">{pomoCount}</span></div>
          </div>
          <div className="mt-5 flex gap-2">
            <Button onClick={() => setPomoRunning((x) => !x)}>{pomoRunning ? 'Pause' : 'Start'}</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setPomoRunning(false)
                setPomoMode('work')
                setPomoLeft(25 * 60)
                setPomoCount(0)
              }}
            >
              Reset
            </Button>
          </div>
          <div className="mt-4 text-sm text-muted">25 min work / 5 min break, auto-switches.</div>
        </Card>
      ) : null}

      {tab === 'sessions' ? (
        sessions.length === 0 ? (
          <EmptyState title="No study sessions yet" message="Use Timer to save sessions. Charts will show here." />
        ) : (
          <>
            <Card>
              <div className="flex items-center justify-between gap-4">
                <SectionLabel>Last 7 days</SectionLabel>
                <Badge tone="muted">Hours</Badge>
              </div>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart}>
                    <XAxis dataKey="date" stroke="rgba(100,116,139,0.7)" />
                    <YAxis stroke="rgba(100,116,139,0.7)" />
                    <Tooltip contentStyle={{ background: '#0d1420', border: '1px solid #1a2535', borderRadius: 12, color: '#e2e8f0' }} />
                    <Bar dataKey="hours" fill="#00d4aa" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <SectionLabel>Subject breakdown</SectionLabel>
              <div className="mt-4 grid gap-2">
                {subjectBreakdown.map((s) => (
                  <div key={s.subject} className="flex items-center justify-between rounded-xl border border-border bg-bg/30 px-3 py-2">
                    <div className="text-sm font-bold text-text">{s.subject}</div>
                    <div className="text-sm text-muted mono">{Math.round(s.minutes / 60)}h {s.minutes % 60}m</div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )
      ) : null}
    </PageShell>
  )
}

