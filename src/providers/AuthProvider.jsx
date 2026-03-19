import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { todayISO } from '../lib/date.js'

const AuthContext = createContext(null)

async function ensureUserRows(user) {
  if (!user?.id) return
  if (!isSupabaseConfigured || !supabase) return
  const email = user.email ?? null
  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    (email ? email.split('@')[0] : 'Demo')
  const avatar = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null

  await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email,
        name,
        avatar,
        last_active: todayISO(),
      },
      { onConflict: 'id' },
    )

  await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: user.id,
      },
      { onConflict: 'user_id' },
    )
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setSession(null)
      setLoading(false)
      return
    }
    let mounted = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return
        setSession(data.session ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (!mounted) return
        setSession(null)
        setLoading(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    const user = session?.user ?? null
    if (!user?.id) {
      setProfile(null)
      setSettings(null)
      return
    }

    let cancelled = false
    ;(async () => {
      if (!isSupabaseConfigured || !supabase) return
      await ensureUserRows(user)
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      ])
      if (cancelled) return
      setProfile(p ?? null)
      setSettings(s ?? null)
    })()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, profile, settings, loading }),
    [session, profile, settings, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}

