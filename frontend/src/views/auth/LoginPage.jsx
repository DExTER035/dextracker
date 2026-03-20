import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { Button, Card } from '../../ui/components/ui.jsx'
import { Activity, Chrome } from 'lucide-react'

export function LoginPage() {
  const { session, loading, login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onGoogle() {
    setError('')
    setBusy(true)
    try {
      // Mocking Google Auth since we don't have true OAuth flow in this custom backend setup yet
      await login({
        email: 'user@google.com',
        name: 'Google User',
        googleId: 'google-mock-id',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser'
      })
      navigate('/')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function onDemo() {
    setError('')
    setBusy(true)
    try {
      await login({
        email: 'demo@dextracker.app',
        name: 'Demo User',
        googleId: 'demo-system-id',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser'
      })
      navigate('/')
    } catch (e) {
      setError(`Demo login failed: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  if (!loading && session) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen px-6 py-10 flex items-center justify-center bg-[#04060A]">
      <Card className="w-full max-w-md bg-[#0f172a]/80 shadow-[0_0_30px_rgba(6,182,212,0.15)] rounded-3xl border border-[#1e293b]">
        <div className="flex items-center gap-4 border-b border-white/5 pb-6 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.3)]">
             <span className="text-2xl drop-shadow-[0_0_8px_rgba(249,115,22,1)]" style={{ filter: 'hue-rotate(15deg) contrast(1.5)' }}>⚡</span>
          </div>
          <div className="leading-tight">
            <div className="text-2xl font-bold text-white tracking-wide">
              Life<span className="text-white">OS</span>
            </div>
            <div className="text-sm text-[#06b6d4]">Track life. Earn XP.</div>
          </div>
        </div>

        <div className="grid gap-4">
          <Button onClick={onGoogle} disabled={busy} className="w-full justify-center bg-white/5 text-white hover:bg-white/10 shadow-none ring-1 ring-white/10" variant="ghost">
            <Chrome size={18} className="mr-2" />
            Continue with Google
          </Button>
          <Button onClick={onDemo} disabled={busy} className="w-full justify-center bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            Try Demo Account
          </Button>
          {error ? (
            <div className="mt-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-3 text-sm text-red-400 text-center font-medium">
              {error}
            </div>
          ) : null}
          <div className="mt-4 text-xs text-white/40 leading-relaxed text-center px-4">
            Connected to Custom Node.js Backend. Data is saved locally in the /data folder.
          </div>
        </div>
      </Card>
    </div>
  )
}

