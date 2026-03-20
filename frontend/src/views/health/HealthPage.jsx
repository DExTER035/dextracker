import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, AreaChart, Area } from 'recharts'
import { fetchApi } from '../../lib/api.js'
import { isoDays, todayISO } from '../../lib/date.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { Tabs } from '../../ui/components/Tabs.jsx'
import { EmptyState } from '../../ui/components/EmptyState.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { Badge, Button, Card, Input, ProgressBar, SectionLabel } from '../../ui/components/ui.jsx'
import { PageShell } from '../_shared/PageShell.jsx'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

export function HealthPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('food')

  const today = todayISO()

  // Food
  const [food, setFood] = useState([])
  const [fName, setFName] = useState('')
  const [cal, setCal] = useState('')
  const [p, setP] = useState('')
  const [c, setC] = useState('')
  const [fat, setFat] = useState('')

  // Water
  const [water, setWater] = useState({ glasses: 0 })

  // Sleep
  const [sleep, setSleep] = useState({ hours: '', quality: 3 })
  const [sleep7, setSleep7] = useState([])

  // Weight
  const [weight, setWeight] = useState({ weight: '' })
  const [goalWeight, setGoalWeight] = useState('')
  const [weight7, setWeight7] = useState([])

  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      try {
        const [foodData, healthData, sleepData, bodyData] = await Promise.all([
          fetchApi(`/api/${user.id}/food`),
          fetchApi(`/api/${user.id}/health`),
          fetchApi(`/api/${user.id}/sleep`),
          fetchApi(`/api/${user.id}/body`),
        ])
        
        const todaysFood = foodData.filter(x => x.date?.startsWith(today) || x.createdAt?.startsWith(today))
        setFood(todaysFood.reverse() || [])
        
        const todaysHealth = healthData.filter(h => h.date === today)
        const waterLog = todaysHealth.find(h => h.type === 'water')
        setWater(waterLog ?? { glasses: 0, amount: 0 })
        
        const todaysSleep = sleepData.find(s => s.date === today)
        setSleep(todaysSleep ? { hours: String(todaysSleep.hours ?? ''), quality: todaysSleep.quality ?? 3 } : { hours: '', quality: 3 })
        
        const todaysBody = bodyData.find(b => b.date === today)
        setWeight(todaysBody ? { weight: String(todaysBody.weight ?? '') } : { weight: '' })

        const days = isoDays(7)
        const s7 = sleepData.filter(s => days.includes(s.date))
        const w7 = bodyData.filter(b => days.includes(b.date))
        
        const sleepMap = new Map((s7 ?? []).map((x) => [x.date, x]))
        const weightMap = new Map((w7 ?? []).map((x) => [x.date, x]))
        setSleep7(
          days.map((d) => ({
            date: d.slice(5),
            hours: Number(sleepMap.get(d)?.hours ?? 0),
            quality: Number(sleepMap.get(d)?.quality ?? 0),
          })),
        )
        setWeight7(
          days.map((d) => ({
            date: d.slice(5),
            weight: Number(weightMap.get(d)?.weight ?? 0),
          })),
        )
      } catch {
        toast.push({ tone: 'danger', text: 'Error loading health data' })
      }

      const gwKey = `dex:goalWeight:${user.id}`
      setGoalWeight(localStorage.getItem(gwKey) ?? '')
    })()
  }, [user?.id, today, toast])

  async function addFood() {
    if (!user?.id) return
    const name = fName.trim()
    if (!name) return
    const row = {
      name,
      calories: Number(cal || 0),
      protein: Number(p || 0),
      carbs: Number(c || 0),
      fat: Number(fat || 0),
      date: today
    }
    try {
      const data = await fetchApi(`/api/${user.id}/food`, { method: 'POST', body: JSON.stringify(row) })
      setFood((x) => [data, ...x])
      setFName('')
      setCal('')
      setP('')
      setC('')
      setFat('')
      toast.push({ tone: 'success', text: 'Food logged.' })
    } catch (error) {
       toast.push({ tone: 'danger', text: error.message })
    }
  }

  async function deleteFood(id) {
    try {
      await fetchApi(`/api/${user.id}/food/${id}`, { method: 'DELETE' })
      setFood((x) => x.filter((y) => y.id !== id))
    } catch { /* ignore */ }
  }

  const totals = useMemo(() => {
    return food.reduce(
      (a, x) => {
        a.cal += x.calories ?? 0
        a.p += x.protein ?? 0
        a.c += x.carbs ?? 0
        a.f += x.fat ?? 0
        return a
      },
      { cal: 0, p: 0, c: 0, f: 0 },
    )
  }, [food])

  async function setWaterGlasses(next) {
    if (!user?.id) return
    const glasses = Math.max(0, Math.min(20, next))
    try {
      const data = await fetchApi(`/api/${user.id}/health`, {
        method: 'POST',
        body: JSON.stringify({ type: 'water', glasses, amount: glasses, date: today })
      })
      setWater(data)
    } catch (error) {
      toast.push({ tone: 'danger', text: error.message })
    }
  }

  async function saveSleep() {
    if (!user?.id) return
    const hours = Number(sleep.hours || 0)
    const quality = Number(sleep.quality || 3)
    try {
      await fetchApi(`/api/${user.id}/sleep`, {
        method: 'POST',
        body: JSON.stringify({ hours, quality, date: today })
      })
      toast.push({ tone: 'success', text: 'Sleep saved.' })
    } catch (error) {
      toast.push({ tone: 'danger', text: error.message })
    }
  }

  async function saveWeight() {
    if (!user?.id) return
    const w = Number(weight.weight || 0)
    if (!w) return
    try {
      await fetchApi(`/api/${user.id}/body`, {
        method: 'POST',
        body: JSON.stringify({ weight: w, date: today })
      })
      toast.push({ tone: 'success', text: 'Weight saved.' })
      setWeight7((x) => x.map((d) => (d.date === today.slice(5) ? { ...d, weight: w } : d)))
    } catch(err) {
      toast.push({ tone: 'danger', text: err.message })
    }
  }

  function saveGoalWeight(v) {
    if (!user?.id) return
    const gwKey = `dex:goalWeight:${user.id}`
    localStorage.setItem(gwKey, v)
    setGoalWeight(v)
  }

  return (
    <PageShell
      label="Health"
      title="Health"
      right={
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'food', label: 'Food' },
            { value: 'water', label: 'Water' },
            { value: 'sleep', label: 'Sleep' },
            { value: 'weight', label: 'Weight' },
          ]}
        />
      }
    >
      <AnimatePresence mode="wait">
        {tab === 'food' && (
          <motion.div
            key="food"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <div className="flex items-center justify-between gap-4">
                <SectionLabel>Food</SectionLabel>
                <Badge tone="muted" className="mono">
                  {totals.cal} kcal
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-5">
                <Input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Food name" />
                <Input value={cal} onChange={(e) => setCal(e.target.value)} placeholder="Calories" />
                <Input value={p} onChange={(e) => setP(e.target.value)} placeholder="Protein" />
                <Input value={c} onChange={(e) => setC(e.target.value)} placeholder="Carbs" />
                <Input value={fat} onChange={(e) => setFat(e.target.value)} placeholder="Fat" />
              </div>
              <div className="mt-3">
                <Button onClick={addFood}>Log food</Button>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-xs text-muted uppercase tracking-[0.24em]">
                    <span>Protein</span>
                    <span className="mono">{totals.p}g</span>
                  </div>
                  <ProgressBar value={Math.min(100, (totals.p / 120) * 100)} />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-xs text-muted uppercase tracking-[0.24em]">
                    <span>Carbs</span>
                    <span className="mono">{totals.c}g</span>
                  </div>
                  <ProgressBar value={Math.min(100, (totals.c / 200) * 100)} />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-xs text-muted uppercase tracking-[0.24em]">
                    <span>Fat</span>
                    <span className="mono">{totals.f}g</span>
                  </div>
                  <ProgressBar value={Math.min(100, (totals.f / 70) * 100)} />
                </div>
              </div>

              {food.length === 0 ? (
                <div className="mt-6">
                  <EmptyState title="No food logged today" message="Log your meals to see totals and macro bars." />
                </div>
              ) : (
                <div className="mt-6 grid gap-2">
                  {food.map((x) => (
                    <div key={x.id} className="flex items-center justify-between rounded-xl border border-border bg-bg/30 px-3 py-2">
                      <div className="text-sm text-text">
                        <span className="font-bold">{x.name}</span>{' '}
                        <span className="text-muted mono">
                          {x.calories} kcal • P{x.protein} C{x.carbs} F{x.fat}
                        </span>
                      </div>
                      <button className="text-xs font-semibold text-muted hover:text-text transition duration-200" onClick={() => deleteFood(x.id)}>
                        delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {tab === 'water' && (
          <motion.div
            key="water"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <div className="flex items-center justify-between gap-4">
                <SectionLabel>Water</SectionLabel>
                <Badge tone="gold" className="mono">
                  {water.glasses ?? 0}/8 glasses
                </Badge>
              </div>
              <div className="mt-3">
                <ProgressBar value={((water.glasses ?? 0) / 8) * 100} tone="gold" />
              </div>
              <div className="mt-5 flex items-center gap-3">
                <Button variant="ghost" onClick={() => setWaterGlasses((water.glasses ?? 0) - 1)}>
                  -
                </Button>
                <div className="text-2xl font-bold text-text mono">{water.glasses ?? 0}</div>
                <Button onClick={() => setWaterGlasses((water.glasses ?? 0) + 1)}>+</Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={
                      'h-10 w-8 rounded-xl border transition duration-200 ' +
                      (i < (water.glasses ?? 0) ? 'border-primary/40 bg-primary/15' : 'border-border bg-bg/30')
                    }
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {tab === 'sleep' && (
          <motion.div
            key="sleep"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <div className="flex items-center justify-between gap-4">
                <SectionLabel>Sleep</SectionLabel>
                <Badge tone="muted">Last 7 days</Badge>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Input value={sleep.hours} onChange={(e) => setSleep((x) => ({ ...x, hours: e.target.value }))} placeholder="Hours" />
                <select
                  value={sleep.quality}
                  onChange={(e) => setSleep((x) => ({ ...x, quality: Number(e.target.value) }))}
                  className="rounded-xl border border-border bg-bg/40 px-3 py-2 text-sm text-text transition duration-200 focus:border-primary/50 outline-none"
                >
                  {[1, 2, 3, 4, 5].map((q) => (
                    <option key={q} value={q}>
                      Quality {q}
                    </option>
                  ))}
                </select>
                <Button onClick={saveSleep}>Save</Button>
              </div>
              <div className="mt-6 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sleep7}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(100,116,139,0.7)" />
                    <YAxis stroke="rgba(100,116,139,0.7)" />
                    <Tooltip contentStyle={{ background: 'rgba(10, 12, 28, 0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '24px', color: '#ffffff', boxShadow: '0 0 15px rgba(139,92,246,0.2)' }} itemStyle={{ color: '#22d3ee' }} />
                    <Area type="monotone" dataKey="hours" stroke="#22d3ee" fillOpacity={1} fill="url(#colorHours)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}

        {tab === 'weight' && (
          <motion.div
            key="weight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <div className="flex items-center justify-between gap-4">
                <SectionLabel>Weight</SectionLabel>
                <Badge tone="muted">Last 7 days</Badge>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <Input value={weight.weight} onChange={(e) => setWeight({ weight: e.target.value })} placeholder="Current weight" />
                <Input value={goalWeight} onChange={(e) => saveGoalWeight(e.target.value)} placeholder="Goal weight" />
                <Button onClick={saveWeight}>Save</Button>
              </div>
              <div className="mt-6 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weight7}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(100,116,139,0.7)" />
                    <YAxis stroke="rgba(100,116,139,0.7)" />
                    <Tooltip contentStyle={{ background: 'rgba(10, 12, 28, 0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '24px', color: '#ffffff', boxShadow: '0 0 15px rgba(139,92,246,0.2)' }} itemStyle={{ color: '#fb923c' }} />
                    <Bar dataKey="weight" fill="#fb923c" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}

