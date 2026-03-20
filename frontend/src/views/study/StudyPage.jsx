import { useEffect, useMemo, useRef, useState } from 'react'
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { fetchApi } from '../../lib/api.js'
import { isoDays, todayISO } from '../../lib/date.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { Tabs } from '../../ui/components/Tabs.jsx'
import { EmptyState } from '../../ui/components/EmptyState.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { Badge, Button, Card, Input, SectionLabel } from '../../ui/components/ui.jsx'
import { PageShell } from '../_shared/PageShell.jsx'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

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
      try {
        const data = await fetchApi(`/api/${user.id}/study`)
        const sorted = (data ?? []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
        setSessions(sorted.slice(0, 200))
      } catch {
        toast.push({ tone: 'danger', text: 'Failed to load study sessions.' })
      }
    })()
  }, [user?.id, toast])
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
    try {
      const data = await fetchApi(`/api/${user.id}/study`, {
        method: 'POST',
        body: JSON.stringify({ subject: subj, duration: durMin, type: 'timer', date: todayISO() })
      })
      setSessions((x) => [data, ...x])
      setElapsed(0)
      setRunning(false)
      toast.push({ tone: 'success', text: 'Session saved.' })
    } catch (error) {
       toast.push({ tone: 'danger', text: error.message })
    }
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      const d = s.date || (s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : '')
      if (d && map.has(d)) map.set(d, map.get(d) + Number(s.duration ?? 0))
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
      <AnimatePresence mode="wait">
        {tab === 'timer' && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
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
              <div className="mt-2 text-sm text-muted">Save writes a session to your custom backend when stopped.</div>
            </Card>
          </motion.div>
        )}

        {tab === 'pomodoro' && (
          <motion.div
            key="pomodoro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
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
          </motion.div>
        )}

        {tab === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {sessions.length === 0 ? (
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
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="date" stroke="rgba(100,116,139,0.7)" />
                        <YAxis stroke="rgba(100,116,139,0.7)" />
                        <Tooltip contentStyle={{ background: 'rgba(10, 12, 28, 0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '24px', color: '#ffffff', boxShadow: '0 0 15px rgba(139,92,246,0.2)' }} itemStyle={{ color: '#22d3ee' }} />
                        <Bar dataKey="hours" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}

