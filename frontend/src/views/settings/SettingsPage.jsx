import { useMemo, useState } from 'react'
import { fetchApi } from '../../lib/api.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { Badge, Button, Card, Input, SectionLabel } from '../../ui/components/ui.jsx'
import { PageShell } from '../_shared/PageShell.jsx'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

export function SettingsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(user?.name ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? '')
  const [geminiKey, setGeminiKey] = useState(user?.settings?.gemini_key ?? '')
  const [theme, setTheme] = useState(user?.settings?.theme ?? 'dark')
  const [language, setLanguage] = useState(user?.settings?.language ?? 'English')
  const [plannerColor, setPlannerColor] = useState(user?.settings?.section_colors?.planner ?? '#00d4aa')
  const [healthColor, setHealthColor] = useState(user?.settings?.section_colors?.health ?? '#fb7185')
  const [financeColor, setFinanceColor] = useState(user?.settings?.section_colors?.finance ?? '#00d4aa')
  const [notify, setNotify] = useState(!!user?.settings?.notification_prefs?.enabled)

  const email = useMemo(() => user?.email ?? '', [user?.email])

  async function saveProfile() {
    if (!user?.id) return
    try {
      const freshUser = await fetchApi(`/api/auth/user/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim() || null, avatar: avatar.trim() || null })
      })
      localStorage.setItem('dextracker_user', JSON.stringify(freshUser))
      toast.push({ tone: 'success', text: 'Profile saved. Refreshing...' })
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      toast.push({ tone: 'danger', text: err.message })
    }
  }

  async function saveSettings() {
    if (!user?.id) return
    const section_colors = { planner: plannerColor, health: healthColor, finance: financeColor }
    const notification_prefs = { enabled: notify }
    const newSettings = { gemini_key: geminiKey.trim() || null, theme, language, section_colors, notification_prefs }
    try {
      const freshUser = await fetchApi(`/api/auth/user/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ settings: newSettings })
      })
      localStorage.setItem('dextracker_user', JSON.stringify(freshUser))
      toast.push({ tone: 'success', text: 'Settings saved. Refreshing...' })
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      toast.push({ tone: 'danger', text: err.message })
    }
  }

  async function exportAll() {
    if (!user?.id) return
    const endpoints = [
      `/api/auth/user/${user.id}`,
      `/api/${user.id}/tasks`,
      `/api/${user.id}/habits`,
      `/api/${user.id}/mood`,
      `/api/${user.id}/journal`,
      `/api/${user.id}/food`,
      `/api/${user.id}/health`,
      `/api/${user.id}/sleep`,
      `/api/${user.id}/body`,
      `/api/${user.id}/money`,
      `/api/${user.id}/budget`,
      `/api/${user.id}/study`,
      `/api/${user.id}/goals`,
      `/api/${user.id}/xp-history`,
    ]
    const results = {}
    
    for (const ep of endpoints) {
      try {
        const data = await fetchApi(ep)
        const name = ep.split('/').pop()
        results[name === user.id ? 'profile' : name] = data ?? []
      } catch {
        toast.push({ tone: 'danger', text: `Export failed for: ${ep}` })
      }
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid gap-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex items-center justify-between gap-4">
              <SectionLabel>AI</SectionLabel>
              <Badge tone="muted">GEMINI 1.5 FLASH</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <Input value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="Gemini API key" />
              <Button onClick={saveSettings}>Save</Button>
            </div>
            <div className="mt-2 text-xs text-muted">Saved to your custom backend profile settings.</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <SectionLabel>Export</SectionLabel>
            <div className="mt-3 text-sm text-muted">Download all your local backend data as JSON.</div>
            <div className="mt-4">
              <Button onClick={exportAll}>Export JSON</Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageShell>
  )
}

