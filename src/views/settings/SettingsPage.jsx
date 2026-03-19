import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { Badge, Button, Card, Input, SectionLabel } from '../../ui/components/ui.jsx'
import { PageShell } from '../_shared/PageShell.jsx'

export function SettingsPage() {
  const { user, profile, settings } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(profile?.name ?? '')
  const [avatar, setAvatar] = useState(profile?.avatar ?? '')
  const [geminiKey, setGeminiKey] = useState(settings?.gemini_key ?? '')
  const [theme, setTheme] = useState(settings?.theme ?? 'dark')
  const [language, setLanguage] = useState(settings?.language ?? 'English')
  const [plannerColor, setPlannerColor] = useState(settings?.section_colors?.planner ?? '#00d4aa')
  const [healthColor, setHealthColor] = useState(settings?.section_colors?.health ?? '#00d4aa')
  const [financeColor, setFinanceColor] = useState(settings?.section_colors?.finance ?? '#00d4aa')
  const [notify, setNotify] = useState(!!settings?.notification_prefs?.enabled)

  const email = useMemo(() => profile?.email ?? user?.email ?? '', [profile?.email, user?.email])

  async function saveProfile() {
    if (!user?.id) return
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim() || null, avatar: avatar.trim() || null })
      .eq('id', user.id)
    if (error) return toast.push({ tone: 'danger', text: error.message })
    toast.push({ tone: 'success', text: 'Profile saved.' })
  }

  async function saveSettings() {
    if (!user?.id) return
    const section_colors = { planner: plannerColor, health: healthColor, finance: financeColor }
    const notification_prefs = { enabled: notify }
    const { error } = await supabase
      .from('user_settings')
      .upsert(
        { user_id: user.id, gemini_key: geminiKey.trim() || null, theme, language, section_colors, notification_prefs },
        { onConflict: 'user_id' },
      )
    if (error) return toast.push({ tone: 'danger', text: error.message })
    toast.push({ tone: 'success', text: 'Settings saved.' })
  }

  async function exportAll() {
    if (!user?.id) return
    const tables = [
      'profiles',
      'tasks',
      'habits',
      'mood_logs',
      'journal_entries',
      'health_food',
      'health_water',
      'health_sleep',
      'health_weight',
      'finance_transactions',
      'goals',
      'study_sessions',
      'fitness_workouts',
      'user_settings',
    ]
    const results = {}
    for (const t of tables) {
      const col = t === 'profiles' ? 'id' : t === 'user_settings' ? 'user_id' : 'user_id'
      const { data, error } = await supabase.from(t).select('*').eq(col, user.id)
      if (error) {
        toast.push({ tone: 'danger', text: `Export failed: ${t}` })
        return
      }
      results[t] = data ?? []
    }
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dextracker-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageShell label="Settings" title="Settings">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <SectionLabel>Profile</SectionLabel>
          <Badge tone="muted">{email || '—'}</Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="Avatar URL" />
          <Button onClick={saveProfile}>Save</Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <SectionLabel>AI</SectionLabel>
          <Badge tone="muted">GEMINI 1.5 FLASH</Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <Input value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="Gemini API key" />
          <Button onClick={saveSettings}>Save</Button>
        </div>
        <div className="mt-2 text-xs text-muted">Saved to Supabase `user_settings` for your account.</div>
      </Card>

      <Card>
        <SectionLabel>Preferences</SectionLabel>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="rounded-xl border border-border bg-bg/40 px-3 py-2 text-sm text-text transition duration-200 focus:border-primary/50 outline-none"
          >
            <option value="dark">dark</option>
            <option value="light">light</option>
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-xl border border-border bg-bg/40 px-3 py-2 text-sm text-text transition duration-200 focus:border-primary/50 outline-none"
          >
            {['English', 'Hindi', 'Marathi'].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-bg/30 px-3 py-2 text-sm text-text">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Notifications
          </label>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-bg/30 p-4">
          <SectionLabel>Section accent colors</SectionLabel>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 text-sm text-text">
              <span className="text-xs text-muted uppercase tracking-[0.24em]">Planner</span>
              <Input value={plannerColor} onChange={(e) => setPlannerColor(e.target.value)} />
            </label>
            <label className="grid gap-2 text-sm text-text">
              <span className="text-xs text-muted uppercase tracking-[0.24em]">Health</span>
              <Input value={healthColor} onChange={(e) => setHealthColor(e.target.value)} />
            </label>
            <label className="grid gap-2 text-sm text-text">
              <span className="text-xs text-muted uppercase tracking-[0.24em]">Finance</span>
              <Input value={financeColor} onChange={(e) => setFinanceColor(e.target.value)} />
            </label>
          </div>
          <div className="mt-3">
            <Button variant="ghost" onClick={saveSettings}>
              Save preferences
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionLabel>Export</SectionLabel>
        <div className="mt-3 text-sm text-muted">Download all your Supabase data as JSON.</div>
        <div className="mt-4">
          <Button onClick={exportAll}>Export JSON</Button>
        </div>
      </Card>
    </PageShell>
  )
}

