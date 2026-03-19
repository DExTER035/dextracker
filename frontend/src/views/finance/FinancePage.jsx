import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { EmptyState } from '../../ui/components/EmptyState.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { Badge, Button, Card, Input, SectionLabel } from '../../ui/components/ui.jsx'
import { PageShell } from '../_shared/PageShell.jsx'

export function FinancePage() {
  const { user } = useAuth()
  const toast = useToast()
  const [tx, setTx] = useState([])
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [budget, setBudget] = useState('')

  const budgetKey = user?.id ? `dex:budget:${user.id}:${new Date().toISOString().slice(0, 7)}` : 'dex:budget:na'

  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      const { data } = await supabase
        .from('finance_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200)
      setTx(data ?? [])
      setBudget(localStorage.getItem(budgetKey) ?? '')
    })()
  }, [user?.id])

  async function addTx() {
    if (!user?.id) return
    const a = Number(amount)
    if (!a || a < 0) return
    const { data, error } = await supabase
      .from('finance_transactions')
      .insert({ user_id: user.id, type, amount: a, category, note: note.trim() || null })
      .select('*')
      .single()
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setTx((x) => [data, ...x])
    setAmount('')
    setNote('')
    toast.push({ tone: 'success', text: 'Transaction added.' })
  }

  async function delTx(id) {
    const { error } = await supabase.from('finance_transactions').delete().eq('id', id)
    if (error) return toast.push({ tone: 'danger', text: error.message })
    setTx((x) => x.filter((y) => y.id !== id))
  }

  const totals = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of tx) {
      const a = Number(t.amount ?? 0)
      if (t.type === 'income') income += a
      else expense += a
    }
    return { income, expense, balance: income - expense }
  }, [tx])

  const donut = useMemo(() => {
    const m = new Map()
    for (const t of tx.filter((x) => x.type === 'expense')) {
      m.set(t.category, (m.get(t.category) ?? 0) + Number(t.amount ?? 0))
    }
    const out = Array.from(m.entries()).map(([name, value]) => ({ name, value }))
    return out.length ? out : [{ name: 'No data', value: 1 }]
  }, [tx])

  const colors = ['#00d4aa', '#f59e0b', '#34d399', '#64748b', '#ef4444', '#1a2535']

  function saveBudget(v) {
    localStorage.setItem(budgetKey, v)
    setBudget(v)
    toast.push({ tone: 'success', text: 'Budget saved.' })
  }

  return (
    <PageShell label="Finance" title="Finance">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <SectionLabel>Total income</SectionLabel>
          <div className="mt-2 text-2xl font-bold text-text mono">₹{totals.income.toFixed(0)}</div>
        </Card>
        <Card>
          <SectionLabel>Total expenses</SectionLabel>
          <div className="mt-2 text-2xl font-bold text-text mono">₹{totals.expense.toFixed(0)}</div>
        </Card>
        <Card>
          <SectionLabel>Balance</SectionLabel>
          <div className="mt-2 text-2xl font-bold text-text mono">₹{totals.balance.toFixed(0)}</div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel>Add transaction</SectionLabel>
            <Badge tone={type === 'income' ? 'success' : 'danger'}>{type}</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-border bg-bg/40 px-3 py-2 text-sm text-text transition duration-200 focus:border-primary/50 outline-none"
            >
              <option value="income">income</option>
              <option value="expense">expense</option>
            </select>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-border bg-bg/40 px-3 py-2 text-sm text-text transition duration-200 focus:border-primary/50 outline-none"
            >
              {['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Other'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" />
          </div>
          <div className="mt-3">
            <Button onClick={addTx}>Add</Button>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-bg/30 p-4">
            <SectionLabel>Monthly budget</SectionLabel>
            <div className="mt-3 flex gap-2">
              <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Budget amount" />
              <Button variant="ghost" onClick={() => saveBudget(budget)}>
                Save
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted">Stored locally per month for now.</div>
          </div>
        </Card>

        <Card>
          <SectionLabel>By category</SectionLabel>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donut} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {donut.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1420', border: '1px solid #1a2535', borderRadius: 12, color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {tx.length === 0 ? (
        <EmptyState title="No transactions yet" message="Log spending/income to see your balance and charts." />
      ) : (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <SectionLabel>History</SectionLabel>
            <Badge tone="muted">{tx.length}</Badge>
          </div>
          <div className="mt-4 grid gap-2">
            {tx.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-border bg-bg/30 px-3 py-2">
                <div>
                  <div className="text-sm font-bold text-text">
                    {t.category}{' '}
                    <span className="mono text-muted">
                      ₹{Number(t.amount ?? 0).toFixed(0)} • {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {t.note ? <div className="text-xs text-muted">{t.note}</div> : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={t.type === 'income' ? 'success' : 'danger'}>{t.type}</Badge>
                  <button className="text-xs font-semibold text-muted hover:text-text transition duration-200" onClick={() => delTx(t.id)}>
                    delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  )
}

