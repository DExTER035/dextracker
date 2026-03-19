import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../../lib/supabase.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { Button, Card } from '../../ui/components/ui.jsx'
import { Activity, Chrome } from 'lucide-react'

export function LoginPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const redirectTo = useMemo(() => `${window.location.origin}/`, [])

  async function onGoogle() {
    setError('')
    setBusy(true)
    if (!isSupabaseConfigured || !supabase) {
      setBusy(false)
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart dev server.')
      return
    }
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    setBusy(false)
    if (e) setError(e.message)
  }

  async function onDemo() {
    setError('')
    setBusy(true)
    if (!isSupabaseConfigured || !supabase) {
      setBusy(false)
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart dev server.')
      return
    }
    // Requires Supabase setting: Auth -> Providers -> Anonymous Sign-ins enabled.
    const { error: e } = await supabase.auth.signInAnonymously()
    setBusy(false)
    if (e) setError(`Demo login failed: ${e.message}`)
    else navigate('/')
  }

  if (!loading && session) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen px-6 py-10 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
            <Activity className="text-primary" size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-xl font-bold text-text">DexTracker</div>
            <div className="text-sm text-muted">Track life. Earn XP. Stay honest.</div>
          </div>
        </div>

        <div className="mt-8 grid gap-3">
          <Button onClick={onGoogle} disabled={busy} className="w-full justify-center" variant="ghost">
            <Chrome size={16} />
            Continue with Google
          </Button>
          <Button onClick={onDemo} disabled={busy} className="w-full justify-center">
            Demo Account
          </Button>
          {!isSupabaseConfigured ? (
            <div className="mt-2 rounded-xl border border-gold/35 bg-gold/10 px-3 py-2 text-sm text-gold">
              Supabase env vars are placeholders. Update <span className="mono">.env</span> and restart <span className="mono">npm run dev</span>.
            </div>
          ) : null}
          {error ? (
            <div className="mt-2 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          ) : null}
          <div className="mt-4 text-xs text-muted leading-relaxed">
            Set <span className="font-mono">VITE_SUPABASE_URL</span> and{' '}
            <span className="font-mono">VITE_SUPABASE_ANON_KEY</span> in <span className="font-mono">.env</span>.
          </div>
        </div>
      </Card>
    </div>
  )
}

